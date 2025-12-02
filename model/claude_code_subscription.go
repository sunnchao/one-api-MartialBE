package model

import (
	"crypto/md5"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"one-api/common/database"
	"one-api/common/logger"
	"one-api/common/utils"
	"strconv"
	"strings"

	"gorm.io/gorm"
)

const (
	DurationUnitDay     = "day"
	DurationUnitWeek    = "week"
	DurationUnitMonth   = "month"
	DurationUnitQuarter = "quarter"
)

var durationUnitToSeconds = map[string]int64{
	DurationUnitDay:     24 * 60 * 60,
	DurationUnitWeek:    7 * 24 * 60 * 60,
	DurationUnitMonth:   30 * 24 * 60 * 60,
	DurationUnitQuarter: 90 * 24 * 60 * 60,
}

const (
	CheckinRewardPlanType        = "claude_code_checkin_reward"
	checkinRewardPlanName        = "Claude Code 签到福利"
	checkinRewardPlanDescription = "每日签到赠送的体验套餐"
	checkinRewardPlanQuota       = 200000
	checkinRewardPlanDuration    = 1
)

// Claude Code 订阅模型
type ClaudeCodeSubscription struct {
	Id            int     `json:"id" gorm:"primaryKey"`
	UserId        int     `json:"user_id" gorm:"index"`
	ServiceType   string  `json:"service_type" gorm:"type:varchar(50);index;default:'claude_code'"` // claude_code, codex_code, gemini_code
	PlanType      string  `json:"plan_type"`                                                        // basic, pro, enterprise
	Status        string  `json:"status" gorm:"default:'active'"`                                   // active, expired, cancelled, pending
	StartTime     int64   `json:"start_time"`
	EndTime       int64   `json:"end_time" gorm:"index"`
	AutoRenew     bool    `json:"auto_renew" gorm:"default:true"`
	TotalQuota    int     `json:"total_quota" gorm:"default:0"`  // 总额度
	RemainQuota   int     `json:"remain_quota" gorm:"default:0"` // 剩余额度
	UsedQuota     int     `json:"used_quota" gorm:"default:0"`   // 已使用额度
	Price         float64 `json:"price"`
	Currency      string  `json:"currency" gorm:"default:'USD'"`
	PaymentMethod string  `json:"payment_method"`
	OrderId       string  `json:"order_id" gorm:"index"` // 关联支付订单
	CreatedTime   int64   `json:"created_time"`
	UpdatedTime   int64   `json:"updated_time"`

	// 客户端验证相关字段
	ClientFingerprint string `json:"client_fingerprint" gorm:"index"`   // 客户端指纹
	AllowedClients    string `json:"allowed_clients"`                   // 允许的客户端列表，JSON格式
	MaxClientCount    int    `json:"max_client_count" gorm:"default:3"` // 最大允许的客户端数量
}

// Claude Code 套餐模型
type ClaudeCodePlan struct {
	Id             int     `json:"id" gorm:"primaryKey"`
	Name           string  `json:"name"`
	Type           string  `json:"type" gorm:"unique"`
	ServiceType    string  `json:"service_type" gorm:"type:varchar(50);index;default:'claude_code'"` // claude_code, codex_code, gemini_code
	Description    string  `json:"description"`
	Price          float64 `json:"price"`
	Currency       string  `json:"currency" gorm:"default:'USD'"`
	TotalQuota     int     `json:"total_quota" gorm:"default:0"` // 总额度
	MaxClientCount int     `json:"max_client_count" gorm:"default:3"`
	// 时间限制设置
	IsUnlimitedTime bool                                      `json:"is_unlimited_time" gorm:"default:false"` // 是否无时间限制
	DurationMonths  int                                       `json:"duration_months" gorm:"default:1"`       // 订阅时长(月)，当 IsUnlimitedTime 为 false 时有效（兼容字段）
	DurationUnit    string                                    `json:"duration_unit" gorm:"type:varchar(20);default:'month'"`
	DurationValue   int                                       `json:"duration_value" gorm:"default:1"`
	Features        database.JSONType[map[string]interface{}] `json:"features"`
	IsActive        bool                                      `json:"is_active" gorm:"default:true"`
	ShowInPortal    bool                                      `json:"show_in_portal" gorm:"default:true"`
	SortOrder       int                                       `json:"sort_order" gorm:"default:0"`
	CreatedTime     int64                                     `json:"created_time"`
	UpdatedTime     int64                                     `json:"updated_time"`
}

