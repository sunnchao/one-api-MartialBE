package controller

import (
	"fmt"
	"math"
	"net/http"
	"one-api/common/config"
	"one-api/common/database"
	"one-api/common/logger"
	"one-api/common/utils"
	"one-api/model"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// 获取所有套餐
func GetPackagesPlans(c *gin.Context) {
	includeHidden := c.DefaultQuery("include_hidden", "false") == "true"
	role := c.GetInt("role")
	if includeHidden && role < config.RoleAdminUser {
		includeHidden = false
	}
	plans, err := model.GetAllPackagesPlans(includeHidden)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "获取套餐失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    plans,
	})
}

type GetPackagesSubscriptionResponse struct {
	*model.PackagesSubscription
	PackagePlan *model.PackagesPlan `json:"package_plan"`
}

// 获取用户订阅状态
func GetPackagesSubscription(c *gin.Context) {
	userId := c.GetInt("id")

	subscriptions, err := model.GetUserActivePackagesSubscriptions(userId, "", false)

	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "未找到有效订阅",
			"data":    nil,
		})
		return
	}

	// 根据subscriptions的plan_type获取订阅信息，先去重
	var planTypes = make(map[string]string)
	var plans []*model.PackagesPlan
	for _, sub := range subscriptions {
		planTypes[sub.PlanType] = sub.PlanType
	}
	for _, planType := range planTypes {
		plan, err := model.GetPackagesPlanByType(planType)
		if err != nil {
			continue
		}
		newPlan := &model.PackagesPlan{
			Description: plan.Description,
			Type:        plan.Type,
			HashId:      plan.HashId,
		}
		plans = append(plans, newPlan)
	}

	// 组装返回 GetPackagesSubscriptionResponse格式
	var newSubscriptions []*GetPackagesSubscriptionResponse
	for i := range subscriptions {
		sub := &subscriptions[i]
		subscription := &GetPackagesSubscriptionResponse{
			PackagesSubscription: sub,
		}
		for _, plan := range plans {
			if plan.Type == sub.PlanType {
				subscription.PackagePlan = plan
				break
			}
		}
		newSubscriptions = append(newSubscriptions, subscription)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    newSubscriptions,
	})
}

// 购买订阅请求结构
type PurchaseSubscriptionRequest struct {
	PlanType      string `json:"plan_type" binding:"required"`
	HashId        string `json:"hash_id" binding:"required"`
	PaymentMethod string `json:"payment_method"`
}

