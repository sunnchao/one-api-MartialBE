package controller

import (
	"fmt"
	"net/http"
	"one-api/common"
	"one-api/common/logger"
	"one-api/common/utils"
	"one-api/model"

	"github.com/gin-gonic/gin"
)

// UserCheckIn
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
	checkInTime, lastDayUsed, err := model.IsCheckInToday(user.Id)
	if err != nil {
		logger.SysLog(fmt.Sprintf("IsCheckInToday: %s", err.Error()))
	}
	if len(checkInTime) > 0 {
		// 已签到
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "今日已签到",
		})
		return
	}
	if lastDayUsed == -1 {
		// 无法获取统计信息
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "无法获取统计信息.",
		})
		return
	}

	// 插入一条数据
	quota, err := model.InsertOperationCheckIn(user.Id, lastDayUsed, utils.GetRequestIP(c))
	if err != nil {
		// 签到失败
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "签到失败",
		})
		return
	}
	// 签到成功
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": fmt.Sprintf("签到成功, 获得额度 %v", common.LogQuota(quota)),
	})

}
