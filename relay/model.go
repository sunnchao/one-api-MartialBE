package relay

import (
	"fmt"
	"net/http"
	"one-api/common"
	"one-api/common/config"
	"one-api/common/utils"
	"one-api/model"
	"one-api/providers/claude"
	"one-api/providers/gemini"
	"one-api/types"
	"sort"
	"strings"

	"golang.org/x/text/cases"
	"golang.org/x/text/language"

	"github.com/gin-gonic/gin"
)

// https://platform.openai.com/docs/api-reference/models/list
type OpenAIModels struct {
	Id      string  `json:"id"`
	Object  string  `json:"object"`
	Created int     `json:"created"`
	OwnedBy *string `json:"owned_by"`
}

func ListModelsByToken(c *gin.Context) {
	groupName := c.GetString("token_group")
	backupGroupName := c.GetString("token_backup_group")
	groupNameList := groupName
	if backupGroupName != "" && backupGroupName != groupName {
		groupNameList = groupName + "," + backupGroupName
	}
	if groupName == "" {
		groupName = c.GetString("group")
	}

	if groupName == "" {
		common.AbortWithMessage(c, http.StatusServiceUnavailable, "分组不存在")
		return
	}

	var models []string
	var err error
	if strings.Contains(groupNameList, ",") {
		groupArray := strings.Split(groupNameList, ",")
		models, err = model.ChannelGroup.GetGroupListModels(groupArray)
	} else {
		models, err = model.ChannelGroup.GetGroupModels(groupName)
	}

	if err != nil {
		c.JSON(200, gin.H{
			"object": "list",
			"data":   []string{},
		})
		return
	}
	sort.Strings(models)

	var groupOpenAIModels []*OpenAIModels
	for _, modelName := range models {
		groupOpenAIModels = append(groupOpenAIModels, getOpenAIModelWithName(modelName))
	}

	// 根据 OwnedBy 排序
	sort.Slice(groupOpenAIModels, func(i, j int) bool {
		if groupOpenAIModels[i].OwnedBy == nil {
			return true // 假设 nil 值小于任何非 nil 值
		}
		if groupOpenAIModels[j].OwnedBy == nil {
			return false // 假设任何非 nil 值大于 nil 值
		}
		return *groupOpenAIModels[i].OwnedBy < *groupOpenAIModels[j].OwnedBy
	})

	c.JSON(200, gin.H{
		"object": "list",
		"data":   groupOpenAIModels,
	})
}

// https://generativelanguage.googleapis.com/v1beta/models?key=xxxxxxx
func ListGeminiModelsByToken(c *gin.Context) {
	groupName := c.GetString("token_group")
	backupGroupName := c.GetString("token_backup_group")
	if groupName == "" {
		groupName = c.GetString("group")
	}

	if groupName == "" {
		common.AbortWithMessage(c, http.StatusServiceUnavailable, "分组不存在")
		return
	}

	var models []string
	var err error

	// If both primary and backup groups exist, use GetGroupListModels
	if backupGroupName != "" && backupGroupName != groupName {
		// Validate both groups exist before combining
		_, err1 := model.ChannelGroup.GetGroupModels(groupName)
		_, err2 := model.ChannelGroup.GetGroupModels(backupGroupName)

		if err1 != nil && err2 != nil {
			// Both groups failed, return error
			models = []string{}
			err = err1
		} else if err1 != nil {
			// Primary group failed, use backup only
			models, err = model.ChannelGroup.GetGroupModels(backupGroupName)
		} else if err2 != nil {
			// Backup group failed, use primary only
			models, err = model.ChannelGroup.GetGroupModels(groupName)
		} else {
			// Both groups exist, combine them
			finalGroupList := []string{groupName, backupGroupName}
			models, err = model.ChannelGroup.GetGroupListModels(finalGroupList)
		}
	} else {
		// Only primary group, use GetGroupModels
		models, err = model.ChannelGroup.GetGroupModels(groupName)
	}
	if err != nil {
		c.JSON(200, gemini.ModelListResponse{
			Models: []gemini.ModelDetails{},
		})
		return
	}
	sort.Strings(models)

	var geminiModels []gemini.ModelDetails
	for _, modelName := range models {
		// Get the price to check if it's a Gemini model (channel_type=25)
		price, err := model.PricingInstance.GetPrice(modelName)
		if err != nil {
			continue
		}
		if price.ChannelType == config.ChannelTypeGemini {
			geminiModels = append(geminiModels, gemini.ModelDetails{
				Name:        fmt.Sprintf("models/%s", modelName),
				DisplayName: cases.Title(language.Und).String(strings.ReplaceAll(modelName, "-", " ")),
				SupportedGenerationMethods: []string{
					"generateContent",
				},
			})
		}
	}

	c.JSON(200, gemini.ModelListResponse{
		Models: geminiModels,
	})
}

