package model

import (
	"fmt"
	"math/rand"
	"one-api/common"
	"one-api/common/config"
	"one-api/common/logger"
	"one-api/common/utils"
	"strconv"
	"strings"
	"time"

	"gorm.io/gorm"
)

type UserOperation struct {
	Id          int    `json:"id"`
	UserId      int    `json:"user_id"`
	CreatedTime int64  `json:"created_time" gorm:"type:bigint"`
	Type        int    `json:"type"`
	Remark      string `json:"remark"`
}

// GetLatestCheckInOperation 获取用户最新的签到记录
func GetLatestCheckInOperation(userId int) (*UserOperation, error) {
	operations, err := fetchUserOperationsWithNormalizedTime(
		DB.Model(&UserOperation{}).
			Where("user_id = ? AND type = ?", userId, CheckInType).
			Order("id desc").
			Limit(1),
	)
	if err != nil {
		return nil, err
	}
	if len(operations) == 0 {
		return nil, gorm.ErrRecordNotFound
	}
	return &operations[0], nil
}

// createOperation 创建用户操作记录
func createOperation(operation *UserOperation) error {
	return DB.Create(operation).Error
}

const (
	CheckInType                   = 1
	MinCheckInQuota               = 5000
	BaseMinRatio                  = 0.01  // 基础最小比例 0.01
	BaseLowMaxRatio               = 0.1   // 低额度最大比例 0.2
	BaseHighMaxRatio              = 0.125 // 高额度最大比例 0.25
	BonusRatio                    = 0.125 // 额外奖励比例 0.25
	BonusProbability              = 0.1   // 额外奖励概率 10%
	HighRatioProbability          = 0.5   // 获得高额度(>0.2)的概率 75%
	CouponProbability             = 0     // 获得优惠券的概率 5%
	SubscriptionRewardProbability = 0.75  // 获得订阅奖励的概率 50%
)

const checkInClaudCodeSubscriptionRewardSource = "claude_code_checkin_reward"
const checkInCodexSubscriptionRewardSource = "codex_checkin_reward"
const checkInGeminiCliSubscriptionRewardSource = "gemini_cli_checkin_reward"

// 签到奖励结果
type CheckInRewardResult struct {
	Quota                int                   `json:"quota"`
	Coupon               *UserCoupon           `json:"coupon,omitempty"`
	Subscription         *PackagesSubscription `json:"subscription,omitempty"`
	SubscriptionExtended bool                  `json:"subscription_extended,omitempty"`
}

// ProcessCheckIn 处理用户签到
func ProcessCheckIn(userId int, requestIP string) (*CheckInRewardResult, error) {
	var (
		quota                int
		subscription         *PackagesSubscription
		subscriptionExtended bool
		err                  error
	)

	if shouldGrantSubscriptionReward() {
		subscription, subscriptionExtended, err = grantCheckinSubscriptionReward(userId)
		if err != nil {
			logger.SysError(fmt.Sprintf("签到赠送订阅失败: %v", err))
			subscription = nil
		}
	}

	remarkParts := []string{"签到成功"}

	if subscription == nil {
		quota = calculateCheckInQuota()
		userQuota, err := GetUserQuota(userId)
		if err != nil {
			return nil, fmt.Errorf("failed to get user quota: %w", err)
		}
		if userQuota <= 0 {
			quota = quota / 10
		}
		if err := increaseUserQuota(userId, quota); err != nil {
			return nil, fmt.Errorf("failed to increase user quota: %w", err)
		}
		remarkParts = append(remarkParts, fmt.Sprintf("获得额度 %v", common.LogQuota(quota)))
	} else {
		expireAt := time.Unix(subscription.EndTime, 0).Format("2006-01-02 15:04")
		if subscriptionExtended {
			remarkParts = append(remarkParts, fmt.Sprintf("Claude Code订阅延长至 %s", expireAt))
		} else {
			remarkParts = append(remarkParts, fmt.Sprintf("获得Claude Code体验订阅(有效至 %s)", expireAt))
		}
	}

	remark := strings.Join(remarkParts, ", ")
	operation := &UserOperation{
		UserId:      userId,
		Type:        CheckInType,
		Remark:      remark,
		CreatedTime: time.Now().UnixMilli(),
	}

	if err := createOperation(operation); err != nil {
		return nil, fmt.Errorf("failed to create operation record: %w", err)
	}

	RecordLogWithRequestIP(userId, LogTypeUserQuoteIncrease, remark, requestIP)

	var coupon *UserCoupon
	if isCouponRewardEnabled() {
		couponReward := calculateCouponReward()
		if couponReward != nil {
			issuedCoupon, err := IssueCouponToUser(userId, couponReward.TemplateId, CouponSourceCheckin)
			if err != nil {
				logger.SysError(fmt.Sprintf("Failed to issue coupon to user %d: %v", userId, err))
			} else {
				coupon = issuedCoupon
				remark = fmt.Sprintf("%s, 获得优惠券: %s", remark, coupon.Name)
				operation.Remark = remark
				DB.Save(operation)
			}
		}
	}

	return &CheckInRewardResult{
		Quota:                quota,
		Coupon:               coupon,
		Subscription:         subscription,
		SubscriptionExtended: subscriptionExtended,
	}, nil
}

