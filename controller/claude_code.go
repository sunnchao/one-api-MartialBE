package controller

import (
	"encoding/json"
	"fmt"
	"net/http"
	"one-api/common/config"
	"one-api/common/logger"
	"one-api/common/utils"
	"one-api/model"
	"one-api/providers"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// 获取所有套餐
func GetClaudeCodePlans(c *gin.Context) {
	plans, err := model.GetAllClaudeCodePlans()
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

// 获取用户订阅状态
func GetClaudeCodeSubscription(c *gin.Context) {
	userId := c.GetInt("id")

	subscription, err := model.GetUserActiveClaudeCodeSubscription(userId)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "未找到有效订阅",
			"data":    nil,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    subscription,
	})
}

// 购买订阅请求结构
type PurchaseClaudeCodeRequest struct {
	PlanType      string `json:"plan_type" binding:"required"`
	PaymentMethod string `json:"payment_method" binding:"required"` // stripe, alipay, wxpay
}

// 购买订阅
func PurchaseClaudeCodeSubscription(c *gin.Context) {
	userId := c.GetInt("id")

	var req PurchaseClaudeCodeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "参数错误: " + err.Error(),
		})
		return
	}

	// 检查是否已有有效订阅
	existingSubscription, _ := model.GetUserActiveClaudeCodeSubscription(userId)
	if existingSubscription != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "您已有有效订阅，请等待当前订阅过期后再购买",
		})
		return
	}

	// 获取套餐信息
	plan, err := model.GetClaudeCodePlanByType(req.PlanType)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "套餐不存在",
		})
		return
	}

	// 获取用户信息
	_, err = model.GetUserById(userId, false)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "用户不存在",
		})
		return
	}

	// 生成订单号
	orderId := fmt.Sprintf("cc_%d_%d", userId, time.Now().Unix())

	// TODO: 实现支付服务调用
	// 现在先创建一个模拟的支付结果
	paymentURL := "/panel/claude-code/subscription?success=true"

	// 创建待支付的订阅记录
	now := utils.GetTimestamp()
	subscription := &model.ClaudeCodeSubscription{
		UserId:                userId,
		PlanType:              plan.Type,
		Status:                "pending", // 待支付状态
		StartTime:             now,
		EndTime:               now + 30*24*60*60, // 30天
		MaxRequestsPerMonth:   plan.MaxRequestsPerMonth,
		MaxClientCount:        plan.MaxClientCount,
		Price:                 plan.Price,
		Currency:              plan.Currency,
		PaymentMethod:         req.PaymentMethod,
		OrderId:               orderId,
		UsedRequestsThisMonth: 0,
	}

	if err := model.CreateClaudeCodeSubscription(subscription); err != nil {
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
		err := activateClaudeCodeSubscription(orderId)
		if err != nil {
			logger.SysError("激活Claude Code订阅失败: " + err.Error())
		}
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}

// 激活订阅
func activateClaudeCodeSubscription(orderId string) error {
	var subscription model.ClaudeCodeSubscription
	if err := model.DB.Where("order_id = ? AND status = 'pending'", orderId).First(&subscription).Error; err != nil {
		return err
	}

	// 更新订阅状态为激活
	subscription.Status = "active"
	subscription.StartTime = utils.GetTimestamp()
	subscription.EndTime = subscription.StartTime + 30*24*60*60 // 30天

	return model.UpdateClaudeCodeSubscription(&subscription)
}

// 获取用户的API Keys
func GetClaudeCodeAPIKeys(c *gin.Context) {
	userId := c.GetInt("id")

	apiKeys, err := model.GetUserClaudeCodeAPIKeys(userId)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "获取API Keys失败",
		})
		return
	}

	// 不返回实际的key，只返回基本信息
	var safeKeys []map[string]interface{}
	for _, key := range apiKeys {
		safeKeys = append(safeKeys, map[string]interface{}{
			"id":             key.Id,
			"name":           key.Name,
			"status":         key.Status,
			"last_used_time": key.LastUsedTime,
			"usage_count":    key.UsageCount,
			"created_time":   key.CreatedTime,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    safeKeys,
	})
}

