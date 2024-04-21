package model

import (
	"fmt"
	"math/rand"
	"one-api/common"
	"strings"
	"time"
)

type UserOperation struct {
	Id          int       `json:"id"`
	UserId      int       `json:"user_id"`
	CreatedTime time.Time `json:"created_time"`
	Type        int       `json:"type"`
	Remark      string    `json:"remark"`
}

// 获取用户今日的UserOperation
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

// 插入一条 InsertOperationCheckIn
func InsertOperationCheckIn(userId int) (quota int, err error) {
	// 获得随机额度
	rand.Seed(time.Now().UnixNano())

	quota = int(rand.Float64() * rand.Float64() * rand.Float64() * rand.Float64() * common.QuotaPerUnit)

	operationRemark := []string{"签到", ", ", fmt.Sprintf("获得额度 %v", quota)}

	// 更新用户额度
	err = increaseUserQuota(userId, quota)
	if err != nil {
		return 0, err
	}

	RecordLog(userId, LogTypeUserQuotoIncrease, strings.Join(operationRemark, ""))
	err = insertOperation(UserOperation{
		UserId:      userId,
		Type:        1,
		Remark:      strings.Join(operationRemark, ""),
		CreatedTime: time.Now(),
	})
	return
}

// 判断是否已经签到
func IsCheckInToday(userId int) (checkInTime string, err error) {
	var userOperation UserOperation
	userOperation, err = GetOperationCheckInByUserId(userId)
	if err != nil {
		return "", err
	}
	// 获取当前的UTC时间
	nowUTC := time.Now().UTC()

	// 将UTC时间转换为北京时间（UTC+8）
	beijingLocation, err := time.LoadLocation("Asia/Shanghai")

	nowBeijing := nowUTC.In(beijingLocation)

	// 将北京时间截断至当天的开始（即零点）
	beijingMidnight := nowBeijing.Truncate(24 * time.Hour)
	fmt.Printf("beijingMidnight: %v, userOperation.CreateAt: %v\n", beijingMidnight, userOperation.CreatedTime)

	// 比较签到时间是否晚于北京时间的今日零点
	if userOperation.CreatedTime.After(beijingMidnight) {
		// 已签到
		return userOperation.CreatedTime.GoString(), err
	}
	return "", err
}
