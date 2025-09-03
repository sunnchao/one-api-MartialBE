package model

import (
	"errors"
	"fmt"
	"math/rand"
	"one-api/common"
	"one-api/common/logger"
	"one-api/common/utils"
	"time"

	"gorm.io/gorm"
)

// 优惠券类型常量
const (
	CouponTypePercentage = "percentage" // 百分比折扣
	CouponTypeFixed      = "fixed"      // 固定金额折扣
	CouponTypeRecharge   = "recharge"   // 充值奖励
)

// 优惠券状态常量
const (
	CouponStatusUnused  = 1 // 未使用
	CouponStatusUsed    = 2 // 已使用
	CouponStatusExpired = 3 // 已过期
)

// 优惠券来源类型
const (
	CouponSourceCheckin  = "checkin"  // 签到获得
	CouponSourceActivity = "activity" // 活动获得
	CouponSourceAdmin    = "admin"    // 管理员发放
	CouponSourceInvite   = "invite"   // 邀请获得
	CouponSourceLottery  = "lottery"  // 抽奖获得
)

// 优惠券模板
type CouponTemplate struct {
	Id          int     `json:"id" gorm:"primaryKey"`
	Name        string  `json:"name" gorm:"type:varchar(100);not null"`           // 优惠券名称
	Description string  `json:"description" gorm:"type:varchar(500)"`             // 描述
	Type        string  `json:"type" gorm:"type:varchar(20);not null"`            // 类型：percentage, fixed, recharge
	Value       float64 `json:"value" gorm:"type:decimal(10,2);not null"`         // 折扣值或金额
	MinAmount   float64 `json:"min_amount" gorm:"type:decimal(10,2);default:0"`   // 最低消费要求
	MaxDiscount float64 `json:"max_discount" gorm:"type:decimal(10,2);default:0"` // 最大折扣金额（仅percentage类型）
	ValidDays   int     `json:"valid_days" gorm:"type:int;default:30"`            // 有效天数
	TotalLimit  int     `json:"total_limit" gorm:"type:int;default:0"`            // 总发放限制，0表示不限制
	UserLimit   int     `json:"user_limit" gorm:"type:int;default:1"`             // 每用户限制数量
	IssuedCount int     `json:"issued_count" gorm:"type:int;default:0"`           // 已发放数量
	UsedCount   int     `json:"used_count" gorm:"type:int;default:0"`             // 已使用数量
	IsActive    bool    `json:"is_active" gorm:"default:true"`                    // 是否启用
	Source      string  `json:"source" gorm:"type:varchar(20);default:'admin'"`   // 来源类型
	CreatedTime int64   `json:"created_time" gorm:"type:bigint"`
	UpdatedTime int64   `json:"updated_time" gorm:"type:bigint"`
}

// 用户优惠券
type UserCoupon struct {
	Id          int     `json:"id" gorm:"primaryKey"`
	UserId      int     `json:"user_id" gorm:"type:int;not null;index"`
	TemplateId  int     `json:"template_id" gorm:"type:int;not null;index"`
	Code        string  `json:"code" gorm:"type:varchar(32);uniqueIndex;not null"` // 优惠券码
	Name        string  `json:"name" gorm:"type:varchar(100)"`                     // 优惠券名称（冗余存储）
	Type        string  `json:"type" gorm:"type:varchar(20)"`                      // 类型（冗余存储）
	Value       float64 `json:"value" gorm:"type:decimal(10,2)"`                   // 折扣值（冗余存储）
	MinAmount   float64 `json:"min_amount" gorm:"type:decimal(10,2);default:0"`    // 最低消费要求
	MaxDiscount float64 `json:"max_discount" gorm:"type:decimal(10,2);default:0"`  // 最大折扣金额
	Status      int     `json:"status" gorm:"type:int;default:1"`                  // 状态：1未使用 2已使用 3已过期
	Source      string  `json:"source" gorm:"type:varchar(20);default:'admin'"`    // 来源
	OrderId     string  `json:"order_id" gorm:"type:varchar(50)"`                  // 使用时的订单ID
	UsedAmount  float64 `json:"used_amount" gorm:"type:decimal(10,2);default:0"`   // 使用金额
	SavedAmount float64 `json:"saved_amount" gorm:"type:decimal(10,2);default:0"`  // 节省金额
	ExpireTime  int64   `json:"expire_time" gorm:"type:bigint"`                    // 过期时间
	UsedTime    int64   `json:"used_time" gorm:"type:bigint;default:0"`            // 使用时间
	CreatedTime int64   `json:"created_time" gorm:"type:bigint"`
}

