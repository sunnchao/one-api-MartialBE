package relay_util

import (
	"context"
	"errors"
	"fmt"
	"math"
	"net/http"
	"one-api/common"
	"one-api/common/config"
	"one-api/common/logger"
	"one-api/model"
	"one-api/types"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type Quota struct {
	modelName        string
	promptTokens     int
	price            model.Price
	groupName        string
	isBackupGroup    bool // 新增字段记录是否使用备用分组
	backupGroupName  string
	groupRatio       float64
	inputRatio       float64
	outputRatio      float64
	isSearch         bool
	searchRatio      float64
	searchPrice      model.Price
	preConsumedQuota int
	cacheQuota       int
	userId           int
	channelId        int
	tokenId          int
	unlimitedQuota   bool
	HandelStatus     bool

	startTime         time.Time
	firstResponseTime time.Time
	extraBillingData  map[string]ExtraBillingData

	// ClaudeCode订阅相关字段
	packageServiceType  string                    // 服务类型 (claude_code, codex_code, gemini_code)
	subscriptionHashId  string                    // 使用的订阅ID（第一个成功扣费的订阅）
	useSubscription     bool                      // 是否使用订阅计费
	subscriptionQuota   int                       // 从订阅消费的总额度
	subscriptionHandled bool                      // 订阅是否已处理
	subscriptionsUsed   []SubscriptionUsageDetail // 多订阅消费明细
	quotaFromBalance    int                       // 从普通余额扣除的额度
}

func NewQuota(c *gin.Context, modelName string, promptTokens int) (*Quota, *types.OpenAIErrorWithStatusCode) {
	isBackupGroup := c.GetBool("is_backupGroup")

	quota := &Quota{
		modelName:      modelName,
		promptTokens:   promptTokens,
		userId:         c.GetInt("id"),
		channelId:      c.GetInt("channel_id"),
		tokenId:        c.GetInt("token_id"),
		HandelStatus:   false,
		unlimitedQuota: c.GetBool("token_unlimited_quota"),
		isSearch:       modelName == "search",
		isBackupGroup:  isBackupGroup, // 记录是否使用备用分组
	}

	price, err := model.PricingInstance.GetPrice(quota.modelName)
	if err != nil {
		if errors.Is(err, model.ErrModelPriceNotSet) {
			return nil, common.StringErrorWrapperLocal(err.Error(), "model_price_not_set", http.StatusBadRequest)
		}
		return nil, common.ErrorWrapperLocal(err, "get_model_price_failed", http.StatusInternalServerError)
	}

	quota.price = *price
	quota.groupName = c.GetString("token_group")

	// 优先使用当前实际使用的备用分组，如果没有则使用原始备用分组配置
	quota.backupGroupName = c.GetString("current_backup_group")
	if quota.backupGroupName == "" {
		quota.backupGroupName = c.GetString("token_backup_group")
	}

	quota.groupRatio = c.GetFloat64("group_ratio") // 这里的倍率已经在 common.go 中正确设置了
	if quota.isSearch {
		quota.channelId = 0
		quota.groupRatio = 1
		quota.groupName = ""
	}
	quota.inputRatio = quota.price.GetInput() * quota.groupRatio
	quota.outputRatio = quota.price.GetOutput() * quota.groupRatio

	// 检测服务类型：默认取 context，若使用备用分组则基于备用分组重新解析
	packageServiceTypeStr := c.GetString("package_service_type")
	if quota.isBackupGroup && quota.backupGroupName != "" {
		packageServiceTypeStr = resolvePackageServiceTypeByTokenGroup(quota.backupGroupName)
	}

	if packageServiceTypeStr != "" {
		quota.packageServiceType = packageServiceTypeStr

		// 尝试获取用户可用的订阅
		subscription, subErr := model.GetUserActivePackagesSubscription(quota.userId, packageServiceTypeStr)
		if subErr == nil && subscription != nil && subscription.CanUseService() {
			quota.useSubscription = true
			quota.subscriptionHashId = subscription.HashId
		}
	}

	return quota, nil

}

func (q *Quota) PreQuotaConsumption() *types.OpenAIErrorWithStatusCode {
	if q.price.Type == model.TimesPriceType {
		q.preConsumedQuota = int(1000 * q.inputRatio)
	} else if q.price.Input != 0 || q.price.Output != 0 {
		q.preConsumedQuota = int(float64(q.promptTokens)*q.inputRatio) + config.PreConsumedQuota
	}

	if q.preConsumedQuota == 0 {
		return nil
	}

	userQuota, err := model.CacheGetUserQuota(q.userId)
	if err != nil {
		return common.ErrorWrapper(err, "get_user_quota_failed", http.StatusInternalServerError)
	}

	if userQuota < q.preConsumedQuota {
		return common.ErrorWrapper(fmt.Errorf("user [%d] quota is not enough, userQuota: %d", q.userId, userQuota), "insufficient_user_quota", http.StatusPaymentRequired)
	}

	err = model.CacheDecreaseUserQuota(q.userId, q.preConsumedQuota)
	if err != nil {
		return common.ErrorWrapper(err, "decrease_user_quota_failed", http.StatusInternalServerError)
	}

	if userQuota > 100*q.preConsumedQuota {
		// in this case, we do not pre-consume quota
		// because the user has enough quota
		q.preConsumedQuota = 0
		// common.LogInfo(c.Request.Context(), fmt.Sprintf("user %d has enough quota %d, trusted and no need to pre-consume", userId, userQuota))
	}

	if q.preConsumedQuota > 0 {
		err := model.PreConsumeTokenQuota(q.tokenId, q.preConsumedQuota)
		if err != nil {
			return common.ErrorWrapper(err, "pre_consume_token_quota_failed", http.StatusForbidden)
		}
		q.HandelStatus = true
	}

	return nil
}

// 更新用户实时配额
func (q *Quota) UpdateUserRealtimeQuota(usage *types.UsageEvent, nowUsage *types.UsageEvent) error {
	usage.Merge(nowUsage)

	// 不开启Redis，则不更新实时配额
	if !config.RedisEnabled {
		return nil
	}

	promptTokens, completionTokens := q.getComputeTokensByUsageEvent(nowUsage)
	increaseQuota := q.GetTotalQuota(promptTokens, completionTokens, nil)

	cacheQuota, err := model.CacheIncreaseUserRealtimeQuota(q.userId, increaseQuota)
	if err != nil {
		return errors.New("error update user realtime quota cache: " + err.Error())
	}

	q.cacheQuota += increaseQuota
	userQuota, err := model.CacheGetUserQuota(q.userId)
	if err != nil {
		return errors.New("error get user quota cache: " + err.Error())
	}

	if cacheQuota >= int64(userQuota) {
		return fmt.Errorf("user [%d] quota is not enough, userQuota: %d", q.userId, userQuota)
	}

	return nil
}

func (q *Quota) completedQuotaConsumption(usage *types.Usage, tokenName string, tokenId int, isStream bool, sourceIp string, ctx context.Context) error {
	defer func() {
		if q.cacheQuota > 0 {
			model.CacheDecreaseUserRealtimeQuota(q.userId, q.cacheQuota)
		}
	}()

	quota := q.GetTotalQuotaByUsage(usage)

	if q.isSearch {
		logger.LogInfo(ctx, "search quota consumption: "+fmt.Sprintf("%d", quota))
	}

	// 优先使用订阅扣费（仅对 ClaudeCode/CodexCode/GeminiCode 请求）
	if q.useSubscription && quota > 0 && q.packageServiceType != "" {
		// 获取用户所有活跃订阅，按到期时间升序排序（优先消耗快到期的）
		var tokenGroupName string
		if q.backupGroupName != "" {
			tokenGroupName = q.backupGroupName
		} else {
			tokenGroupName = q.groupName
		}

		var subscription model.PackagesSubscription
		//if q.packageServiceType != "" {
		//	subscription.ServiceType = q.packageServiceType
		//}
		subscription.DeductionGroup = tokenGroupName

		subscriptions, err := model.GetUserActivePackagesSubscriptions(q.userId, subscription, true)
		if err == nil && len(subscriptions) > 0 {
			remainingQuota := quota
			q.subscriptionsUsed = make([]SubscriptionUsageDetail, 0, len(subscriptions))

			// 依次从订阅中扣费，优先消耗快到期的
			for i := range subscriptions {
				if remainingQuota <= 0 {
					break
				}

				sub := &subscriptions[i]

				deducted, updateErr := model.UpdateSubscriptionPackageUsage(sub.Id, remainingQuota, tokenGroupName)
				if updateErr != nil {
					logger.LogError(ctx, "subscription deduction failed: "+updateErr.Error())
					continue
				}

				if deducted <= 0 {
					continue
				}

				q.subscriptionQuota += deducted
				remainingQuota -= deducted

				// 记录该订阅的消费明细
				q.subscriptionsUsed = append(q.subscriptionsUsed, SubscriptionUsageDetail{
					SubscriptionId: sub.Id,
					PlanType:       sub.PlanType,
					Quota:          deducted,
					EndTime:        sub.EndTime,
				})

				// 如果是第一个成功扣费的订阅，记录订阅ID
				if !q.subscriptionHandled {
					q.subscriptionHashId = sub.HashId
					q.subscriptionHandled = true
				}
			}

			// 如果成功从订阅扣费（至少扣了一部分）
			if q.subscriptionHandled && q.subscriptionQuota > 0 {
				// 订阅扣费成功，退还预消费的配额
				if q.preConsumedQuota > 0 {
					go func() {
						err := model.PostConsumeTokenQuotaWithInfo(q.tokenId, q.userId, q.unlimitedQuota, -q.preConsumedQuota)
						if err != nil {
							logger.LogError(ctx, "error refunding pre-consumed quota after subscription: "+err.Error())
						}
					}()
					// 已经全部退还预消费额度，后续按剩余余额部分结算
					q.preConsumedQuota = 0
				}

				// 如果订阅完全覆盖了消费，记录日志并返回
				if remainingQuota <= 0 {
					// 记录订阅消费日志（完全由订阅覆盖）
					model.RecordConsumeLog(
						ctx,
						q.userId,
						q.channelId,
						usage.PromptTokens,
						usage.CompletionTokens,
						q.modelName,
						tokenName,
						tokenId,
						q.subscriptionQuota,
						"resource_package", // 标记为资源包消费
						q.getRequestTime(),
						isStream,
						false,
						q.getSubscriptionLogMeta(usage),
						sourceIp,
					)
					return nil
				}

				// 否则，剩余部分需要从普通额度扣费
				q.quotaFromBalance = remainingQuota
				quota = remainingQuota
			}
		}

		// 如果订阅扣费失败或没有可用订阅，继续使用普通扣费逻辑
		if !q.subscriptionHandled {
			logger.LogInfo(ctx, "subscription consumption failed or no available subscription, fallback to normal quota")
			q.useSubscription = false
		}
	}

	if quota > 0 {
		quotaDelta := quota - q.preConsumedQuota
		err := model.PostConsumeTokenQuotaWithInfo(q.tokenId, q.userId, q.unlimitedQuota, quotaDelta)
		if err != nil {
			return errors.New("error consuming token remain quota: " + err.Error())
		}
		err = model.CacheUpdateUserQuota(q.userId)
		if err != nil {
			return errors.New("error consuming token remain quota: " + err.Error())
		}
		model.UpdateChannelUsedQuota(q.channelId, quota)

		// 如果有订阅消费，记录从余额扣除的额度
		if q.subscriptionHandled && q.subscriptionQuota > 0 {
			q.quotaFromBalance = quota
		}
	}

	// 记录消费日志
	// 如果同时使用了订阅和余额，记录一条包含完整信息的日志
	if q.subscriptionHandled && q.subscriptionQuota > 0 {
		totalQuota := q.subscriptionQuota + q.quotaFromBalance
		model.RecordConsumeLog(
			ctx,
			q.userId,
			q.channelId,
			usage.PromptTokens,
			usage.CompletionTokens,
			q.modelName,
			tokenName,
			tokenId,
			totalQuota,
			"resource_package", // 标记为资源包消费（即使有部分来自余额）
			q.getRequestTime(),
			isStream,
			false,
			q.getSubscriptionLogMeta(usage),
			sourceIp,
		)
		model.UpdateUserUsedQuotaAndRequestCount(q.userId, totalQuota)
	} else {
		// 纯余额消费，记录普通日志
		model.RecordConsumeLog(
			ctx,
			q.userId,
			q.channelId,
			usage.PromptTokens,
			usage.CompletionTokens,
			q.modelName,
			tokenName,
			tokenId,
			quota,
			"",
			q.getRequestTime(),
			isStream,
			false,
			q.GetLogMeta(usage),
			sourceIp,
		)
		model.UpdateUserUsedQuotaAndRequestCount(q.userId, quota)
	}

	return nil
}

func (q *Quota) Undo(c *gin.Context) {
	if q.HandelStatus {
		go func(ctx context.Context) {
			// return pre-consumed quota
			err := model.PostConsumeTokenQuotaWithInfo(q.tokenId, q.userId, q.unlimitedQuota, -q.preConsumedQuota)
			if err != nil {
				logger.LogError(ctx, "error return pre-consumed quota: "+err.Error())
			}
		}(c.Request.Context())
	}
}

func (q *Quota) Consume(c *gin.Context, usage *types.Usage, isStream bool) {
	tokenName := c.GetString("token_name")
	q.startTime = c.GetTime("requestStartTime")
	tokenId := c.GetInt("token_id")
	// 如果没有报错，则消费配额
	go func(ctx context.Context) {
		err := q.completedQuotaConsumption(usage, tokenName, tokenId, isStream, c.ClientIP(), ctx)
		if err != nil {
			logger.LogError(ctx, err.Error())
			go func() {
				model.RecordConsumeErrorLog(
					ctx,
					q.userId,
					q.channelId,
					q.modelName,
					tokenName,
					tokenId,
					err.Error(),
					c.ClientIP(),
					c.GetString(logger.RequestIdKey),
				)
			}()
		}
	}(c.Request.Context())
}

func (q *Quota) GetInputRatio() float64 {
	return q.inputRatio
}

func (q *Quota) GetLogMeta(usage *types.Usage) map[string]any {
	meta := map[string]any{
		"group_name":        q.groupName,
		"backup_group_name": q.backupGroupName,
		"is_backup_group":   q.isBackupGroup, // 添加是否使用备用分组的标识
		"price_type":        q.price.Type,
		"group_ratio":       q.groupRatio,
		"input_ratio":       q.price.GetInput(),
		"output_ratio":      q.price.GetOutput(),
		"is_search":         q.isSearch,
	}

	firstResponseTime := q.GetFirstResponseTime()
	if firstResponseTime > 0 {
		meta["first_response"] = firstResponseTime
	}

	if usage != nil {
		extraTokens := usage.GetExtraTokens()

		for key, value := range extraTokens {
			meta[key] = value
			extraRatio := q.price.GetExtraRatio(key)
			meta[key+"_ratio"] = extraRatio
		}
		if usage.PromptTokensDetails.InputTokens > 0 {
			meta["input_tokens"] = usage.PromptTokensDetails.InputTokens
		}
	}

	if q.extraBillingData != nil {
		meta["extra_billing"] = q.extraBillingData
	}

	return meta
}

// getSubscriptionLogMeta 获取订阅消费日志的元数据
func (q *Quota) getSubscriptionLogMeta(usage *types.Usage) map[string]any {
	meta := q.GetLogMeta(usage)
	meta["billing_type"] = "resource_package"
	meta["resource_package_id"] = q.subscriptionHashId
	meta["package_service_type"] = q.packageServiceType

	// 添加多订阅消费明细
	if len(q.subscriptionsUsed) > 0 {
		meta["subscriptions_used"] = q.subscriptionsUsed
	}

	// 添加订阅和余额消费统计
	meta["quota_from_subscription"] = q.subscriptionQuota
	meta["quota_from_balance"] = q.quotaFromBalance
	meta["total_quota"] = q.subscriptionQuota + q.quotaFromBalance

	return meta
}

func (q *Quota) getRequestTime() int {
	return int(time.Since(q.startTime).Milliseconds())
}

// 通过 token 数获取消费配额
func (q *Quota) GetTotalQuota(promptTokens, completionTokens int, extraBilling map[string]types.ExtraBilling) (quota int) {
	if q.price.Type == model.TimesPriceType {
		quota = int(1000 * q.inputRatio)
	} else {
		quota = int(math.Ceil((float64(promptTokens) * q.inputRatio) + (float64(completionTokens) * q.outputRatio)))
	}

	q.GetExtraBillingData(extraBilling)
	extraBillingQuota := 0
	if q.extraBillingData != nil {
		for _, value := range q.extraBillingData {
			extraBillingQuota += int(math.Ceil(
				float64(value.Price)*float64(config.QuotaPerUnit),
			)) * value.CallCount
		}
	}

	if extraBillingQuota > 0 {
		quota += int(math.Ceil(
			float64(extraBillingQuota) * q.groupRatio,
		))
	}

	if q.inputRatio != 0 && quota <= 0 {
		quota = 1
	}
	totalTokens := promptTokens + completionTokens
	if totalTokens == 0 {
		// in this case, must be some error happened
		// we cannot just return, because we may have to return the pre-consumed quota
		quota = 0
	}

	return quota
}

// 获取计算的 token 数
func (q *Quota) getComputeTokensByUsage(usage *types.Usage) (promptTokens, completionTokens int) {
	promptTokens = usage.PromptTokens
	completionTokens = usage.CompletionTokens

	extraTokens := usage.GetExtraTokens()

	for key, value := range extraTokens {
		extraRatio := q.price.GetExtraRatio(key)
		if model.GetExtraPriceIsPrompt(key) {
			promptTokens += model.GetIncreaseTokens(value, extraRatio)
		} else {
			completionTokens += model.GetIncreaseTokens(value, extraRatio)
		}
	}

	return
}

func (q *Quota) getComputeTokensByUsageEvent(usage *types.UsageEvent) (promptTokens, completionTokens int) {
	promptTokens = usage.InputTokens
	completionTokens = usage.OutputTokens
	extraTokens := usage.GetExtraTokens()

	for key, value := range extraTokens {
		extraRatio := q.price.GetExtraRatio(key)
		if model.GetExtraPriceIsPrompt(key) {
			promptTokens += model.GetIncreaseTokens(value, extraRatio)
		} else {
			completionTokens += model.GetIncreaseTokens(value, extraRatio)
		}
	}

	return
}

// 通过 usage 获取消费配额
func (q *Quota) GetTotalQuotaByUsage(usage *types.Usage) (quota int) {
	promptTokens, completionTokens := q.getComputeTokensByUsage(usage)
	return q.GetTotalQuota(promptTokens, completionTokens, usage.ExtraBilling)
}

func (q *Quota) GetFirstResponseTime() int64 {
	// 先判断 firstResponseTime 是否为0
	if q.firstResponseTime.IsZero() {
		return 0
	}

	return q.firstResponseTime.Sub(q.startTime).Milliseconds()
}

func (q *Quota) SetFirstResponseTime(firstResponseTime time.Time) {
	q.firstResponseTime = firstResponseTime
}

type ExtraBillingData struct {
	Type      string  `json:"type"`
	CallCount int     `json:"call_count"`
	Price     float64 `json:"price"`
}

// resolvePackageServiceTypeByTokenGroup 依据分组名称解析资源包服务类型
func resolvePackageServiceTypeByTokenGroup(group string) string {
	group = strings.TrimSpace(group)
	if group == "" {
		return ""
	}
	switch {
	case strings.EqualFold(group, "ClaudeCode"):
		return "claude_code"
	case strings.EqualFold(group, "Codex"):
		return "codex_code"
	case strings.EqualFold(group, "GeminiCli"):
		return "gemini_code"
	default:
		return ""
	}
}

// SubscriptionUsageDetail 订阅消费明细
type SubscriptionUsageDetail struct {
	SubscriptionId int    `json:"subscription_id"` // 订阅ID
	PlanType       string `json:"plan_type"`       // 套餐类型
	Quota          int    `json:"quota"`           // 本次从该订阅扣除的额度
	EndTime        int64  `json:"end_time"`        // 订阅到期时间
}

func (q *Quota) GetExtraBillingData(extraBilling map[string]types.ExtraBilling) {
	if extraBilling == nil {
		return
	}

	extraBillingData := make(map[string]ExtraBillingData)
	for serviceType, value := range extraBilling {
		extraBillingData[serviceType] = ExtraBillingData{
			Type:      value.Type,
			CallCount: value.CallCount,
			Price:     getDefaultExtraServicePrice(serviceType, q.modelName, value.Type),
		}

	}

	if len(extraBillingData) == 0 {
		return
	}

	q.extraBillingData = extraBillingData
}