func NormalizeDurationUnit(unit string) string {
	normalized := strings.ToLower(strings.TrimSpace(unit))
	if normalized == "" {
		normalized = DurationUnitMonth
	}
	if _, ok := durationUnitToSeconds[normalized]; !ok {
		normalized = DurationUnitMonth
	}
	return normalized
}

func IsSupportedDurationUnit(unit string) bool {
	_, ok := durationUnitToSeconds[strings.ToLower(strings.TrimSpace(unit))]
	return ok
}

func (plan *ClaudeCodePlan) NormalizeDurationFields() {
	if plan == nil {
		return
	}
	plan.DurationUnit = NormalizeDurationUnit(plan.DurationUnit)
	if plan.DurationValue <= 0 {
		if plan.DurationMonths > 0 {
			if plan.DurationUnit == DurationUnitQuarter {
				plan.DurationValue = plan.DurationMonths / 3
				if plan.DurationValue == 0 {
					plan.DurationValue = 1
				}
			} else {
				plan.DurationValue = plan.DurationMonths
			}
		} else {
			plan.DurationValue = 1
		}
	}
	if plan.DurationUnit == DurationUnitMonth && plan.DurationMonths == 0 {
		plan.DurationMonths = plan.DurationValue
	}
	if plan.DurationUnit == DurationUnitQuarter && plan.DurationMonths == 0 {
		plan.DurationMonths = plan.DurationValue * 3
	}
}

func (plan *ClaudeCodePlan) DurationSeconds() int64 {
	if plan == nil {
		return 0
	}
	plan.NormalizeDurationFields()
	baseSeconds, ok := durationUnitToSeconds[plan.DurationUnit]
	if !ok {
		baseSeconds = durationUnitToSeconds[DurationUnitMonth]
	}
	return int64(plan.DurationValue) * baseSeconds
}

func DurationValueToSeconds(unit string, value int) int64 {
	normalizedUnit := NormalizeDurationUnit(unit)
	if value <= 0 {
		value = 1
	}
	baseSeconds := durationUnitToSeconds[normalizedUnit]
	return int64(value) * baseSeconds
}

func EnsureCheckinRewardPlan() (*ClaudeCodePlan, error) {
	plan, err := GetClaudeCodePlanByType(CheckinRewardPlanType)
	if err == nil {
		return plan, nil
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}
	now := utils.GetTimestamp()
	plan = &ClaudeCodePlan{
		Name:            checkinRewardPlanName,
		Type:            CheckinRewardPlanType,
		ServiceType:     "claude_code",
		Description:     checkinRewardPlanDescription,
		Price:           0,
		Currency:        "USD",
		TotalQuota:      checkinRewardPlanQuota,
		MaxClientCount:  1,
		IsUnlimitedTime: false,
		DurationUnit:    DurationUnitDay,
		DurationValue:   checkinRewardPlanDuration,
		DurationMonths:  0,
		Features:        database.JSONType[map[string]interface{}]{},
		IsActive:        true,
		ShowInPortal:    false,
		SortOrder:       100,
		CreatedTime:     now,
		UpdatedTime:     now,
	}

	if err := DB.Create(plan).Error; err != nil {
		return nil, err
	}

	return plan, nil
}

