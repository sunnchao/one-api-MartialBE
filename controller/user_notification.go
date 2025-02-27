package controller

import (
	"net/http"
	"one-api/model"

	"github.com/gin-gonic/gin"
)

func GetUserNotifications(c *gin.Context) {
	id := c.GetInt("id")
	userNotification, err := model.GetUserNotifications(id)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    userNotification,
	})
}

func UpdateUserNotifications(c *gin.Context) {
	id := c.GetInt("id")
	var userNotifications []model.UserNotification
	if err := c.ShouldBindJSON(&userNotifications); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	err := model.UpdateUserNotifications(id, userNotifications)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "更新成功",
	})
}