// 创建API Key请求结构
type CreateAPIKeyRequest struct {
	Name string `json:"name" binding:"required"`
}

// 创建API Key
func CreateClaudeCodeAPIKey(c *gin.Context) {
	userId := c.GetInt("id")

	var req CreateAPIKeyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "参数错误",
		})
		return
	}

	// 检查是否有有效订阅
	subscription, err := model.GetUserActiveClaudeCodeSubscription(userId)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "需要有效的订阅才能创建API Key",
		})
		return
	}

	// 检查现有API Key数量
	existingKeys, _ := model.GetUserClaudeCodeAPIKeys(userId)
	activeKeyCount := 0
	for _, key := range existingKeys {
		if key.Status == 1 {
			activeKeyCount++
		}
	}

	if activeKeyCount >= 5 { // 限制每个用户最多5个活跃的API Key
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "API Key数量已达到上限",
		})
		return
	}

	// 创建新的API Key
	apiKey, keyString, err := model.CreateClaudeCodeAPIKey(userId, subscription.Id, req.Name)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "创建API Key失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "API Key创建成功",
		"data": map[string]interface{}{
			"id":           apiKey.Id,
			"name":         apiKey.Name,
			"key":          keyString, // 只在创建时返回一次
			"created_time": apiKey.CreatedTime,
		},
	})
}

// 删除API Key
func DeleteClaudeCodeAPIKey(c *gin.Context) {
	userId := c.GetInt("id")
	keyId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "无效的API Key ID",
		})
		return
	}

	err = model.DeleteClaudeCodeAPIKey(keyId, userId)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "删除失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "删除成功",
	})
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

// Claude Code API 代理
func ClaudeCodeProxy(c *gin.Context) {
	// 从Header获取API Key
	apiKey := c.GetHeader("Authorization")
	if apiKey == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "缺少API Key",
		})
		return
	}

	// 移除Bearer前缀
	if strings.HasPrefix(apiKey, "Bearer ") {
		apiKey = strings.TrimPrefix(apiKey, "Bearer ")
	}

	// 验证API Key
	_, subscription, err := model.ValidateClaudeCodeAPIKey(apiKey)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": err.Error(),
		})
		return
	}

	// 验证客户端指纹
	clientInfoHeader := c.GetHeader("X-Client-Info")
	if clientInfoHeader == "" {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "需要客户端验证信息",
		})
		return
	}

	var clientInfo model.ClientFingerprint
	if err := json.Unmarshal([]byte(clientInfoHeader), &clientInfo); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "无效的客户端信息",
		})
		return
	}

	// 生成并验证客户端指纹
	fingerprint := model.GenerateClientFingerprint(clientInfo)
	if err := subscription.ValidateClientFingerprint(fingerprint); err != nil {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "客户端验证失败: " + err.Error(),
		})
		return
	}

	// 检查User-Agent，必须是Claude Code客户端
	userAgent := c.GetHeader("User-Agent")
	if !strings.Contains(userAgent, "Claude-Code-Client") {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "只允许Claude Code客户端访问",
		})
		return
	}

	// 验证Referer，防止网页端调用
	referer := c.GetHeader("Referer")
	if referer != "" && (strings.Contains(referer, "http://") || strings.Contains(referer, "https://")) {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "不允许从网页端访问",
		})
		return
	}

	// 获取请求体
	var proxyReq ClaudeProxyRequest
	if err := c.ShouldBindJSON(&proxyReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "请求参数错误",
		})
		return
	}

	// 获取Claude渠道
	channel, err := getAvailableClaudeChannel()
	if err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error": "Claude服务暂时不可用",
		})
		return
	}

	// 创建Claude提供商
	provider := providers.GetProvider(channel, c)
	if provider == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error": "无法创建Claude提供商",
		})
		return
	}

	// 验证provider存在
	if provider == nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "提供商不可用",
		})
		return
	}

	// 记录使用日志
	go func() {
		model.UpdateClaudeCodeUsage(subscription.Id, 1)

		usageLog := &model.ClaudeCodeUsageLog{
			UserId:         subscription.UserId,
			SubscriptionId: subscription.Id,
			RequestType:    "chat",
			TokensUsed:     1,
			ClientInfo:     clientInfoHeader,
			IpAddress:      c.ClientIP(),
			UserAgent:      userAgent,
		}
		model.CreateClaudeCodeUsageLog(usageLog)
	}()

	// TODO: 实现Claude API调用
	// 这里需要实际调用Claude API
	response := map[string]interface{}{
		"object": "chat.completion",
		"model":  proxyReq.Model,
		"choices": []map[string]interface{}{
			{
				"index": 0,
				"message": map[string]interface{}{
					"role":    "assistant",
					"content": "这是一个Claude Code API的测试响应。您的请求已收到并处理。",
				},
				"finish_reason": "stop",
			},
		},
		"usage": map[string]interface{}{
			"prompt_tokens":     100,
			"completion_tokens": 50,
			"total_tokens":      150,
		},
	}

	c.JSON(http.StatusOK, response)
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
func GetClaudeCodeUsageStats(c *gin.Context) {
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

	stats, err := model.GetClaudeCodeUsageStats(userId, startTime, endTime)
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
func CancelClaudeCodeSubscription(c *gin.Context) {
	userId := c.GetInt("id")

	subscription, err := model.GetUserActiveClaudeCodeSubscription(userId)
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

	if err := model.UpdateClaudeCodeSubscription(subscription); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "取消订阅失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "订阅已取消，将在到期时失效",
	})
}