// 计算签到奖励额度
func calculateCheckInQuota() int {
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))

	// 使用指数分布生成加权随机数，让小值更容易出现
	randomValue := rng.Float64()
	// 使用平方根函数让小值更容易出现
	weightedRandom := randomValue * randomValue

	var baseRatio float64

	// 判断是否可以获得高额度 (>0.2)
	highRatioRandom := rng.Float64()
	if highRatioRandom < HighRatioProbability {
		// 75% 概率只能获得 0.01-0.2 的低额度
		baseRatio = BaseMinRatio + weightedRandom*(BaseLowMaxRatio-BaseMinRatio)
	} else {
		// 25% 概率可以获得 0.2-0.25 的高额度
		baseRatio = BaseLowMaxRatio + weightedRandom*(BaseHighMaxRatio-BaseLowMaxRatio)
	}

	// 10% 概率获得额外奖励
	bonusRandom := rng.Float64()
	var bonusRatio float64 = 0
	if bonusRandom < BonusProbability {
		bonusRatio = BonusRatio
	}

	// 计算总比例
	totalRatio := baseRatio + bonusRatio

	// 转换为实际配额 (config.QuotaPerUnit 作为基准)
	quota := int(totalRatio * float64(config.QuotaPerUnit))

	// 确保不低于最小值
	if quota < MinCheckInQuota {
		quota = MinCheckInQuota
	}

	return quota
}

// IsCheckInToday 判断用户是否已签到
func IsCheckInToday(userId int) (int64, error) {
	userOperation, err := GetLatestCheckInOperation(userId)
	localZeroTime := utils.GetLocalZeroTime()

	if err != nil {
		// 没有找到签到记录
		return -1, nil
	}

	// 比较签到时间是否在今日零点之后
	if userOperation.CreatedTime >= localZeroTime.UnixMilli() {
		// 已签到
		return userOperation.CreatedTime, nil
	}

	// 未签到
	return 1, nil
}

// GetCheckInList 获取签到列表（仅返回本月和上个月的记录）
func GetCheckInList(userId int) ([]UserOperation, error) {
	now := time.Now()
	firstDayOfLastMonth := time.Date(now.Year(), now.Month()-1, 1, 0, 0, 0, 0, now.Location())

	checkInList, err := fetchUserOperationsWithNormalizedTime(
		DB.Model(&UserOperation{}).
			Where("user_id = ? AND type = ?", userId, CheckInType).
			Order("id desc"),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get check-in list: %w", err)
	}

	cutoff := firstDayOfLastMonth.UnixMilli()
	filtered := make([]UserOperation, 0, len(checkInList))
	for _, op := range checkInList {
		if op.CreatedTime < cutoff {
			break
		}
		filtered = append(filtered, op)
	}

	return filtered, nil
}