// 购买订阅
func PurchasePackagesSubscription(c *gin.Context) {
	userId := c.GetInt("id")

	var req PurchaseSubscriptionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "参数错误: " + err.Error(),
		})
		return
	}

	// 获取套餐信息
	plan, err := model.GetPackagesPlanByType(req.PlanType)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "套餐不存在",
		})
		return
	}
	if !plan.ShowInPortal {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "该套餐不可购买",
		})
		return
	}

	// 获取用户信息
	user, err := model.GetUserById(userId, false)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "用户不存在",
		})
		return
	}

	if req.PaymentMethod == "balance" {
		costQuota := int(math.Round(plan.Price * config.QuotaPerUnit))
		if costQuota < 0 {
			costQuota = 0
		}
		if costQuota > 0 && user.Quota < costQuota {
			c.JSON(http.StatusOK, gin.H{
				"success": false,
				"message": "余额不足，请先充值",
			})
			return
		}

		if costQuota > 0 {
			if err := model.DecreaseUserQuota(userId, costQuota); err != nil {
				c.JSON(http.StatusOK, gin.H{
					"success": false,
					"message": "扣款失败，请稍后重试",
				})
				return
			}
		}

		subscription, _, err := model.GrantPlanToUser(userId, plan, "balance", false)
		if err != nil {
			if costQuota > 0 {
				_ = model.IncreaseUserQuota(userId, costQuota)
			}
			c.JSON(http.StatusOK, gin.H{
				"success": false,
				"message": "订阅激活失败，请稍后重试",
			})
			return
		}

		if costQuota > 0 {
			model.RecordQuotaLog(userId, model.LogTypeConsume, costQuota, c.ClientIP(), fmt.Sprintf("使用余额购买Claude Code套餐：%s", plan.Name))
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "订阅已使用余额支付并激活",
			"data":    subscription,
		})
		return
	}

	// 生成订单号
	orderId := fmt.Sprintf("cc_%d_%d", userId, time.Now().Unix())

	// TODO: 实现支付服务调用
	// 现在先创建一个模拟的支付结果
	paymentURL := "/panel/subscriptions?success=true"

	// 创建待支付的订阅记录
	now := utils.GetTimestamp()
	var endTime int64
	if plan.IsUnlimitedTime {
		// 无时间限制，设置为很久的未来时间 (100年后)
		endTime = now + 100*365*24*60*60
	} else {
		durationSeconds := plan.DurationSeconds()
		if durationSeconds <= 0 {
			durationSeconds = 30 * 24 * 60 * 60
		}
		endTime = now + durationSeconds
	}

	subscription := &model.PackagesSubscription{
		UserId:         userId,
		PlanType:       plan.Type,
		Status:         "pending", // 待支付状态
		StartTime:      now,
		EndTime:        endTime,
		TotalQuota:     plan.TotalQuota,
		RemainQuota:    plan.TotalQuota,
		UsedQuota:      0,
		MaxClientCount: plan.MaxClientCount,
		Price:          plan.Price,
		Currency:       plan.Currency,
		PaymentMethod:  req.PaymentMethod,
		OrderId:        orderId,
	}

	if err := model.CreatePackagesSubscription(subscription); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "创建订阅记录失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":     true,
		"message":     "订单创建成功，请完成支付",
		"data":        subscription,
		"payment_url": paymentURL,
		"order_id":    orderId,
	})
}

// 支付回调处理
func ClaudeCodePaymentNotify(c *gin.Context) {
	paymentMethod := c.Query("method")
	if paymentMethod == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing payment method"})
		return
	}

	// TODO: 实现支付回调验证
	// 这里应该根据不同的支付方法验证回调
	logger.SysLog("收到Claude Code支付回调")

	// 模拟支付成功
	orderId := c.Query("order_id")
	if orderId != "" {
		err := activatePackagesSubscription(orderId)
		if err != nil {
			logger.SysError("激活Claude Code订阅失败: " + err.Error())
		}
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// 激活订阅
func activatePackagesSubscription(orderId string) error {
	var subscription model.PackagesSubscription
	if err := model.DB.Where("order_id = ? AND status = 'pending'", orderId).First(&subscription).Error; err != nil {
		return err
	}

	// 更新订阅状态为激活
	subscription.Status = "active"
	duration := subscription.EndTime - subscription.StartTime
	if duration <= 0 {
		duration = 30 * 24 * 60 * 60
	}
	subscription.StartTime = utils.GetTimestamp()
	subscription.EndTime = subscription.StartTime + duration

	return model.UpdatePackagesSubscription(&subscription)
}

// Claude代理请求结构
type ClaudeProxyRequest struct {
	Model    string                   `json:"model" binding:"required"`
	Messages []map[string]interface{} `json:"messages" binding:"required"`
	Stream   bool                     `json:"stream"`
}

// 客户端验证信息
type ClientValidationRequest struct {
	ClientInfo model.ClientFingerprint `json:"client_info" binding:"required"`
	APIKey     string                  `json:"api_key" binding:"required"`
}

// 获取可用的Claude渠道
func getAvailableClaudeChannel() (*model.Channel, error) {
	// 查找启用的Claude渠道
	var channel model.Channel
	err := model.DB.Where("type = ? AND status = ?", config.ChannelTypeAnthropic, config.ChannelStatusEnabled).
		First(&channel).Error
	if err != nil {
		return nil, err
	}
	return &channel, nil
}

// 获取使用统计
func GetPackagesUsageStats(c *gin.Context) {
	userId := c.GetInt("id")

	// 获取查询参数
	startTimeStr := c.DefaultQuery("start_time", "0")
	endTimeStr := c.DefaultQuery("end_time", strconv.FormatInt(utils.GetTimestamp(), 10))

	startTime, _ := strconv.ParseInt(startTimeStr, 10, 64)
	endTime, _ := strconv.ParseInt(endTimeStr, 10, 64)

	if startTime == 0 {
		// 默认查询最近30天
		startTime = utils.GetTimestamp() - 30*24*60*60
	}

	stats, err := model.GetPackagesUsageStats(userId, startTime, endTime)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "获取统计数据失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    stats,
	})
}

