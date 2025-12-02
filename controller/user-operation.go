package controller

import (
	"fmt"
	"net/http"
	"one-api/common"
	"one-api/common/logger"
	"one-api/common/utils"
	"one-api/model"
	"time"

	"github.com/gin-gonic/gin"
)

// UserCheckIn - 升级版签到，支持多种奖励类型
func UserOperationCheckIn(c *gin.Context) {
	// 是否已经签到
	id := c.GetInt("id")
	user, err := model.GetUserById(id, true)

	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	// 打印用户信息
	fmt.Println(user, "user")

	// 检查是否已经签到
	checkInTime, err := model.IsCheckInToday(user.Id)
	if err != nil {
		logger.SysLog(fmt.Sprintf("IsCheckInToday: %s", err.Error()))
	}
	if checkInTime == -1 {
		// 无法获取统计信息
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "无法获取统计信息.",
		})
		return
	}
	if checkInTime > 1 {
		// 已签到
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "今日已签到",
		})
		return
	}

	// 插入一条数据
	result, err := model.ProcessCheckIn(user.Id, utils.GetRequestIP(c))
	if err != nil {
		// 签到失败
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "签到失败",
		})
		return
	}

	// 构建返回消息
	message := "签到成功"
	if result.Subscription != nil {
		expireAt := time.Unix(result.Subscription.EndTime, 0).Format("2006-01-02 15:04")
		if result.SubscriptionExtended {
			message += fmt.Sprintf(", Claude Code订阅延长至 %s", expireAt)
		} else {
			message += fmt.Sprintf(", 获得Claude Code体验订阅(有效至 %s)", expireAt)
		}
	} else if result.Quota > 0 {
		message += fmt.Sprintf(", 获得额度 %v", common.LogQuota(result.Quota))
	}
	if result.Coupon != nil {
		message += fmt.Sprintf(", 额外获得优惠券: %s", result.Coupon.Name)
	}

	// 签到成功
	responseData := gin.H{
		"quota":  result.Quota,
		"coupon": result.Coupon,
	}
	if result.Subscription != nil {
		responseData["subscription"] = gin.H{
			"plan_type":    result.Subscription.PlanType,
			"end_time":     result.Subscription.EndTime,
			"total_quota":  result.Subscription.TotalQuota,
			"remain_quota": result.Subscription.RemainQuota,
			"extended":     result.SubscriptionExtended,
		}
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": message,
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
	checkInList, err := model.GetCheckInList(user.Id) // 获取最近30条记录
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
			"records":           checkInList,
			"consecutive_days":  consecutiveDays,
			"has_checked_today": hasCheckedInToday,
		},
	})
}
