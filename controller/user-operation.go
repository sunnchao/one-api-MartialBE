package controller

import (
	"fmt"
	"net/http"
	"one-api/common/logger"
	"one-api/common/utils"
	"one-api/model"

	"github.com/gin-gonic/gin"
)

// UserCheckIn - 升级版签到，支持多种奖励类型
func UserOperationCheckIn(c *gin.Context) {
	id := c.GetInt("id")
	user, err := model.GetUserById(id, true)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	// 检查今日是否已签到
	hasCheckedIn, err := model.HasUserCheckedInToday(user.Id)
	if err != nil {
		logger.SysError(fmt.Sprintf("检查签到状态失败: %s", err.Error()))
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "系统错误，请稍后重试",
		})
		return
	}

	if hasCheckedIn {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "今日已签到",
		})
		return
	}

	// 获取连续签到天数
	consecutiveDays, err := model.GetUserConsecutiveCheckinDays(user.Id)
	if err != nil {
		logger.SysError(fmt.Sprintf("获取连续签到天数失败: %s", err.Error()))
		consecutiveDays = 0
	}
	
	// 明天的连续签到天数
	nextDay := consecutiveDays + 1

	// 执行签到并获得奖励
	record, err := model.ExecuteCheckin(user.Id, nextDay, utils.GetRequestIP(c))
	if err != nil {
		logger.SysError(fmt.Sprintf("执行签到失败: %s", err.Error()))
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "签到失败，请稍后重试",
		})
		return
	}

	// 构建返回消息
	responseData := gin.H{
		"consecutive_days": nextDay,
		"reward_type":      record.RewardType,
		"description":      record.Description,
	}

	switch record.RewardType {
	case "quota":
		responseData["quota_reward"] = record.QuotaReward
	case "coupon":
		responseData["coupon_code"] = record.CouponCode
	case "multiplier":
		responseData["multiplier_val"] = record.MultiplierVal
		responseData["multiplier_day"] = record.MultiplierDay
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "签到成功！" + record.Description,
		"data":    responseData,
	})
}

// 获取签到列表
func UserOperationCheckInList(c *gin.Context) {
	id := c.GetInt("id")
	user, err := model.GetUserById(id, true)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	// 获取新的签到记录列表
	checkInList, err := model.GetUserCheckinRecords(user.Id, 30) // 获取最近30条记录
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	// 获取连续签到天数
	consecutiveDays, _ := model.GetUserConsecutiveCheckinDays(user.Id)
	
	// 检查今日是否已签到
	hasCheckedInToday, _ := model.HasUserCheckedInToday(user.Id)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"records":             checkInList,
			"consecutive_days":    consecutiveDays,
			"has_checked_today":   hasCheckedInToday,
		},
	})
}