func ListClaudeModelsByToken(c *gin.Context) {
	groupName := c.GetString("token_group")
	backupGroupName := c.GetString("token_backup_group")
	if groupName == "" {
		groupName = c.GetString("group")
	}

	if groupName == "" {
		common.AbortWithMessage(c, http.StatusServiceUnavailable, "分组不存在")
		return
	}

	var models []string
	var err error

	// If both primary and backup groups exist, use GetGroupListModels
	if backupGroupName != "" && backupGroupName != groupName {
		// Validate both groups exist before combining
		_, err1 := model.ChannelGroup.GetGroupModels(groupName)
		_, err2 := model.ChannelGroup.GetGroupModels(backupGroupName)

		if err1 != nil && err2 != nil {
			// Both groups failed, return error
			models = []string{}
			err = err1
		} else if err1 != nil {
			// Primary group failed, use backup only
			models, err = model.ChannelGroup.GetGroupModels(backupGroupName)
		} else if err2 != nil {
			// Backup group failed, use primary only
			models, err = model.ChannelGroup.GetGroupModels(groupName)
		} else {
			// Both groups exist, combine them
			finalGroupList := []string{groupName, backupGroupName}
			models, err = model.ChannelGroup.GetGroupListModels(finalGroupList)
		}
	} else {
		// Only primary group, use GetGroupModels
		models, err = model.ChannelGroup.GetGroupModels(groupName)
	}
	if err != nil {
		c.JSON(200, claude.ModelListResponse{
			Data: []claude.Model{},
		})
		return
	}
	sort.Strings(models)

	var claudeModelsData []claude.Model
	for _, modelName := range models {
		// Get the price to check if it's a Gemini model (channel_type=25)
		price, err := model.PricingInstance.GetPrice(modelName)
		if err != nil {
			continue
		}
		if price.ChannelType == config.ChannelTypeAnthropic {
			claudeModelsData = append(claudeModelsData, claude.Model{
				ID:   modelName,
				Type: "model",
			})
		}
	}

	c.JSON(200, claude.ModelListResponse{
		Data: claudeModelsData,
	})
}

func ListModelsForAdmin(c *gin.Context) {
	prices := model.PricingInstance.GetAllPrices()
	var openAIModels []OpenAIModels
	for modelId, price := range prices {
		openAIModels = append(openAIModels, OpenAIModels{
			Id:      modelId,
			Object:  "model",
			Created: 1677649963,
			OwnedBy: getModelOwnedBy(price.ChannelType),
		})
	}
	// 根据 OwnedBy 排序
	sort.Slice(openAIModels, func(i, j int) bool {
		if openAIModels[i].OwnedBy == nil {
			return true // 假设 nil 值小于任何非 nil 值
		}
		if openAIModels[j].OwnedBy == nil {
			return false // 假设任何非 nil 值大于 nil 值
		}
		return *openAIModels[i].OwnedBy < *openAIModels[j].OwnedBy
	})

	c.JSON(200, gin.H{
		"object": "list",
		"data":   openAIModels,
	})
}

func RetrieveModel(c *gin.Context) {
	modelName := c.Param("model")
	openaiModel := getOpenAIModelWithName(modelName)
	if *openaiModel.OwnedBy != model.UnknownOwnedBy {
		c.JSON(200, openaiModel)
	} else {
		openAIError := types.OpenAIError{
			Message: fmt.Sprintf("The model '%s' does not exist", modelName),
			Type:    "invalid_request_error",
			Param:   "model",
			Code:    "model_not_found",
		}
		c.JSON(200, gin.H{
			"error": openAIError,
		})
	}
}

func getModelOwnedBy(channelType int) (ownedBy *string) {
	ownedByName := model.ModelOwnedBysInstance.GetName(channelType)
	if ownedByName != "" {
		return &ownedByName
	}

	return &model.UnknownOwnedBy
}

func getOpenAIModelWithName(modelName string) *OpenAIModels {
	channelType := config.ChannelTypeUnknown
	if price, err := model.PricingInstance.GetPrice(modelName); err == nil && price != nil {
		channelType = price.ChannelType
	}

	return &OpenAIModels{
		Id:      modelName,
		Object:  "model",
		Created: 1677649963,
		OwnedBy: getModelOwnedBy(channelType),
	}
}

func GetModelOwnedBy(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    model.ModelOwnedBysInstance.GetAll(),
	})
}

type ModelPrice struct {
	Type   string  `json:"type"`
	Input  float64 `json:"input"`
	Output float64 `json:"output"`
}

type AvailableModelResponse struct {
	Groups    []string     `json:"groups"`
	EndPoints []int        `json:"end_points"`
	OwnedBy   string       `json:"owned_by"`
	Price     *model.Price `json:"price"`
	OwnedById int          `json:"owned_by_id"`
}

func AvailableModel(c *gin.Context) {
	groupName := c.GetString("group")

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    getAvailableModels(groupName),
	})
}

func GetAvailableModels(groupName string) map[string]*AvailableModelResponse {
	return getAvailableModels(groupName)
}

func getAvailableModels(groupName string) map[string]*AvailableModelResponse {
	publicModels := model.ChannelGroup.GetModelsGroups()
	modelEndPoints := model.ChannelGroup.GetModelsEndPoints()
	publicGroups := model.GlobalUserGroupRatio.GetPublicGroupList()
	if groupName != "" && !utils.Contains(groupName, publicGroups) {
		publicGroups = append(publicGroups, groupName)
	}

	availableModels := make(map[string]*AvailableModelResponse, len(publicModels))

	for modelName, group := range publicModels {
		groups := []string{}
		endPoints := []int{}
		for _, publicGroup := range publicGroups {
			if group[publicGroup] {
				groups = append(groups, publicGroup)
			}
		}
		if _, ok := modelEndPoints[modelName]; ok {
			for endPoint := range modelEndPoints[modelName] {
				endPoints = append(endPoints, endPoint)
			}
		}

		if len(groups) == 0 {
			continue
		}

		if _, ok := availableModels[modelName]; !ok {
			price, err := model.PricingInstance.GetPrice(modelName)
			if err != nil {
				continue
			}
			availableModels[modelName] = &AvailableModelResponse{
				Groups:    groups,
				EndPoints: endPoints,
				OwnedBy:   *getModelOwnedBy(price.ChannelType),
				OwnedById: price.ChannelType,
				Price:     price,
			}
		}
	}

	return availableModels
}
