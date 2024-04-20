package controller

import (
	"fmt"
	"net/http"
	"one-api/common"
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
	checkInTime, err := model.IsCheckInToday(user.Id)
	if err != nil {
		common.SysLog(fmt.Sprintf("IsCheckInToday: %s", err.Error()))
	}
	if checkInTime > 0 {
		// 已签到
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "今日已签到",
		})
		return
	}

	// 插入一条数据
	quota, err := model.InsertOperationCheckIn(user.Id)
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
		"message": fmt.Sprintf("签到成功, 获得额度 %v", quota),
	})

}