func GrantPlanToUser(userId int, plan *ClaudeCodePlan, source string, allowStack bool) (*ClaudeCodeSubscription, bool, error) {
	if plan == nil {
		return nil, false, errors.New("plan is nil")
	}
	now := utils.GetTimestamp()
	durationSeconds := plan.DurationSeconds()
	if plan.ServiceType == "" {
		plan.ServiceType = "claude_code"
	}

	subscription, err := GetUserActiveClaudeCodeSubscription(userId, plan.ServiceType)
	if err == nil && subscription != nil && allowStack {
		// 允许叠加：在原有订阅上增加额度和时长
		updates := map[string]interface{}{
			"total_quota":  gorm.Expr("total_quota + ?", plan.TotalQuota),
			"remain_quota": gorm.Expr("remain_quota + ?", plan.TotalQuota),
			"updated_time": now,
		}
		if !plan.IsUnlimitedTime && durationSeconds > 0 {
			updates["end_time"] = subscription.EndTime + durationSeconds
		}
		if plan.IsUnlimitedTime {
			updates["end_time"] = now + 100*365*24*60*60
		}
		if err := DB.Model(&ClaudeCodeSubscription{}).Where("id = ?", subscription.Id).Updates(updates).Error; err != nil {
			return nil, false, err
		}
		subscription.TotalQuota += plan.TotalQuota
		subscription.RemainQuota += plan.TotalQuota
		if plan.IsUnlimitedTime {
			subscription.EndTime = now + 100*365*24*60*60
		} else if durationSeconds > 0 {
			subscription.EndTime += durationSeconds
		}
		subscription.UpdatedTime = now
		return subscription, true, nil
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, false, err
	}

	endTime := now
	if plan.IsUnlimitedTime {
		endTime += 100 * 365 * 24 * 60 * 60
	} else if durationSeconds > 0 {
		endTime += durationSeconds
	} else {
		endTime += 30 * 24 * 60 * 60
	}

	newSubscription := &ClaudeCodeSubscription{
		UserId:         userId,
		PlanType:       plan.Type,
		ServiceType:    plan.ServiceType,
		Status:         "active",
		StartTime:      now,
		EndTime:        endTime,
		AutoRenew:      false,
		TotalQuota:     plan.TotalQuota,
		RemainQuota:    plan.TotalQuota,
		UsedQuota:      0,
		Price:          plan.Price,
		Currency:       plan.Currency,
		PaymentMethod:  source,
		OrderId:        fmt.Sprintf("%s_%d_%d", source, userId, now),
		CreatedTime:    now,
		UpdatedTime:    now,
		MaxClientCount: plan.MaxClientCount,
	}

	if err := CreateClaudeCodeSubscription(newSubscription); err != nil {
		return nil, true, err
	}

	return newSubscription, true, nil
}

// Claude Code 使用记录
type ClaudeCodeUsageLog struct {
	Id             int    `json:"id" gorm:"primaryKey"`
	UserId         int    `json:"user_id" gorm:"index"`
	SubscriptionId int    `json:"subscription_id" gorm:"index"`
	RequestType    string `json:"request_type"` // chat, code_generation, code_review
	TokensUsed     int    `json:"tokens_used"`
	ClientInfo     string `json:"client_info"` // 客户端信息
	IpAddress      string `json:"ip_address"`
	UserAgent      string `json:"user_agent"`
	CreatedTime    int64  `json:"created_time" gorm:"index"`
}

// Claude Code API Key 模型
type ClaudeCodeAPIKey struct {
	Id             int    `json:"id" gorm:"primaryKey"`
	UserId         int    `json:"user_id" gorm:"index"`
	SubscriptionId int    `json:"subscription_id" gorm:"index"`
	KeyHash        string `json:"key_hash" gorm:"type:varchar(64);uniqueIndex"` // API Key的哈希值，限制长度
	Name           string `json:"name"`
	Status         int    `json:"status" gorm:"default:1"` // 1=active, 0=disabled
	LastUsedTime   int64  `json:"last_used_time"`
	UsageCount     int64  `json:"usage_count" gorm:"default:0"`
	CreatedTime    int64  `json:"created_time"`
	UpdatedTime    int64  `json:"updated_time"`
}