// 取消订阅
func CancelPackagesSubscription(c *gin.Context) {
	userId := c.GetInt("id")

	var req PurchaseSubscriptionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "参数错误: " + err.Error(),
		})
		return
	}

	subscription, err := model.GetUserActivePackagesSubscriptionByHashId(userId, req.HashId)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "未找到有效订阅",
		})
		return
	}

	// 更新订阅状态
	subscription.Status = "cancelled"
	subscription.AutoRenew = false

	if err := model.UpdatePackagesSubscription(subscription); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "取消订阅失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "订阅已取消",
	})
}

// 管理员获取所有订阅（管理后台用）
func GetAllPackagesSubscriptions(c *gin.Context) {
	// 检查管理员权限
	if c.GetInt("role") < config.RoleAdminUser {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "权限不足",
		})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))

	var subscriptions []model.PackagesSubscription
	var total int64

	// 构建查询
	query := model.DB.Model(&model.PackagesSubscription{})

	// 添加筛选条件
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if planType := c.Query("plan_type"); planType != "" {
		query = query.Where("plan_type = ?", planType)
	}

	// 获取总数
	query.Count(&total)

	// 分页查询
	offset := (page - 1) * pageSize
	err := query.Offset(offset).Limit(pageSize).Order("created_time DESC").Find(&subscriptions).Error
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "查询失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": map[string]interface{}{
			"subscriptions": subscriptions,
			"total":         total,
			"page":          page,
			"page_size":     pageSize,
		},
	})
}

// 管理员手动发放套餐请求结构
type AdminGrantSubscriptionRequest struct {
	UserId   int    `json:"user_id" binding:"required"`
	PlanType string `json:"plan_type" binding:"required"`
	HashId   string `json:"hash_id"`
	Reason   string `json:"reason"` // 发放原因
}

// 管理员手动发放套餐
func AdminGrantPackagesSubscription(c *gin.Context) {
	var req AdminGrantSubscriptionRequest

	// 验证请求参数
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "请求参数错误: " + err.Error(),
		})
		return
	}

	// 验证用户是否存在
	_, err := model.GetUserById(req.UserId, false)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "用户不存在",
		})
		return
	}

	// 验证套餐是否存在
	plan, err := model.GetPackagesPlanByType(req.PlanType)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "套餐不存在",
		})
		return
	}

	// 计算订阅时间
	var endTime int64
	now := utils.GetTimestamp()
	durationSeconds := model.DurationValueToSeconds(plan.DurationUnit, plan.DurationValue)
	endTime = now + durationSeconds

	// 创建订阅记录
	subscription := &model.PackagesSubscription{
		UserId:         req.UserId,
		PlanType:       plan.Type,
		Status:         "active",
		StartTime:      now,
		EndTime:        endTime,
		AutoRenew:      false, // 手动发放的订阅默认不自动续费
		MaxClientCount: plan.MaxClientCount,
		Price:          0, // 管理员发放免费
		Currency:       plan.Currency,
		PaymentMethod:  "admin_grant",
		OrderId:        fmt.Sprintf("admin_grant_%d_%d", req.UserId, now),
		CreatedTime:    now,
		UpdatedTime:    now,
		TotalQuota:     plan.TotalQuota,
		RemainQuota:    plan.TotalQuota,
		UsedQuota:      0,
		ServiceType:    plan.ServiceType,
		HashId:         utils.GetUUID(),
	}

	// 保存订阅
	if err := model.CreatePackagesSubscription(subscription); err != nil {
		logger.SysError("管理员发放套餐失败: " + err.Error())
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "发放套餐失败",
		})
		return
	}

	// 记录管理员操作日志
	adminId := c.GetInt("id")
	durationDesc := "永久"
	if !plan.IsUnlimitedTime {
		durationDesc = formatDurationLabel(plan.DurationUnit, plan.DurationValue)
	}
	logger.SysLog(fmt.Sprintf("管理员 %d 为用户 %d 手动发放 %s 套餐，时长 %s，原因: %s",
		adminId, req.UserId, req.PlanType, durationDesc, req.Reason))

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "套餐发放成功",
		"data":    subscription,
	})
}