// 签到奖励配置
type CheckinReward struct {
	Id            int     `json:"id" gorm:"primaryKey"`
	Day           int     `json:"day" gorm:"type:int;not null;uniqueIndex"`          // 连续签到天数
	RewardType    string  `json:"reward_type" gorm:"type:varchar(20);not null"`      // 奖励类型：quota, coupon, multiplier
	QuotaAmount   int     `json:"quota_amount" gorm:"type:int;default:0"`            // 额度奖励
	CouponId      int     `json:"coupon_id" gorm:"type:int;default:0"`               // 优惠券模板ID
	MultiplierVal float64 `json:"multiplier_val" gorm:"type:decimal(5,2);default:0"` // 倍率值
	MultiplierDay int     `json:"multiplier_day" gorm:"type:int;default:0"`          // 倍率持续天数
	Probability   float64 `json:"probability" gorm:"type:decimal(5,4);default:1"`    // 获得概率 0-1
	Description   string  `json:"description" gorm:"type:varchar(200)"`              // 奖励描述
	IsEnabled     bool    `json:"is_enabled" gorm:"default:true"`                    // 是否启用
	CreatedTime   int64   `json:"created_time" gorm:"type:bigint"`
	UpdatedTime   int64   `json:"updated_time" gorm:"type:bigint"`
}

// 用户签到记录增强版
type UserCheckinRecord struct {
	Id            int     `json:"id" gorm:"primaryKey"`
	UserId        int     `json:"user_id" gorm:"type:int;not null;index"`
	Day           int     `json:"day" gorm:"type:int;not null"`                      // 连续签到天数
	RewardType    string  `json:"reward_type" gorm:"type:varchar(20)"`               // 获得的奖励类型
	QuotaReward   int     `json:"quota_reward" gorm:"type:int;default:0"`            // 获得的额度
	CouponCode    string  `json:"coupon_code" gorm:"type:varchar(32)"`               // 获得的优惠券码
	MultiplierVal float64 `json:"multiplier_val" gorm:"type:decimal(5,2);default:0"` // 获得的倍率
	MultiplierDay int     `json:"multiplier_day" gorm:"type:int;default:0"`          // 倍率持续天数
	Description   string  `json:"description" gorm:"type:varchar(200)"`              // 奖励描述
	IP            string  `json:"ip" gorm:"type:varchar(45)"`
	CreatedTime   int64   `json:"created_time" gorm:"type:bigint"`
}

// 创建优惠券模板
func (ct *CouponTemplate) Create() error {
	now := utils.GetTimestamp()
	ct.CreatedTime = now
	ct.UpdatedTime = now
	return DB.Create(ct).Error
}

// 更新优惠券模板
func (ct *CouponTemplate) Update() error {
	ct.UpdatedTime = utils.GetTimestamp()
	return DB.Model(ct).Updates(ct).Error
}

// 删除优惠券模板
func (ct *CouponTemplate) Delete() error {
	return DB.Delete(ct).Error
}

// 获取所有优惠券模板
func GetCouponTemplates() ([]*CouponTemplate, error) {
	var templates []*CouponTemplate
	err := DB.Where("is_active = ?", true).Order("id DESC").Find(&templates).Error
	return templates, err
}

// 根据ID获取优惠券模板
func GetCouponTemplateById(id int) (*CouponTemplate, error) {
	var template CouponTemplate
	err := DB.Where("id = ?", id).First(&template).Error
	return &template, err
}