// 客户端指纹结构
type ClientFingerprint struct {
	MachineId   string `json:"machine_id"`
	Platform    string `json:"platform"`
	Hostname    string `json:"hostname"`
	UserId      string `json:"user_id"`
	ProcessName string `json:"process_name"`
	Version     string `json:"version"`
}

// MD5哈希函数
func getMD5Hash(text string) string {
	hash := md5.Sum([]byte(text))
	return hex.EncodeToString(hash[:])
}

// 允许的客户端数据库字段
var allowedClaudeCodeSubscriptionOrderFields = map[string]bool{
	"id":           true,
	"user_id":      true,
	"plan_type":    true,
	"status":       true,
	"start_time":   true,
	"end_time":     true,
	"created_time": true,
}

// 获取用户当前有效订阅（按服务类型查询）
func GetUserActiveClaudeCodeSubscription(userId int, serviceType string) (*ClaudeCodeSubscription, error) {
	var subscription ClaudeCodeSubscription
	now := utils.GetTimestamp()

	query := DB.Where("user_id = ? AND status = 'active' AND end_time > ?",
		userId, now)

	// 如果指定了服务类型，添加过滤条件
	if serviceType != "" {
		query = query.Where("service_type = ?", serviceType)
	}

	err := query.First(&subscription).Error

	if err != nil {
		return nil, err
	}

	return &subscription, nil
}

// GetUserActiveClaudeCodeSubscriptions 获取用户所有活跃订阅（按到期时间升序排序，优先返回快过期的）
func GetUserActiveClaudeCodeSubscriptions(userId int, serviceType string) ([]ClaudeCodeSubscription, error) {
	var subscriptions []ClaudeCodeSubscription
	now := utils.GetTimestamp()

	query := DB.Where("user_id = ? AND status = 'active' AND end_time > ? AND remain_quota > 0",
		userId, now)

	// 如果指定了服务类型，添加过滤条件
	if serviceType != "" {
		query = query.Where("service_type = ?", serviceType)
	}

	// 按到期时间升序排序，优先返回快过期的订阅
	err := query.Order("end_time ASC").Find(&subscriptions).Error

	if err != nil {
		return nil, err
	}

	return subscriptions, nil
}

// 根据订阅ID获取订阅
func GetClaudeCodeSubscriptionById(id int) (*ClaudeCodeSubscription, error) {
	var subscription ClaudeCodeSubscription
	err := DB.Where("id = ?", id).First(&subscription).Error
	return &subscription, err
}

// 创建订阅
func CreateClaudeCodeSubscription(subscription *ClaudeCodeSubscription) error {
	subscription.CreatedTime = utils.GetTimestamp()
	subscription.UpdatedTime = utils.GetTimestamp()
	return DB.Create(subscription).Error
}

// 更新订阅
func UpdateClaudeCodeSubscription(subscription *ClaudeCodeSubscription) error {
	subscription.UpdatedTime = utils.GetTimestamp()
	return DB.Save(subscription).Error
}

// 更新订阅使用量（改为额度制）
func UpdateClaudeCodeUsage(subscriptionId int, quotaUsed int) error {
	result := DB.Model(&ClaudeCodeSubscription{}).
		Where("id = ? AND remain_quota >= ?", subscriptionId, quotaUsed).
		Updates(map[string]interface{}{
			"remain_quota": gorm.Expr("remain_quota - ?", quotaUsed),
			"used_quota":   gorm.Expr("used_quota + ?", quotaUsed),
			"updated_time": utils.GetTimestamp(),
		})

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errors.New("订阅额度不足")
	}

	// 检查额度是否用尽，更新状态
	go func() {
		var sub ClaudeCodeSubscription
		if err := DB.Where("id = ?", subscriptionId).First(&sub).Error; err == nil {
			if sub.RemainQuota <= 0 {
				DB.Model(&ClaudeCodeSubscription{}).
					Where("id = ?", subscriptionId).
					Update("status", "exhausted")
			}
		}
	}()

	return nil
}

