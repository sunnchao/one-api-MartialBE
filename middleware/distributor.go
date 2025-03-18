package middleware

import (
	"fmt"
	"net/http"
	"one-api/model"
	"strings"

	"github.com/gin-gonic/gin"
)

func Distribute() func(c *gin.Context) {
	return func(c *gin.Context) {
		userId := c.GetInt("id")
		userGroup, _ := model.CacheGetUserGroup(userId)
		c.Set("group", userGroup)

		tokenGroup := c.GetString("token_group")
		if tokenGroup == "" {
			tokenGroup = userGroup
			c.Set("token_group", tokenGroup)
		}

		// tokenGroup 可能是个逗号分割的字符串
		// 如果 tokenGroup 是逗号分割的字符串，则需要遍历 tokenGroupList 并获取每个分组的 groupRatio
		// 如果 tokenGroup 不是逗号分割的字符串，则直接获取 groupRatio
		
		var groupRatioList []*model.UserGroup
		if strings.Contains(tokenGroup, ",") {
			tokenGroupList := strings.Split(tokenGroup, ",")
			for _, group := range tokenGroupList {
				groupRatio := model.GlobalUserGroupRatio.GetBySymbol(group)
				groupRatioList = append(groupRatioList, groupRatio)
			}
		} else {
			groupRatio := model.GlobalUserGroupRatio.GetBySymbol(tokenGroup)
			groupRatioList = append(groupRatioList, groupRatio)
		}

		// 如果 groupRatioList 为空，则返回 403
		if len(groupRatioList) == 0 {
			abortWithMessage(c, http.StatusForbidden, fmt.Sprintf("分组 %s 不存在", tokenGroup))
			return
		}

		// 将 groupRatioList 转换为 map[string]float64
		groupRatioMap := make(map[string]float64)
		for _, groupRatio := range groupRatioList {
			groupRatioMap[groupRatio.Symbol] = groupRatio.Ratio
		}
		c.Set("group_ratio", groupRatioMap)
		c.Next()
	}
}
