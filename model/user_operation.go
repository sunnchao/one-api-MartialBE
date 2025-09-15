package model

import (
	"fmt"
	"math/rand"
	"one-api/common"
	"one-api/common/config"
	"one-api/common/logger"
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
	CheckInType          = 1
	MinCheckInQuota      = 5000
	BaseMinRatio         = 0.01 // 基础最小比例 0.01
	BaseLowMaxRatio      = 0.2  // 低额度最大比例 0.2
	BaseHighMaxRatio     = 0.25 // 高额度最大比例 0.25
	BonusRatio           = 0.25 // 额外奖励比例 0.25
	BonusProbability     = 0.1  // 额外奖励概率 10%
	HighRatioProbability = 0.75 // 获得高额度(>0.2)的概率 75%
	CouponProbability    = 0.05 // 获得优惠券的概率 5%
)

// 签到奖励结果
type CheckInRewardResult struct {
	Quota  int         `json:"quota"`
	Coupon *UserCoupon `json:"coupon,omitempty"`
}

// ProcessCheckIn 处理用户签到
func ProcessCheckIn(userId int, requestIP string) (*CheckInRewardResult, error) {
	// 计算签到奖励额度
	quota := calculateCheckInQuota()

	// 检查用户现有额度并调整奖励
	userQuota, err := GetUserQuota(userId)
	if err != nil {
		return nil, fmt.Errorf("failed to get user quota: %w", err)
	}

	if userQuota <= 0 {
		quota = quota / 10
	}

	// 更新用户额度
	if err := increaseUserQuota(userId, quota); err != nil {
		return nil, fmt.Errorf("failed to increase user quota: %w", err)
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
		return nil, fmt.Errorf("failed to create operation record: %w", err)
	}

	// 尝试获得优惠券奖励（检查全局开关）
	var coupon *UserCoupon
	if isCouponRewardEnabled() {
		couponReward := calculateCouponReward()
		if couponReward != nil {
			issuedCoupon, err := IssueCouponToUser(userId, couponReward.TemplateId, CouponSourceCheckin)
			if err != nil {
				// 优惠券发放失败，记录日志但不影响签到成功
				logger.SysError(fmt.Sprintf("Failed to issue coupon to user %d: %v", userId, err))
			} else {
				coupon = issuedCoupon
				// 更新签到记录，添加优惠券信息
				remark += fmt.Sprintf(", 获得优惠券: %s", coupon.Name)
				operation.Remark = remark
				DB.Save(operation)
			}
		}
	}

	RecordLogWithRequestIP(userId, LogTypeUserQuoteIncrease, remark, requestIP)

	return &CheckInRewardResult{
		Quota:  quota,
		Coupon: coupon,
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

// 检查优惠券奖励是否启用
func isCouponRewardEnabled() bool {
	return config.CheckinCouponEnabled
}