func formatDurationLabel(unit string, value int) string {
	if value <= 0 {
		value = 1
	}
	switch unit {
	case model.DurationUnitDay:
		return fmt.Sprintf("%d天", value)
	case model.DurationUnitWeek:
		return fmt.Sprintf("%d周", value)
	case model.DurationUnitQuarter:
		return fmt.Sprintf("%d个季度", value)
	default:
		return fmt.Sprintf("%d个月", value)
	}
}

// 管理员搜索用户请求结构
type AdminSearchUsersRequest struct {
	Keyword  string `json:"keyword"`   // 搜索关键词（用户名、邮箱、ID）
	Page     int    `json:"page"`      // 页码
	PageSize int    `json:"page_size"` // 每页数量
}

// 管理员搜索用户
func AdminSearchUsers(c *gin.Context) {
	// 从查询参数获取搜索条件
	keyword := c.Query("keyword")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	users, total, err := model.SearchUsers(keyword, page, pageSize)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "搜索用户失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": map[string]interface{}{
			"users":     users,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

// 管理员取消用户订阅
func AdminCancelPackagesSubscription(c *gin.Context) {
	subscriptionId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "订阅ID错误",
		})
		return
	}

	// 获取订阅信息
	subscription, err := model.GetPackagesSubscriptionById(subscriptionId)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "订阅不存在",
		})
		return
	}

	// 取消订阅
	subscription.Status = "cancelled"
	subscription.UpdatedTime = utils.GetTimestamp()

	if err := model.UpdatePackagesSubscription(subscription); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "取消订阅失败",
		})
		return
	}

	// 记录管理员操作日志
	adminId := c.GetInt("id")
	logger.SysLog(fmt.Sprintf("管理员 %d 取消了用户 %d 的 Claude Code 订阅 %d",
		adminId, subscription.UserId, subscriptionId))

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "订阅已取消",
	})
}

// Plan Management APIs

// CreatePlanRequest 创建套餐请求结构
type CreatePlanRequest struct {
	Name            string                 `json:"name" binding:"required"`
	Type            string                 `json:"type" binding:"required"`
	Description     string                 `json:"description"`
	Price           *float64               `json:"price" binding:"required"`
	Currency        string                 `json:"currency"`
	TotalQuota      int                    `json:"total_quota" binding:"required"`
	MaxClientCount  int                    `json:"max_client_count"`
	IsUnlimitedTime bool                   `json:"is_unlimited_time"`
	DurationMonths  int                    `json:"duration_months"`
	DurationUnit    string                 `json:"duration_unit"`
	DurationValue   int                    `json:"duration_value"`
	Features        map[string]interface{} `json:"features"`
	IsActive        bool                   `json:"is_active"`
	SortOrder       int                    `json:"sort_order"`
	ShowInPortal    bool                   `json:"show_in_portal"`
  ServiceType     string                 `json:"service_type" binding:"required"`
}