// 重置月度使用量（定时任务调用）
func ResetMonthlyClaudeCodeUsage() error {
	return DB.Model(&ClaudeCodeSubscription{}).
		Where("status = 'active'").
		Updates(map[string]interface{}{
			"used_requests_this_month": 0,
			"updated_time":             utils.GetTimestamp(),
		}).Error
}

// 检查订阅是否可以使用
func (s *ClaudeCodeSubscription) CanUseService() bool {
	now := utils.GetTimestamp()
	return s.Status == "active" &&
		s.StartTime <= now &&
		s.EndTime > now &&
		s.RemainQuota > 0 // 改为检查剩余额度
}

// 验证客户端指纹
func (s *ClaudeCodeSubscription) ValidateClientFingerprint(fingerprint string) error {
	if s.ClientFingerprint == "" {
		// 首次使用，记录客户端指纹
		s.ClientFingerprint = fingerprint
		return UpdateClaudeCodeSubscription(s)
	}

	// 检查是否是已注册的客户端
	if s.ClientFingerprint == fingerprint {
		return nil
	}

	// 检查允许的客户端列表
	var allowedClients []string
	if s.AllowedClients != "" {
		if err := json.Unmarshal([]byte(s.AllowedClients), &allowedClients); err != nil {
			logger.SysError("解析允许的客户端列表失败: " + err.Error())
			return errors.New("客户端验证失败")
		}
	}

	// 检查是否在允许列表中
	for _, client := range allowedClients {
		if client == fingerprint {
			return nil
		}
	}

	// 检查是否超过最大客户端数量
	if len(allowedClients) >= s.MaxClientCount {
		return errors.New("已达到最大客户端数量限制")
	}

	// 添加到允许列表
	allowedClients = append(allowedClients, fingerprint)
	allowedClientsJSON, err := json.Marshal(allowedClients)
	if err != nil {
		return errors.New("更新客户端列表失败")
	}

	s.AllowedClients = string(allowedClientsJSON)
	return UpdateClaudeCodeSubscription(s)
}

// 生成客户端指纹
func GenerateClientFingerprint(clientInfo ClientFingerprint) string {
	data := fmt.Sprintf("%s-%s-%s-%s-%s-%s",
		clientInfo.MachineId,
		clientInfo.Platform,
		clientInfo.Hostname,
		clientInfo.UserId,
		clientInfo.ProcessName,
		clientInfo.Version)

	hash := md5.Sum([]byte(data))
	return hex.EncodeToString(hash[:])
}

// 创建 Claude Code API Key
func CreateClaudeCodeAPIKey(userId, subscriptionId int, name string) (*ClaudeCodeAPIKey, string, error) {
	// 生成随机密钥
	randomBytes := make([]byte, 32)
	_, err := rand.Read(randomBytes)
	if err != nil {
		return nil, "", err
	}

	keyString := fmt.Sprintf("cc-sk-%s", hex.EncodeToString(randomBytes))
	keyHash := getMD5Hash(keyString)

	apiKey := &ClaudeCodeAPIKey{
		UserId:         userId,
		SubscriptionId: subscriptionId,
		KeyHash:        keyHash,
		Name:           name,
		Status:         1,
		CreatedTime:    utils.GetTimestamp(),
		UpdatedTime:    utils.GetTimestamp(),
	}

	err = DB.Create(apiKey).Error
	if err != nil {
		return nil, "", err
	}

	return apiKey, keyString, nil
}

// 验证 Claude Code API Key
func ValidateClaudeCodeAPIKey(keyString string) (*ClaudeCodeAPIKey, *ClaudeCodeSubscription, error) {
	keyHash := getMD5Hash(keyString)

	var apiKey ClaudeCodeAPIKey
	err := DB.Where("key_hash = ? AND status = 1", keyHash).First(&apiKey).Error
	if err != nil {
		return nil, nil, errors.New("无效的API Key")
	}

	// 获取订阅信息
	subscription, err := GetClaudeCodeSubscriptionById(apiKey.SubscriptionId)
	if err != nil {
		return nil, nil, errors.New("订阅不存在")
	}

	// 检查订阅是否有效
	if !subscription.CanUseService() {
		return nil, nil, errors.New("订阅已过期或已达到使用限制")
	}

	// 更新使用信息
	go func() {
		DB.Model(&apiKey).Updates(map[string]interface{}{
			"last_used_time": utils.GetTimestamp(),
			"usage_count":    gorm.Expr("usage_count + 1"),
			"updated_time":   utils.GetTimestamp(),
		})
	}()

	return &apiKey, subscription, nil
}

