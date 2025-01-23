package controller

import (
	"net/http"
	"one-api/common"
	"one-api/model"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetLogsList(c *gin.Context) {
	var params model.LogsListParams
	if err := c.ShouldBindQuery(&params); err != nil {
		common.APIRespondWithError(c, http.StatusOK, err)
		return
	}

	logs, err := model.GetLogsList(&params)

	// 获取统计数据
	// 开始时间 结束时间 只统计最近60秒的rpm和tpm
	quota, stat := model.SumUsedQuota(params.StartTimestamp, params.EndTimestamp, params.ModelName, params.Username, params.TokenName, params.ChannelId, 0)

	if err != nil {
		common.APIRespondWithError(c, http.StatusOK, err)
		return
	}
	// 给 stat 添加 quota
	stat.Quota = quota
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    logs,
		"stat":    stat,
	})
}

func GetUserLogsList(c *gin.Context) {
	userId := c.GetInt("id")

	var params model.LogsListParams
	if err := c.ShouldBindQuery(&params); err != nil {
		common.APIRespondWithError(c, http.StatusOK, err)
		return
	}

	logs, err := model.GetUserLogsList(userId, &params)

	// 获取统计数据
	// 开始时间 结束时间 只统计最近60秒的rpm和tpm
	quota, stat := model.SumUsedQuota(params.StartTimestamp, params.EndTimestamp, params.ModelName, "", params.TokenName, 0, userId)

	if err != nil {
		common.APIRespondWithError(c, http.StatusOK, err)
		return
	}
	// 给 stat 添加 quota
	stat.Quota = quota
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    logs,
		"stat":    stat,
	})
}

func GetLogsStat(c *gin.Context) {
	// logType, _ := strconv.Atoi(c.Query("type"))
	startTimestamp, _ := strconv.ParseInt(c.Query("start_timestamp"), 10, 64)
	endTimestamp, _ := strconv.ParseInt(c.Query("end_timestamp"), 10, 64)
	tokenName := c.Query("token_name")
	username := c.Query("username")
	modelName := c.Query("model_name")
	channel, _ := strconv.Atoi(c.Query("channel"))
	quotaNum, stat := model.SumUsedQuota(startTimestamp, endTimestamp, modelName, username, tokenName, channel, 0)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data": gin.H{
			"quota": quotaNum,
			//"token": tokenNum,
			"rpm": stat.Rpm,
			"tpm": stat.Tpm,
		},
	})
}

func GetLogsSelfStat(c *gin.Context) {
	username := c.GetString("username")
	// logType, _ := strconv.Atoi(c.Query("type"))
	startTimestamp, _ := strconv.ParseInt(c.Query("start_timestamp"), 10, 64)
	endTimestamp, _ := strconv.ParseInt(c.Query("end_timestamp"), 10, 64)
	tokenName := c.Query("token_name")
	modelName := c.Query("model_name")
	channel, _ := strconv.Atoi(c.Query("channel"))
	quotaNum, stat := model.SumUsedQuota(startTimestamp, endTimestamp, modelName, username, tokenName, channel, 0)
	//tokenNum := model.SumUsedToken(logType, startTimestamp, endTimestamp, modelName, username, tokenName)
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data": gin.H{
			"quota": quotaNum,
			//"token": tokenNum,
			"rpm": stat.Rpm,
			"tpm": stat.Tpm,
		},
	})
}

func DeleteHistoryLogs(c *gin.Context) {
	targetTimestamp, _ := strconv.ParseInt(c.Query("target_timestamp"), 10, 64)
	if targetTimestamp == 0 {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "target timestamp is required",
		})
		return
	}
	count, err := model.DeleteOldLog(targetTimestamp)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    count,
	})
}