// UpdatePlanRequest 更新套餐请求结构
type UpdatePlanRequest struct {
	Name            string                 `json:"name"`
	Description     string                 `json:"description"`
	Price           *float64               `json:"price"`
	Currency        string                 `json:"currency"`
	MaxClientCount  int                    `json:"max_client_count"`
	IsUnlimitedTime *bool                  `json:"is_unlimited_time"`
	DurationMonths  int                    `json:"duration_months"`
	DurationUnit    string                 `json:"duration_unit"`
	DurationValue   int                    `json:"duration_value"`
	Features        map[string]interface{} `json:"features"`
	IsActive        *bool                  `json:"is_active"`
	SortOrder       int                    `json:"sort_order"`
	ServiceType     string                 `json:"service_type" gorm:"type:varchar(50);index;default:'claude_code'"` // claude_code, codex_code, gemini_code
	TotalQuota      int                    `json:"total_quota" gorm:"default:0"`                                     // 总额度
	ShowInPortal    *bool                  `json:"show_in_portal"`
}

// CreatePackagesPlan 创建套餐
func CreatePackagesPlan(c *gin.Context) {
	// 检查管理员权限
	if c.GetInt("role") < config.RoleAdminUser {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "权限不足",
		})
		return
	}

	var req CreatePlanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "参数错误: " + err.Error(),
		})
		return
	}

	// 检查套餐类型是否已存在
	existingPlan, _ := model.GetPackagesPlanByType(req.Type)
	if existingPlan != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "套餐类型已存在",
		})
		return
	}

	// 设置默认值
	if req.Currency == "" {
		req.Currency = "USD"
	}
	if req.MaxClientCount == 0 {
		req.MaxClientCount = 1
	}
	var durationUnit = model.DurationUnitMonth
	if req.DurationUnit != "" {
		if !model.IsSupportedDurationUnit(req.DurationUnit) {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "不支持的订阅时长单位",
			})
			return
		}
		durationUnit = model.NormalizeDurationUnit(req.DurationUnit)
	}
	durationValue := req.DurationValue
	if req.IsUnlimitedTime {
		req.DurationMonths = 0
		durationValue = 0
	} else {
		if durationValue <= 0 {
			if req.DurationMonths > 0 {
				durationValue = req.DurationMonths
			} else {
				durationValue = 1
			}
		}
		switch durationUnit {
		case model.DurationUnitMonth:
			req.DurationMonths = durationValue
		case model.DurationUnitQuarter:
			req.DurationMonths = durationValue * 3
		default:
			if req.DurationMonths == 0 {
				req.DurationMonths = durationValue
			}
		}
	}

	priceValue := 0.0
	if req.Price != nil {
		priceValue = *req.Price
	}
	if priceValue < 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "价格不能为负数",
		})
		return
	}

	now := utils.GetTimestamp()
	plan := &model.PackagesPlan{
		Name:            req.Name,
		Type:            req.Type,
		Description:     req.Description,
		Price:           priceValue,
		Currency:        req.Currency,
		TotalQuota:      req.TotalQuota,
		MaxClientCount:  req.MaxClientCount,
		IsUnlimitedTime: req.IsUnlimitedTime,
		DurationMonths:  req.DurationMonths,
		DurationUnit:    durationUnit,
		DurationValue:   durationValue,
		Features:        database.JSONType[map[string]interface{}]{},
		IsActive:        req.IsActive,
		ShowInPortal:    req.ShowInPortal,
		SortOrder:       req.SortOrder,
		CreatedTime:     now,
		UpdatedTime:     now,
    HashId:           utils.GetUUID(),
    ServiceType:      req.ServiceType,
	}

	if err := model.CreatePackagesPlan(plan); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "创建套餐失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "套餐创建成功",
		"data":    plan,
	})
}