// 获取用户的 Claude Code API Keys
func GetUserClaudeCodeAPIKeys(userId int) ([]ClaudeCodeAPIKey, error) {
	var apiKeys []ClaudeCodeAPIKey
	err := DB.Where("user_id = ?", userId).Order("created_time DESC").Find(&apiKeys).Error
	return apiKeys, err
}

// 删除 Claude Code API Key
func DeleteClaudeCodeAPIKey(id, userId int) error {
	return DB.Where("id = ? AND user_id = ?", id, userId).Delete(&ClaudeCodeAPIKey{}).Error
}

// 获取所有套餐

func GetAllClaudeCodePlans(includeHidden bool) ([]ClaudeCodePlan, error) {
	var plans []ClaudeCodePlan
	query := DB.Where("is_active = true")
	if !includeHidden {
		query = query.Where("show_in_portal = true")
	}
	err := query.Order("sort_order ASC, price ASC").Find(&plans).Error
	if err != nil {
		return plans, err
	}
	for i := range plans {
		plans[i].NormalizeDurationFields()
	}
	return plans, nil
}

// 根据类型获取套餐
func GetClaudeCodePlanByType(planType string) (*ClaudeCodePlan, error) {
	var plan ClaudeCodePlan
	err := DB.Where("type = ? AND is_active = true", planType).First(&plan).Error
	if err != nil {
		return nil, err
	}
	plan.NormalizeDurationFields()
	return &plan, nil
}

// GetClaudeCodePlanById 根据ID获取套餐
func GetClaudeCodePlanById(planId int) (*ClaudeCodePlan, error) {
	var plan ClaudeCodePlan
	err := DB.Where("id = ?", planId).First(&plan).Error
	if err != nil {
		return nil, err
	}
	plan.NormalizeDurationFields()
	return &plan, nil
}

// CreateClaudeCodePlan 创建套餐
func CreateClaudeCodePlan(plan *ClaudeCodePlan) error {
	return DB.Create(plan).Error
}

// UpdateClaudeCodePlan 更新套餐
func UpdateClaudeCodePlan(plan *ClaudeCodePlan) error {
	return DB.Save(plan).Error
}

// DeleteClaudeCodePlan 删除套餐
func DeleteClaudeCodePlan(planId int) error {
	return DB.Delete(&ClaudeCodePlan{}, planId).Error
}

// CheckClaudeCodePlanHasSubscriptions 检查套餐是否有关联的订阅
func CheckClaudeCodePlanHasSubscriptions(planId int) (bool, error) {
	var plan ClaudeCodePlan
	if err := DB.Where("id = ?", planId).First(&plan).Error; err != nil {
		return false, err
	}

	var count int64
	err := DB.Model(&ClaudeCodeSubscription{}).
		Where("plan_type = ?", plan.Type).
		Count(&count).Error

	return count > 0, err
}

// 创建使用日志
func CreateClaudeCodeUsageLog(log *ClaudeCodeUsageLog) error {
	log.CreatedTime = utils.GetTimestamp()
	return DB.Create(log).Error
}

// 获取用户使用统计
func GetClaudeCodeUsageStats(userId int, startTime, endTime int64) (map[string]interface{}, error) {
	var stats map[string]interface{}

	// 总请求数
	var totalRequests int64
	DB.Model(&ClaudeCodeUsageLog{}).
		Where("user_id = ? AND created_time BETWEEN ? AND ?", userId, startTime, endTime).
		Count(&totalRequests)

	// 按类型统计
	var typeStats []struct {
		RequestType string `json:"request_type"`
		Count       int64  `json:"count"`
	}
	DB.Model(&ClaudeCodeUsageLog{}).
		Select("request_type, count(*) as count").
		Where("user_id = ? AND created_time BETWEEN ? AND ?", userId, startTime, endTime).
		Group("request_type").
		Scan(&typeStats)

	stats = map[string]interface{}{
		"total_requests": totalRequests,
		"type_stats":     typeStats,
	}

	return stats, nil
}

