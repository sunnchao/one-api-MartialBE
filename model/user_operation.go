package model

import (
	"fmt"
	"math/rand"
	"one-api/common"
	"one-api/common/config"
	"one-api/common/utils"
	"time"
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
	var userOperation UserOperation
	err := DB.Model(&UserOperation{}).
		Where("user_id = ? AND type = ?", userId, 1).
		Order("id desc").
		First(&userOperation).Error
	if err != nil {
		return nil, err
	}
	return &userOperation, nil
}

// createOperation 创建用户操作记录
func createOperation(operation *UserOperation) error {
	return DB.Create(operation).Error
}

const (
	CheckInType      = 1
	MinCheckInQuota  = 5000
	BaseCoefficient  = 0.18
	BonusCoefficient = 0.03
	TopBonusCoefficient = 0.06
)

// ProcessCheckIn 处理用户签到
func ProcessCheckIn(userId int, lastDayUsed int64, requestIP string) (int, error) {
	// 计算签到奖励额度
	quota := calculateCheckInQuota(lastDayUsed)
	
	// 检查用户现有额度并调整奖励
	userQuota, err := GetUserQuota(userId)
	if err != nil {
		return 0, fmt.Errorf("failed to get user quota: %w", err)
	}
	
	if userQuota <= 0 {
		quota = quota / 10
	}

	// 更新用户额度
	if err := increaseUserQuota(userId, quota); err != nil {
		return 0, fmt.Errorf("failed to increase user quota: %w", err)
	}

	// 创建操作记录
	remark := fmt.Sprintf("签到, 获得额度 %v", common.LogQuota(quota))
	operation := &UserOperation{
		UserId:      userId,
		Type:        CheckInType,
		Remark:      remark,
		CreatedTime: time.Now().UnixMilli(),
	}
	
	if err := createOperation(operation); err != nil {
		return 0, fmt.Errorf("failed to create operation record: %w", err)
	}

	RecordLogWithRequestIP(userId, LogTypeUserQuoteIncrease, remark, requestIP)
	return quota, nil
}

// calculateCheckInQuota 计算签到奖励额度
func calculateCheckInQuota(lastDayUsed int64) int {
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))
	
	probability := rng.Float64()
	coefficient := rng.Float64() * BaseCoefficient
	
	switch {
	case probability >= 0.75 && probability < 0.95:
		coefficient += BonusCoefficient
	case probability >= 0.95:
		coefficient += TopBonusCoefficient
	}
	
	quota := int(coefficient * float64(lastDayUsed))
	if quota < MinCheckInQuota {
		quota = MinCheckInQuota
	}
	
	return quota
}

// IsCheckInToday 判断用户是否已签到
func IsCheckInToday(userId int) (int64, int64, error) {
	userOperation, err := GetLatestCheckInOperation(userId)
	localZeroTime := utils.GetLocalZeroTime()
	
	if err != nil {
		// 没有找到签到记录，返回昨日使用量
		lastDayUsed, err := GetUserQuotaUsedByPeriod(userId, localZeroTime)
		return -1, lastDayUsed, err
	}
	
	// 比较签到时间是否在今日零点之后
	if userOperation.CreatedTime >= localZeroTime.UnixMilli() {
		// 已签到
		return userOperation.CreatedTime, -1, nil
	}
	
	// 未签到，获取昨日使用量
	lastDayUsed, err := GetUserQuotaUsedByPeriod(userId, localZeroTime)
	return 1, lastDayUsed, err
}

// GetUserQuotaUsedByPeriod 获取昨日的累计使用额度
func GetUserQuotaUsedByPeriod(userId int, zeroTime time.Time) (int64, error) {
	now := time.Now()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	
	// 获取昨日的开始和结束时间
	startOfYesterday := today.AddDate(0, 0, -1).Format("2006-01-02")
	endOfYesterday := today.Add(-time.Second).Format("2006-01-02")
	
	dashboards, err := GetUserModelStatisticsByPeriod(userId, startOfYesterday, endOfYesterday)
	if err != nil {
		return 0, fmt.Errorf("failed to get user statistics: %w", err)
	}
	
	// 计算总使用量
	var used int64
	for _, dashboard := range dashboards {
		used += dashboard.Quota
	}
	
	// 设置保底值
	minQuota := int64(config.QuotaPerUnit * 0.25)
	if used < minQuota {
		used = minQuota
	}
	
	return used, nil
}

// GetCheckInList 获取签到列表（仅返回本月和上个月的记录）
func GetCheckInList(userId int) ([]UserOperation, error) {
	now := time.Now()
	// 获取上个月第一天
	firstDayOfLastMonth := time.Date(now.Year(), now.Month()-1, 1, 0, 0, 0, 0, now.Location())
	
	var checkInList []UserOperation
	err := DB.Model(&UserOperation{}).
		Where("user_id = ? AND type = ? AND created_time >= ?", userId, CheckInType, firstDayOfLastMonth.Unix()).
		Order("id desc").
		Find(&checkInList).Error
	
	if err != nil {
		return nil, fmt.Errorf("failed to get check-in list: %w", err)
	}
	
	return checkInList, nil
}
