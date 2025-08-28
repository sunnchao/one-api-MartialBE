package model

import (
	"one-api/common/logger"
	"one-api/common/utils"
)

// 初始化签到奖励配置
func InitCheckinRewards() error {
	// 检查是否已经初始化过
	var count int64
	DB.Model(&CheckinReward{}).Count(&count)
	if count > 0 {
		logger.SysLog("签到奖励配置已存在，跳过初始化")
		return nil
	}

	rewards := []CheckinReward{
		// 第1天：基础额度
		{
			Day:         1,
			RewardType:  "quota",
			QuotaAmount: 5000,
			Probability: 1.0,
			Description: "新手签到奖励",
			IsEnabled:   true,
		},
		// 第2天：额度奖励
		{
			Day:         2,
			RewardType:  "quota",
			QuotaAmount: 7000,
			Probability: 1.0,
			Description: "连续签到第2天",
			IsEnabled:   true,
		},
		// 第3天：优惠券奖励
		{
			Day:         3,
			RewardType:  "coupon",
			CouponId:    1, // 需要先创建优惠券模板
			Probability: 1.0,
			Description: "连续签到第3天奖励",
			IsEnabled:   true,
		},
		// 第7天：高额度奖励
		{
			Day:         7,
			RewardType:  "quota",
			QuotaAmount: 20000,
			Probability: 1.0,
			Description: "连续签到1周奖励",
			IsEnabled:   true,
		},
		// 第14天：特殊优惠券
		{
			Day:         14,
			RewardType:  "coupon",
			CouponId:    2,
			Probability: 1.0,
			Description: "连续签到2周大奖",
			IsEnabled:   true,
		},
		// 第30天：超级奖励
		{
			Day:         30,
			RewardType:  "quota",
			QuotaAmount: 100000,
			Probability: 1.0,
			Description: "连续签到1月超级奖励",
			IsEnabled:   true,
		},
	}

	for _, reward := range rewards {
		reward.CreatedTime = utils.GetTimestamp()
		reward.UpdatedTime = utils.GetTimestamp()
		if err := reward.Create(); err != nil {
			logger.SysError("创建签到奖励配置失败: " + err.Error())
			return err
		}
	}

	logger.SysLog("成功初始化签到奖励配置")
	return nil
}

// 初始化优惠券模板
func InitCouponTemplates() error {
	// 检查是否已经初始化过
	var count int64
	DB.Model(&CouponTemplate{}).Count(&count)
	if count > 0 {
		logger.SysLog("优惠券模板已存在，跳过初始化")
		return nil
	}

	templates := []CouponTemplate{
		// 1. 充值9折券
		{
			Name:        "充值9折券",
			Description: "充值享受9折优惠",
			Type:        CouponTypePercentage,
			Value:       10.0, // 10%折扣
			MinAmount:   10.0, // 最低充值$10
			MaxDiscount: 5.0,  // 最多优惠$5
			ValidDays:   30,
			TotalLimit:  1000,
			UserLimit:   3,
			Source:      CouponSourceCheckin,
			IsActive:    true,
		},
		// 2. 充值$2减免券
		{
			Name:        "充值$2减免券",
			Description: "充值满$20减$2",
			Type:        CouponTypeFixed,
			Value:       2.0,   // 减免$2
			MinAmount:   20.0,  // 最低充值$20
			MaxDiscount: 0,     // 固定减免不需要最大限制
			ValidDays:   15,
			TotalLimit:  500,
			UserLimit:   2,
			Source:      CouponSourceCheckin,
			IsActive:    true,
		},
		// 3. 充值奖励券
		{
			Name:        "充值奖励券",
			Description: "充值额外获得$3额度",
			Type:        CouponTypeRecharge,
			Value:       3.0,   // 额外获得$3额度
			MinAmount:   15.0,  // 最低充值$15
			MaxDiscount: 0,
			ValidDays:   7,
			TotalLimit:  200,
			UserLimit:   1,
			Source:      CouponSourceCheckin,
			IsActive:    true,
		},
		// 4. VIP用户专享大额优惠券
		{
			Name:        "VIP专享8折券",
			Description: "VIP用户充值享受8折优惠",
			Type:        CouponTypePercentage,
			Value:       20.0,  // 20%折扣
			MinAmount:   50.0,  // 最低充值$50
			MaxDiscount: 20.0,  // 最多优惠$20
			ValidDays:   30,
			TotalLimit:  100,
			UserLimit:   1,
			Source:      CouponSourceActivity,
			IsActive:    true,
		},
		// 5. 新用户注册奖励券
		{
			Name:        "新用户专享券",
			Description: "新用户首次充值享受85折",
			Type:        CouponTypePercentage,
			Value:       15.0,  // 15%折扣
			MinAmount:   5.0,   // 最低充值$5
			MaxDiscount: 10.0,  // 最多优惠$10
			ValidDays:   7,
			TotalLimit:  0, // 不限制
			UserLimit:   1,
			Source:      CouponSourceAdmin,
			IsActive:    true,
		},
	}

	for _, template := range templates {
		template.CreatedTime = utils.GetTimestamp()
		template.UpdatedTime = utils.GetTimestamp()
		if err := template.Create(); err != nil {
			logger.SysError("创建优惠券模板失败: " + err.Error())
			return err
		}
	}

	logger.SysLog("成功初始化优惠券模板")
	return nil
}

// 初始化所有优惠券相关数据
func InitCouponSystem() error {
	logger.SysLog("开始初始化优惠券系统...")
	
	// 先初始化优惠券模板
	if err := InitCouponTemplates(); err != nil {
		return err
	}
	
	// 再初始化签到奖励配置
	if err := InitCheckinRewards(); err != nil {
		return err
	}
	
	logger.SysLog("优惠券系统初始化完成")
	return nil
}

// 清理过期优惠券的定时任务
func CleanupExpiredCouponsTask() {
	err := CleanExpiredCoupons()
	if err != nil {
		logger.SysError("清理过期优惠券失败: " + err.Error())
	} else {
		logger.SysLog("清理过期优惠券完成")
	}
}
