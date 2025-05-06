package controller

import (
	"errors"
	"net/http"
	"one-api/common"
	"one-api/common/utils"
	"one-api/model"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetChannelsList(c *gin.Context) {
	var params model.SearchChannelsParams
	if err := c.ShouldBindQuery(&params); err != nil {
		common.APIRespondWithError(c, http.StatusOK, err)
		return
	}

	channels, err := model.GetChannelsList(&params)
	if err != nil {
		common.APIRespondWithError(c, http.StatusOK, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    channels,
	})
}

func GetChannel(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	channel, err := model.GetChannelById(id)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	err = channel.LoadKeys()
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
		"data":    channel,
	})
}

func AddChannel(c *gin.Context) {
	channel := model.Channel{}
	err := c.ShouldBindJSON(&channel)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}
	channel.CreatedTime = utils.GetTimestamp()

	// Check if the key field contains multiple keys (might be in Key or Keys)
	if channel.Keys == "" && channel.Key != "" {
		channel.Keys = channel.Key
	}

	// Insert channel and keys
	err = channel.Insert()
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
	})
}

func DeleteChannel(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	channel := model.Channel{Id: id}
	err := channel.Delete()
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
	})
}

func DeleteChannelTag(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	err := model.DeleteChannelTag(id)
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
	})
}

func DeleteDisabledChannel(c *gin.Context) {
	rows, err := model.DeleteDisabledChannel()
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
		"data":    rows,
	})
}

func UpdateChannel(c *gin.Context) {
	channel := model.Channel{}
	err := c.ShouldBindJSON(&channel)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
		})
		return
	}

	if channel.Models == "" {
		err = channel.Update(false)
	} else {
		// Check if the key field contains multiple keys (might be in Key or Keys)
		if channel.Keys == "" && channel.Key != "" {
			channel.Keys = channel.Key
		}
		err = channel.Update(true)
	}

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
		"data":    channel,
	})
}

func BatchUpdateChannelsAzureApi(c *gin.Context) {
	var params model.BatchChannelsParams
	err := c.ShouldBindJSON(&params)
	if err != nil {
		common.APIRespondWithError(c, http.StatusOK, err)
		return
	}

	if params.Ids == nil || len(params.Ids) == 0 {
		common.APIRespondWithError(c, http.StatusOK, errors.New("ids不能为空"))
		return
	}
	var count int64
	count, err = model.BatchUpdateChannelsAzureApi(&params)
	if err != nil {
		common.APIRespondWithError(c, http.StatusOK, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data":    count,
		"success": true,
		"message": "更新成功",
	})
}

func BatchDelModelChannels(c *gin.Context) {
	var params model.BatchChannelsParams
	err := c.ShouldBindJSON(&params)
	if err != nil {
		common.APIRespondWithError(c, http.StatusOK, err)
		return
	}

	if params.Ids == nil || len(params.Ids) == 0 {
		common.APIRespondWithError(c, http.StatusOK, errors.New("ids不能为空"))
		return
	}

	var count int64
	count, err = model.BatchDelModelChannels(&params)
	if err != nil {
		common.APIRespondWithError(c, http.StatusOK, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data":    count,
		"success": true,
		"message": "更新成功",
	})
}

func BatchDeleteChannel(c *gin.Context) {
	var params model.BatchChannelsParams
	err := c.ShouldBindJSON(&params)
	if err != nil {
		common.APIRespondWithError(c, http.StatusOK, err)
		return
	}

	if params.Ids == nil || len(params.Ids) == 0 {
		common.APIRespondWithError(c, http.StatusOK, errors.New("ids不能为空"))
		return
	}

	count, err := model.BatchDeleteChannel(params.Ids)
	if err != nil {
		common.APIRespondWithError(c, http.StatusOK, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    count,
	})
}