// UpdatePackagesPlan 更新套餐
func UpdatePackagesPlan(c *gin.Context) {
	// 检查管理员权限
	if c.GetInt("role") < config.RoleAdminUser {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "权限不足",
		})
		return
	}

	planId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "无效的套餐ID",
		})
		return
	}

	var req UpdatePlanRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "参数错误: " + err.Error(),
		})
		return
	}

	// 获取现有套餐
	plan, err := model.GetPackagesPlanById(planId)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "套餐不存在",
		})
		return
	}

	// 更新字段
	if req.Name != "" {
		plan.Name = req.Name
	}
	if req.ServiceType != "" {
		plan.ServiceType = req.ServiceType
	}
	if req.Description != "" {
		plan.Description = req.Description
	}
	if req.Price != nil {
		if *req.Price < 0 {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "价格不能为负数",
			})
			return
		}
		plan.Price = *req.Price
	}
	if req.Currency != "" {
		plan.Currency = req.Currency
	}
	if req.MaxClientCount > 0 {
		plan.MaxClientCount = req.MaxClientCount
	}
	if req.IsUnlimitedTime != nil {
		plan.IsUnlimitedTime = *req.IsUnlimitedTime
	}
	updatedDurationUnit := plan.DurationUnit
	if req.DurationUnit != "" {
		if !model.IsSupportedDurationUnit(req.DurationUnit) {
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"message": "不支持的订阅时长单位",
			})
			return
		}
		updatedDurationUnit = model.NormalizeDurationUnit(req.DurationUnit)
	}
	updatedDurationValue := plan.DurationValue
	if req.DurationValue > 0 {
		updatedDurationValue = req.DurationValue
	}
	updatedDurationMonths := plan.DurationMonths
	if req.DurationMonths > 0 {
		updatedDurationMonths = req.DurationMonths
		if updatedDurationUnit == model.DurationUnitMonth {
			updatedDurationValue = req.DurationMonths
		} else if updatedDurationUnit == model.DurationUnitQuarter {
			updatedDurationValue = req.DurationMonths / 3
			if updatedDurationValue == 0 {
				updatedDurationValue = 1
			}
		}
	}
	if plan.IsUnlimitedTime {
		updatedDurationMonths = 0
		updatedDurationValue = 0
	} else {
		switch updatedDurationUnit {
		case model.DurationUnitMonth:
			updatedDurationMonths = updatedDurationValue
		case model.DurationUnitQuarter:
			updatedDurationMonths = updatedDurationValue * 3
		}
		if updatedDurationValue <= 0 {
			updatedDurationValue = 1
			if updatedDurationMonths == 0 {
				updatedDurationMonths = 1
			}
		}
	}
	plan.DurationUnit = updatedDurationUnit
	plan.DurationValue = updatedDurationValue
	plan.DurationMonths = updatedDurationMonths
	if req.TotalQuota > 0 {
		plan.TotalQuota = req.TotalQuota
	}
	// TODO: Handle features update properly when needed
	if req.IsActive != nil {
		plan.IsActive = *req.IsActive
	}
	if req.ShowInPortal != nil {
		plan.ShowInPortal = *req.ShowInPortal
	}
	plan.SortOrder = req.SortOrder
	plan.UpdatedTime = utils.GetTimestamp()
  if plan.HashId == "" {
    plan.HashId = utils.GetUUID()
  }

	if err := model.UpdatePackagesPlan(plan); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "更新套餐失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "套餐更新成功",
		"data":    plan,
	})
}

// DeletePackagesPlan 删除套餐
func DeletePackagesPlan(c *gin.Context) {
	// 检查管理员权限
	if c.GetInt("role") < config.RoleAdminUser {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "权限不足",
		})
		return
	}

	planId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "无效的套餐ID",
		})
		return
	}

	// 检查是否有关联的订阅
	hasSubscriptions, err := model.CheckPackagesPlanHasSubscriptions(planId)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "检查套餐关联失败",
		})
		return
	}

	if hasSubscriptions {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "该套餐有关联的订阅，无法删除",
		})
		return
	}

	if err := model.DeletePackagesPlan(planId); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "删除套餐失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "套餐删除成功",
	})
}

// GetPackagesPlanById 获取套餐详情
func GetPackagesPlanById(c *gin.Context) {
	// 检查管理员权限
	if c.GetInt("role") < config.RoleAdminUser {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "权限不足",
		})
		return
	}

	planId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "无效的套餐ID",
		})
		return
	}

	plan, err := model.GetPackagesPlanById(planId)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "套餐不存在",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    plan,
	})
}
