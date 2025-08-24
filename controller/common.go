package controller

import (
	"fmt"
	"net/http"
	"one-api/common"
	"one-api/common/config"
	"one-api/common/notify"
	"one-api/model"
	"one-api/types"

	"github.com/gin-gonic/gin"
)

func shouldEnableChannel(err error, openAIErr *types.OpenAIErrorWithStatusCode) bool {
	if !config.AutomaticEnableChannelEnabled {
		return false
	}
	if err != nil {
		return false
	}
	if openAIErr != nil {
		return false
	}
	return true
}

func ShouldDisableChannel(channelId int, channelType int, err *types.OpenAIErrorWithStatusCode) bool {
	if err == nil || err.LocalError {
		return false
	}

	// 获取渠道信息，检查渠道的AutoBan设置
	channel, getChannelErr := model.GetChannelById(channelId)
	if getChannelErr != nil {
		// 如果获取渠道信息失败，降级使用全局设置
		if !config.AutomaticDisableChannelEnabled {
			return false
		}
	} else {
		// 检查渠道的AutoBan设置
		if channel.AutoBan == nil || *channel.AutoBan == 0 {
			// 渠道未启用自动禁用，即使全局启用也不禁用
			return false
		}
		// 如果渠道启用了AutoBan，还需要检查全局设置是否启用
		if !config.AutomaticDisableChannelEnabled {
			return false
		}
	}

	// 状态码检查
	if err.StatusCode == http.StatusUnauthorized {
		return true
	}
	if err.StatusCode == http.StatusForbidden && channelType == config.ChannelTypeGemini {
		return true
	}

	// 错误代码检查
	switch err.OpenAIError.Code {
	case "invalid_api_key", "account_deactivated", "billing_not_active":
		return true
	}

	// 错误类型检查
	switch err.OpenAIError.Type {
	case "insufficient_quota", "authentication_error", "permission_error", "forbidden":
		return true
	}

	switch err.OpenAIError.Param {
	case "PERMISSIONDENIED":
		return true
	}

	return common.DisableChannelKeywordsInstance.IsContains(err.OpenAIError.Message)
}

// disable & notify
func DisableChannel(channelId int, channelName string, reason string, sendNotify bool) {
	model.UpdateChannelStatusById(channelId, config.ChannelStatusAutoDisabled)
	if !sendNotify {
		return
	}

	subject := fmt.Sprintf("通道「%s」（#%d）已被禁用", channelName, channelId)
	content := fmt.Sprintf("通道「%s」（#%d）已被禁用，原因：%s", channelName, channelId, reason)
	notify.Send(subject, content)
}

// enable & notify
func EnableChannel(channelId int, channelName string, sendNotify bool) {
	model.UpdateChannelStatusById(channelId, config.ChannelStatusEnabled)
	if !sendNotify {
		return
	}

	subject := fmt.Sprintf("通道「%s」（#%d）已被启用", channelName, channelId)
	content := fmt.Sprintf("通道「%s」（#%d）已被启用", channelName, channelId)
	notify.Send(subject, content)
}

func RelayNotFound(c *gin.Context) {
	err := types.OpenAIError{
		Message: fmt.Sprintf("Invalid URL (%s %s)", c.Request.Method, c.Request.URL.Path),
		Type:    "invalid_request_error",
		Param:   "",
		Code:    "",
	}
	c.JSON(http.StatusNotFound, gin.H{
		"error": err,
	})
}
