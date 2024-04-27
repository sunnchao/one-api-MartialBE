package middleware

import (
	"fmt"
	"net/http"
	"one-api/common"
	"one-api/model"
	provider "one-api/providers/midjourney"
	"one-api/relay/midjourney"
	"strings"

	"github.com/gin-gonic/gin"
)

type ModelRequest struct {
	Model string `json:"model"`
}

func Distribute() func(c *gin.Context) {
	return func(c *gin.Context) {
		userId := c.GetInt("id")
		userGroup, _ := model.CacheGetUserGroup(userId)
		c.Set("group", userGroup)

		modelRequest, _, _ := getModelRequest(c)

		// 判断令牌是否有权访问模型
		modelLimitEnable := c.GetBool("token_model_limit_enabled")

		if modelLimitEnable {
			s, ok := c.Get("token_model_limit")
			var tokenModelLimit map[string]bool
			if ok {
				tokenModelLimit = s.(map[string]bool)
			} else {
				tokenModelLimit = map[string]bool{}
			}
			if tokenModelLimit != nil {
				if _, ok := tokenModelLimit[modelRequest.Model]; !ok {
					abortWithMessage(c, http.StatusForbidden, "该令牌无权访问模型 "+modelRequest.Model)
					return
				}
			} else {
				// token model limit is empty, all models are not allowed
				abortWithMessage(c, http.StatusForbidden, "该令牌无权访问任何模型")
				return
			}
		}

		c.Next()
	}
}

func getModelRequest(c *gin.Context) (*ModelRequest, bool, error) {
	var modelRequest ModelRequest
	shouldSelectChannel := true
	var err error
	if strings.Contains(c.Request.URL.Path, "/mj/") {
		relayMode := midjourney.Path2RelayModeMidjourney(c.Request.URL.Path)
		if relayMode == provider.RelayModeMidjourneyTaskFetch ||
			relayMode == provider.RelayModeMidjourneyTaskFetchByCondition ||
			relayMode == provider.RelayModeMidjourneyNotify ||
			relayMode == provider.RelayModeMidjourneyTaskImageSeed {
			shouldSelectChannel = false
		} else {
			midjourneyRequest := provider.MidjourneyRequest{}
			err = common.UnmarshalBodyReusable(c, &midjourneyRequest)
			if err != nil {
				abortWithMidjourneyMessage(c, http.StatusBadRequest, provider.MjErrorUnknown, "无效的请求, "+err.Error())
				return nil, false, err
			}
			midjourneyModel, mjErr, success := midjourney.GetMjRequestModel(relayMode, &midjourneyRequest)
			if mjErr != nil {
				abortWithMidjourneyMessage(c, http.StatusBadRequest, mjErr.Code, mjErr.Description)
				return nil, false, fmt.Errorf(mjErr.Description)
			}
			if midjourneyModel == "" {
				if !success {
					abortWithMidjourneyMessage(c, http.StatusBadRequest, provider.MjErrorUnknown, "无效的请求, 无法解析模型")
					return nil, false, fmt.Errorf("无效的请求, 无法解析模型")
				} else {
					// task fetch, task fetch by condition, notify
					shouldSelectChannel = false
				}
			}
			modelRequest.Model = midjourneyModel
		}
		c.Set("relay_mode", relayMode)
	} else if !strings.HasPrefix(c.Request.URL.Path, "/v1/audio/transcriptions") {
		err = common.UnmarshalBodyReusable(c, &modelRequest)
	}
	if err != nil {
		abortWithMessage(c, http.StatusBadRequest, "无效的请求, "+err.Error())
		return nil, false, err
	}
	if strings.HasPrefix(c.Request.URL.Path, "/v1/moderations") {
		if modelRequest.Model == "" {
			modelRequest.Model = "text-moderation-stable"
		}
	}
	if strings.HasSuffix(c.Request.URL.Path, "embeddings") {
		if modelRequest.Model == "" {
			modelRequest.Model = c.Param("model")
		}
	}
	if strings.HasPrefix(c.Request.URL.Path, "/v1/images/generations") {
		if modelRequest.Model == "" {
			modelRequest.Model = "dall-e"
		}
	}
	if strings.HasPrefix(c.Request.URL.Path, "/v1/audio") {
		if modelRequest.Model == "" {
			if strings.HasPrefix(c.Request.URL.Path, "/v1/audio/speech") {
				modelRequest.Model = "tts-1"
			} else {
				modelRequest.Model = "whisper-1"
			}
		}
	}
	return &modelRequest, shouldSelectChannel, nil
}