// 生成优惠券码
func generateCouponCode() string {
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	rand.Seed(time.Now().UnixNano())

	code := make([]byte, 12)
	for i := range code {
		code[i] = charset[rand.Intn(len(charset))]
	}

	// 格式化为 XXXX-XXXX-XXXX
	return fmt.Sprintf("%s-%s-%s", string(code[0:4]), string(code[4:8]), string(code[8:12]))
}

// 为用户发放优惠券
func IssueCouponToUser(userId, templateId int, source string) (*UserCoupon, error) {
	template, err := GetCouponTemplateById(templateId)
	if err != nil {
		return nil, err
	}

	if !template.IsActive {
		return nil, errors.New("优惠券模板未启用")
	}

	// 检查总发放限制
	if template.TotalLimit > 0 && template.IssuedCount >= template.TotalLimit {
		return nil, errors.New("优惠券已发完")
	}

	// 检查用户限制
	var userCouponCount int64
	DB.Model(&UserCoupon{}).Where("user_id = ? AND template_id = ?", userId, templateId).Count(&userCouponCount)
	if template.UserLimit > 0 && int(userCouponCount) >= template.UserLimit {
		return nil, errors.New("已达到个人领取限制")
	}

	var userCoupon *UserCoupon
	err = DB.Transaction(func(tx *gorm.DB) error {
		// 生成唯一优惠券码
		var code string
		for {
			code = generateCouponCode()
			var count int64
			tx.Model(&UserCoupon{}).Where("code = ?", code).Count(&count)
			if count == 0 {
				break
			}
		}

		// 创建用户优惠券
		userCoupon = &UserCoupon{
			UserId:      userId,
			TemplateId:  templateId,
			Code:        code,
			Name:        template.Name,
			Type:        template.Type,
			Value:       template.Value,
			MinAmount:   template.MinAmount,
			MaxDiscount: template.MaxDiscount,
			Status:      CouponStatusUnused,
			Source:      source,
			ExpireTime:  utils.GetTimestamp() + int64(template.ValidDays*24*3600),
			CreatedTime: utils.GetTimestamp(),
		}

		if err := tx.Create(userCoupon).Error; err != nil {
			return err
		}

		// 更新模板发放计数
		return tx.Model(template).Update("issued_count", gorm.Expr("issued_count + 1")).Error
	})

	return userCoupon, err
}

// 获取用户优惠券列表
func GetUserCoupons(userId int, status int) ([]*UserCoupon, error) {
	var coupons []*UserCoupon
	query := DB.Where("user_id = ?", userId)

	if status > 0 {
		query = query.Where("status = ?", status)
	}

	err := query.Order("created_time DESC").Find(&coupons).Error
	return coupons, err
}

// 根据代码获取用户优惠券
func GetUserCouponByCode(code string) (*UserCoupon, error) {
	var coupon UserCoupon
	err := DB.Where("code = ?", code).First(&coupon).Error
	return &coupon, err
}