// 初始化 Claude Code 套餐
func InitClaudeCodePlans() {
	plans := []ClaudeCodePlan{
		{
			Name:            "基础版",
			Type:            "basic",
			Description:     "适合个人开发者的基础AI编程助手",
			Price:           9.99,
			Currency:        "USD",
			MaxClientCount:  1,
			IsUnlimitedTime: false,
			DurationMonths:  1,
			DurationUnit:    DurationUnitMonth,
			DurationValue:   1,
			Features:        database.JSONType[map[string]interface{}]{},
			IsActive:        true,
			ShowInPortal:    true,
			SortOrder:       1,
			CreatedTime:     utils.GetTimestamp(),
			UpdatedTime:     utils.GetTimestamp(),
		},
		{
			Name:            "专业版",
			Type:            "pro",
			Description:     "适合专业开发团队的完整AI编程解决方案",
			Price:           29.99,
			Currency:        "USD",
			MaxClientCount:  3,
			IsUnlimitedTime: false,
			DurationMonths:  1,
			DurationUnit:    DurationUnitMonth,
			DurationValue:   1,
			Features:        database.JSONType[map[string]interface{}]{},
			IsActive:        true,
			ShowInPortal:    true,
			SortOrder:       2,
			CreatedTime:     utils.GetTimestamp(),
			UpdatedTime:     utils.GetTimestamp(),
		},
		{
			Name:            "企业版",
			Type:            "enterprise",
			Description:     "适合大型企业的定制化AI编程服务",
			Price:           99.99,
			Currency:        "USD",
			MaxClientCount:  10,
			IsUnlimitedTime: true,
			DurationMonths:  0, // 无时间限制时设为0
			DurationUnit:    DurationUnitMonth,
			DurationValue:   0,
			Features:        database.JSONType[map[string]interface{}]{},
			IsActive:        true,
			ShowInPortal:    true,
			SortOrder:       3,
			CreatedTime:     utils.GetTimestamp(),
			UpdatedTime:     utils.GetTimestamp(),
		},
	}

	for _, plan := range plans {
		var existingPlan ClaudeCodePlan
		if err := DB.Where("type = ?", plan.Type).First(&existingPlan).Error; err != nil {
			// 套餐不存在，创建新的
			if err := DB.Create(&plan).Error; err != nil {
				logger.SysError(fmt.Sprintf("创建Claude Code套餐失败: %s", err.Error()))
			} else {
				logger.SysLog(fmt.Sprintf("创建Claude Code套餐成功: %s", plan.Name))
			}
		}
	}
}

// 检查过期订阅并更新状态
func CheckExpiredClaudeCodeSubscriptions() error {
	now := utils.GetTimestamp()
	return DB.Model(&ClaudeCodeSubscription{}).
		Where("status = 'active' AND end_time <= ?", now).
		Update("status", "expired").Error
}

// 搜索用户
func SearchUsers(keyword string, page, pageSize int) ([]User, int64, error) {
	var users []User
	var total int64

	query := DB.Model(&User{})

	// 如果有搜索关键词，添加搜索条件
	if keyword != "" {
		// 尝试解析为数字（用户ID搜索）
		if userId, err := strconv.Atoi(keyword); err == nil {
			query = query.Where("id = ?", userId)
		} else {
			// 按用户名或邮箱搜索
			query = query.Where("username LIKE ? OR email LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
		}
	}

	// 计算总数
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 分页查询
	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Order("id DESC").Find(&users).Error; err != nil {
		return nil, 0, err
	}

	return users, total, nil
}
