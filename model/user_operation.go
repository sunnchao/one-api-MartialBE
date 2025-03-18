package model

import (
	"fmt"
	"math/rand"
	"one-api/common"
	"one-api/common/config"
	"one-api/common/utils"
	"strings"
	"time"
)

type UserOperation struct {
	Id          int    `json:"id"`
	UserId      int    `json:"user_id"`
	CreatedTime int64  `json:"created_time" gorm:"type:bigint"`
	Type        int    `json:"type"`
	Remark      string `json:"remark"`
}

// GetOperationCheckInByUserId 获取用户今日的UserOperation
func GetOperationCheckInByUserId(userId int) (userOperation UserOperation, err error) {
	//  使用Find()获取最近一条记录
	err = DB.Model(&UserOperation{}).
		Where("user_id = ? AND type = ?", userId, 1).Order("id desc").First(&userOperation).Error

	return userOperation, err
}

// 插入一条 UserOperation
func insertOperation(user_operation UserOperation) (err error) {
	err = DB.Model(&UserOperation{}).Create(&user_operation).Error
	return err
}

// InsertOperationCheckIn 插入一条
func InsertOperationCheckIn(userId int, lastDayUsed int64, requestIP string) (quota int, err error) {
	rand.Seed(time.Now().UnixNano())

	// 生成一个 0-100 的随机数来决定概率区间
	probability := rand.Float64()        // Generate a random number between 0 and 1
	coefficient := rand.Float64() * 0.18 // Base random value (0 to 0.18)

	switch {
	case probability >= 0.75 && probability < 0.95: // 20% chance
		coefficient += 0.08 // Shift to 0.18 - 0.26
	case probability >= 0.95: // 5% chance
		coefficient += 0.18 // Shift to 0.18 - 0.36
	}

	// 计算最终额度
	quota = int(coefficient * float64(lastDayUsed))

	// 查询用户现有额度
	userQuota, err := GetUserQuota(userId)

	// 如果现有额度小于等于0, 减少签到奖励
	if userQuota <= 0 {
		quota = quota / 10
	}

	operationRemark := []string{"签到", ", ", fmt.Sprintf("获得额度 %v", common.LogQuota(quota))}

	// 更新用户额度
	err = increaseUserQuota(userId, quota)
	if err != nil {
		return 0, err
	}

	RecordLogWithRequestIP(userId, LogTypeUserQuoteIncrease, strings.Join(operationRemark, ""), requestIP)
	err = insertOperation(UserOperation{
		UserId:      userId,
		Type:        1,
		Remark:      strings.Join(operationRemark, ""),
		CreatedTime: time.Now().UnixMilli(),
	})
	return
}

// 判断是否已经签到
func IsCheckInToday(userId int) (checkInTime int64, lastDayUsed int64, err error) {
	var userOperation UserOperation
	userOperation, err = GetOperationCheckInByUserId(userId)

	// 获取当前地区的当天零点时间
	localZeroTime := utils.GetLocalZeroTime()

	if err != nil {
		// 获取昨日的累计使用额度
		// lastDayUsed, err := GetUserQuotaUsedByPeriod(userId, localZeroTime)
		// return -1, lastDayUsed, err
	}
	fmt.Printf("localZeroTime %v", localZeroTime.UnixMilli())

	// 比较签到时间是否晚于北京时间的今日零点
	if userOperation.CreatedTime >= localZeroTime.UnixMilli() {
		// 已签到
		return userOperation.CreatedTime, -1, err
	} else {
		// 获取昨日的累计使用额度
		lastDayUsed, err := GetUserQuotaUsedByPeriod(userId, localZeroTime)
		return 1, lastDayUsed, err
	}
}

// 获取昨日的累计使用额度
func GetUserQuotaUsedByPeriod(userId int, zeroTime time.Time) (used int64, err error) {
	now := time.Now()
	toDay := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	endOfDay := toDay.Add(-time.Second).Add(time.Hour * 24).Format("2006-01-02")
	startOfDay := toDay.AddDate(0, 0, -1).Format("2006-01-02")

	dashboards, err := GetUserModelStatisticsByPeriod(userId, startOfDay, endOfDay)
	if err != nil {
		return -1, err
	}
	// dashboards 是个数组, 循环获取每个Quota, 接下来获取昨日的累计使用额度
	if len(dashboards) > 0 {
		for _, v := range dashboards {
			used += v.Quota
		}
	} else {
		used = 0
	}

	// 保底值
	if float64(used) < (config.QuotaPerUnit * 0.25) {
		used = int64(config.QuotaPerUnit * 0.25)
	}
	return used, err
}

// GetOperationCheckInList 获取签到列表（仅返回本月和上个月的记录）
func GetOperationCheckInList(userId int) (checkInList []UserOperation, err error) {
	now := time.Now()
	// 获取上个月第一天
	firstDayOfLastMonth := time.Date(now.Year(), now.Month()-1, 1, 0, 0, 0, 0, now.Location())

	err = DB.Model(&UserOperation{}).
		Where("user_id = ? AND created_time >= ?", userId, firstDayOfLastMonth.Unix()).
		Order("id desc").
		Find(&checkInList).Error

	return checkInList, err
}
