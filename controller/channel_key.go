package controller

import (
	"net/http"
	"one-api/common"
	"one-api/model"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetChannelKeys retrieves all keys for a channel
func GetChannelKeys(c *gin.Context) {
	channelId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		common.APIRespondWithError(c, http.StatusOK, err)
		return
	}
	
	keys, err := model.GetChannelKeysByChannelId(channelId)
	if err != nil {
		common.APIRespondWithError(c, http.StatusOK, err)
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    keys,
	})
}

// EnableChannelKey enables a disabled key
func EnableChannelKey(c *gin.Context) {
	keyId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		common.APIRespondWithError(c, http.StatusOK, err)
		return
	}
	
	err = model.EnableChannelKey(keyId)
	if err != nil {
		common.APIRespondWithError(c, http.StatusOK, err)
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
	})
}

// DisableChannelKey disables a key
func DisableChannelKey(c *gin.Context) {
	keyId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		common.APIRespondWithError(c, http.StatusOK, err)
		return
	}
	
	err = model.DisableChannelKey(keyId)
	if err != nil {
		common.APIRespondWithError(c, http.StatusOK, err)
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
	})
}

// ResetChannelKeyErrors resets error count for a key
func ResetChannelKeyErrors(c *gin.Context) {
	keyId, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		common.APIRespondWithError(c, http.StatusOK, err)
		return
	}
	
	err = model.ResetKeyErrors(keyId)
	if err != nil {
		common.APIRespondWithError(c, http.StatusOK, err)
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
	})
} 