// 使用优惠券
func UseCoupon(code string, userId int, orderAmount float64, orderId string) (*UserCoupon, float64, error) {
	coupon, err := GetUserCouponByCode(code)
	if err != nil {
		return nil, 0, errors.New("优惠券不存在")
	}

	if coupon.UserId != userId {
		return nil, 0, errors.New("这不是你的优惠券")
	}

	if coupon.Status != CouponStatusUnused {
		return nil, 0, errors.New("优惠券已使用或已过期")
	}

	now := utils.GetTimestamp()
	if now > coupon.ExpireTime {
		// 标记为过期
		DB.Model(coupon).Updates(map[string]interface{}{
			"status": CouponStatusExpired,
		})
		return nil, 0, errors.New("优惠券已过期")
	}

	if orderAmount < coupon.MinAmount {
		return nil, 0, fmt.Errorf("订单金额不足，最低需要%.2f", coupon.MinAmount)
	}

	// 计算折扣金额
	var discountAmount float64
	switch coupon.Type {
	case CouponTypePercentage:
		discountAmount = orderAmount * (coupon.Value / 100)
		if coupon.MaxDiscount > 0 && discountAmount > coupon.MaxDiscount {
			discountAmount = coupon.MaxDiscount
		}
	case CouponTypeFixed:
		discountAmount = coupon.Value
		if discountAmount > orderAmount {
			discountAmount = orderAmount
		}
	case CouponTypeRecharge:
		// 充值优惠券，返回奖励金额（不是折扣）
		discountAmount = coupon.Value
	default:
		return nil, 0, errors.New("不支持的优惠券类型")
	}

	// 更新优惠券状态
	err = DB.Transaction(func(tx *gorm.DB) error {
		// 标记优惠券为已使用
		if err := tx.Model(coupon).Updates(map[string]interface{}{
			"status":       CouponStatusUsed,
			"order_id":     orderId,
			"used_amount":  orderAmount,
			"saved_amount": discountAmount,
			"used_time":    now,
		}).Error; err != nil {
			return err
		}

		// 更新模板使用计数
		return tx.Model(&CouponTemplate{}).Where("id = ?", coupon.TemplateId).
			Update("used_count", gorm.Expr("used_count + 1")).Error
	})

	if err != nil {
		return nil, 0, err
	}

	coupon.Status = CouponStatusUsed
	coupon.OrderId = orderId
	coupon.UsedAmount = orderAmount
	coupon.SavedAmount = discountAmount
	coupon.UsedTime = now

	return coupon, discountAmount, nil
}

// 获取可用于特定金额的优惠券
func GetAvailableCouponsForAmount(userId int, amount float64) ([]*UserCoupon, error) {
	var coupons []*UserCoupon
	now := utils.GetTimestamp()

	err := DB.Where("user_id = ? AND status = ? AND expire_time > ? AND min_amount <= ?",
		userId, CouponStatusUnused, now, amount).
		Order("value DESC").Find(&coupons).Error

	return coupons, err
}

// 创建签到奖励配置
func (cr *CheckinReward) Create() error {
	now := utils.GetTimestamp()
	cr.CreatedTime = now
	cr.UpdatedTime = now
	return DB.Create(cr).Error
}

// 更新签到奖励配置
func (cr *CheckinReward) Update() error {
	cr.UpdatedTime = utils.GetTimestamp()
	return DB.Model(cr).Updates(cr).Error
}

// 获取所有签到奖励配置
func GetCheckinRewards() ([]*CheckinReward, error) {
	var rewards []*CheckinReward
	err := DB.Where("is_enabled = ?", true).Order("day ASC").Find(&rewards).Error
	return rewards, err
}

// 根据天数获取签到奖励配置
func GetCheckinRewardByDay(day int) (*CheckinReward, error) {
	var reward CheckinReward
	err := DB.Where("day = ? AND is_enabled = ?", day, true).First(&reward).Error
	return &reward, err
}