// 管理员获取所有订阅（管理后台用）
func GetAllClaudeCodeSubscriptions(c *gin.Context) {
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

	var subscriptions []model.ClaudeCodeSubscription
	var total int64

	// 构建查询
	query := model.DB.Model(&model.ClaudeCodeSubscription{})

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
	Duration int    `json:"duration" binding:"required"` // 订阅时长，单位：月
	Reason   string `json:"reason"`                      // 发放原因
}

// 管理员手动发放套餐
func AdminGrantClaudeCodeSubscription(c *gin.Context) {
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
	plan, err := model.GetClaudeCodePlanByType(req.PlanType)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "套餐不存在",
		})
		return
	}

	// 检查用户是否已有活跃订阅
	existingSubscription, _ := model.GetUserActiveClaudeCodeSubscription(req.UserId)
	if existingSubscription != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "用户已有活跃订阅，请先处理现有订阅",
		})
		return
	}

	// 计算订阅时间
	now := utils.GetTimestamp()
	endTime := now + int64(req.Duration*30*24*3600) // 简单按30天/月计算

	// 创建订阅记录
	subscription := &model.ClaudeCodeSubscription{
		UserId:                req.UserId,
		PlanType:              plan.Type,
		Status:                "active",
		StartTime:             now,
		EndTime:               endTime,
		AutoRenew:             false, // 手动发放的订阅默认不自动续费
		MaxRequestsPerMonth:   plan.MaxRequestsPerMonth,
		UsedRequestsThisMonth: 0,
		MaxClientCount:        plan.MaxClientCount,
		AllowedClients:        "",
		Price:                 0, // 管理员发放免费
		Currency:              plan.Currency,
		PaymentMethod:         "admin_grant",
		OrderId:               fmt.Sprintf("admin_grant_%d_%d", req.UserId, now),
		CreatedTime:           now,
		UpdatedTime:           now,
	}

	// 保存订阅
	if err := model.CreateClaudeCodeSubscription(subscription); err != nil {
		logger.SysError("管理员发放套餐失败: " + err.Error())
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "发放套餐失败",
		})
		return
	}

	// 记录管理员操作日志
	adminId := c.GetInt("id")
	logger.SysLog(fmt.Sprintf("管理员 %d 为用户 %d 手动发放 %s 套餐，时长 %d 个月，原因: %s",
		adminId, req.UserId, req.PlanType, req.Duration, req.Reason))

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "套餐发放成功",
		"data":    subscription,
	})
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
func AdminCancelClaudeCodeSubscription(c *gin.Context) {
	subscriptionId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "订阅ID错误",
		})
		return
	}

	// 获取订阅信息
	subscription, err := model.GetClaudeCodeSubscriptionById(subscriptionId)
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

	if err := model.UpdateClaudeCodeSubscription(subscription); err != nil {
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