// 优惠券奖励信息
type CouponRewardInfo struct {
	TemplateId int `json:"template_id"`
}

// 预定义的签到优惠券模板ID（需要在数据库中预先创建这些模板）
var CheckInCouponTemplates = []int{
	1, // 10%折扣券
	2, // 固定5元减免券
	3, // 充值20%奖励券
}

// 计算优惠券奖励
func calculateCouponReward() *CouponRewardInfo {
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))

	// 5%概率获得优惠券
	if rng.Float64() < CouponProbability {
		// 随机选择一个优惠券模板
		templateIndex := rng.Intn(len(CheckInCouponTemplates))
		return &CouponRewardInfo{
			TemplateId: CheckInCouponTemplates[templateIndex],
		}
	}

	return nil
}

func shouldGrantSubscriptionReward() bool {
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))
	return rng.Float64() < SubscriptionRewardProbability
}

func grantCheckinSubscriptionReward(userId int) (*PackagesSubscription, bool, error) {

	// 签到奖励不允许叠加，如果已有订阅则创建新订阅
	packageTypes := []string{
		checkInClaudCodeSubscriptionRewardSource,
		checkInCodexSubscriptionRewardSource,
		checkInGeminiCliSubscriptionRewardSource,
	}
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))
	packageType := packageTypes[rng.Intn(len(packageTypes))]
	plan, err := EnsureCheckinRewardPlan(packageType)
	if err != nil {
		return nil, false, err
	}
	return GrantPlanToUser(userId, plan, packageType, false)
}

// 检查优惠券奖励是否启用
func isCouponRewardEnabled() bool {
	return config.CheckinCouponEnabled
}

func fetchUserOperationsWithNormalizedTime(query *gorm.DB) ([]UserOperation, error) {
	rows, err := query.Select("id, user_id, type, remark, created_time").Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var operations []UserOperation
	for rows.Next() {
		var operation UserOperation
		var createdTime interface{}
		if err := rows.Scan(&operation.Id, &operation.UserId, &operation.Type, &operation.Remark, &createdTime); err != nil {
			return nil, err
		}
		parsedTime, err := normalizeCreatedTimeValue(createdTime)
		if err != nil {
			return nil, err
		}
		operation.CreatedTime = parsedTime
		operations = append(operations, operation)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return operations, nil
}

func normalizeCreatedTimeValue(value interface{}) (int64, error) {
	switch v := value.(type) {
	case int64:
		return v, nil
	case int32:
		return int64(v), nil
	case float64:
		return int64(v), nil
	case float32:
		return int64(v), nil
	case []byte:
		return parseCreatedTimeString(string(v))
	case string:
		return parseCreatedTimeString(v)
	case time.Time:
		return v.UnixMilli(), nil
	case nil:
		return 0, nil
	default:
		return 0, fmt.Errorf("unsupported created_time type %T", value)
	}
}

func parseCreatedTimeString(value string) (int64, error) {
	value = strings.TrimSpace(value)
	if value == "" {
		return 0, nil
	}
	if num, err := strconv.ParseInt(value, 10, 64); err == nil {
		if len(value) == 10 {
			return num * 1000, nil
		}
		return num, nil
	}
	layouts := []string{
		time.RFC3339Nano,
		"2006-01-02 15:04:05.999999-07:00",
		"2006-01-02 15:04:05-07:00",
		"2006-01-02 15:04:05",
	}
	for _, layout := range layouts {
		if parsed, err := time.Parse(layout, value); err == nil {
			return parsed.UnixMilli(), nil
		}
	}
	return 0, fmt.Errorf("failed to parse created_time value %q", value)
}