// 执行签到并获得奖励
func ExecuteCheckin(userId int, consecutiveDays int, ip string) (*UserCheckinRecord, error) {
	// 获取奖励配置
	reward, err := GetCheckinRewardByDay(consecutiveDays)
	if err != nil {
		// 如果没有特定天数配置，使用默认奖励
		reward = &CheckinReward{
			Day:         consecutiveDays,
			RewardType:  "quota",
			QuotaAmount: 5000, // 默认5000额度
			Probability: 1.0,
			Description: "每日签到奖励",
		}
	}

	// 根据概率决定是否获得奖励
	rand.Seed(time.Now().UnixNano())
	if rand.Float64() > reward.Probability {
		// 未命中概率，给予最基础奖励
		reward = &CheckinReward{
			RewardType:  "quota",
			QuotaAmount: 1000,
			Description: "基础签到奖励",
		}
	}

	var record *UserCheckinRecord
	err = DB.Transaction(func(tx *gorm.DB) error {
		record = &UserCheckinRecord{
			UserId:      userId,
			Day:         consecutiveDays,
			RewardType:  reward.RewardType,
			IP:          ip,
			CreatedTime: utils.GetTimestamp(),
		}

		switch reward.RewardType {
		case "quota":
			// 发放额度奖励
			record.QuotaReward = reward.QuotaAmount
			record.Description = fmt.Sprintf("获得%s额度", common.LogQuota(reward.QuotaAmount))

			if err := tx.Model(&User{}).Where("id = ?", userId).
				Update("quota", gorm.Expr("quota + ?", reward.QuotaAmount)).Error; err != nil {
				return err
			}

			// 记录额度日志
			RecordLogWithRequestIP(userId, LogTypeUserQuoteIncrease, record.Description, ip)

		case "coupon":
			// 发放优惠券奖励
			if reward.CouponId > 0 {
				coupon, err := IssueCouponToUser(userId, reward.CouponId, CouponSourceCheckin)
				if err != nil {
					logger.SysError("签到发放优惠券失败: " + err.Error())
					// 失败时给予额度奖励
					record.RewardType = "quota"
					record.QuotaReward = 3000
					record.Description = "获得备用签到奖励：3000额度"
					if err := tx.Model(&User{}).Where("id = ?", userId).
						Update("quota", gorm.Expr("quota + ?", 3000)).Error; err != nil {
						return err
					}
				} else {
					record.CouponCode = coupon.Code
					record.Description = fmt.Sprintf("获得优惠券：%s", coupon.Name)
				}
			}

		case "multiplier":
			// 发放倍率奖励（这里需要实现倍率系统）
			record.MultiplierVal = reward.MultiplierVal
			record.MultiplierDay = reward.MultiplierDay
			record.Description = fmt.Sprintf("获得%.1f倍倍率，持续%d天", reward.MultiplierVal, reward.MultiplierDay)

			// TODO: 实现用户倍率系统
			logger.SysLog(fmt.Sprintf("用户%d获得倍率奖励: %.1fx, %d天", userId, reward.MultiplierVal, reward.MultiplierDay))
		}

		return tx.Create(record).Error
	})

	return record, err
}

// 获取用户签到记录
func GetUserCheckinRecords(userId int, limit int) ([]*UserCheckinRecord, error) {
	var records []*UserCheckinRecord
	err := DB.Where("user_id = ?", userId).
		Order("created_time DESC").
		Limit(limit).
		Find(&records).Error
	return records, err
}

// GetUserConsecutiveCheckinDays 获取用户连续签到天数
func GetUserConsecutiveCheckinDays(userId int) (int, error) {
	now := time.Now()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())

	consecutiveDays := 0
	currentDay := today

	for i := 0; i < 365; i++ { // 最多查365天
		dayStart := currentDay.UnixMilli()
		dayEnd := currentDay.Add(24 * time.Hour).UnixMilli()

		var count int64
		DB.Model(&UserOperation{}).Where("user_id = ? AND type = ? AND created_time >= ? AND created_time < ?",
			userId, 1, dayStart, dayEnd).Count(&count)

		if count > 0 {
			consecutiveDays++
			currentDay = currentDay.AddDate(0, 0, -1)
		} else {
			break
		}
	}

	return consecutiveDays, nil
}

// HasUserCheckedInToday 检查用户今日是否已签到
func HasUserCheckedInToday(userId int) (bool, error) {
	now := time.Now()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	todayStart := today.UnixMilli()
	todayEnd := today.Add(24 * time.Hour).UnixMilli()

	var count int64
	err := DB.Model(&UserOperation{}).Where("user_id = ? AND type = ? AND created_time >= ? AND created_time < ?",
		userId, 1, todayStart, todayEnd).Count(&count).Error

	return count > 0, err
}

// 清理过期优惠券
func CleanExpiredCoupons() error {
	now := utils.GetTimestamp()
	return DB.Model(&UserCoupon{}).
		Where("status = ? AND expire_time < ?", CouponStatusUnused, now).
		Update("status", CouponStatusExpired).Error
}
