package model

import (
	"context"
	"fmt"
	"one-api/common/config"
	"one-api/common/logger"
	"one-api/common/utils"
	"time"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Log struct {
	Id               int    `json:"id"`
	UserId           int    `json:"user_id" gorm:"index"`
	CreatedAt        int64  `json:"created_at" gorm:"bigint;index:idx_created_at_type"`
	Type             int    `json:"type" gorm:"index:idx_created_at_type"`
	Content          string `json:"content"`
	Username         string `json:"username" gorm:"index:index_username_model_name,priority:2;default:''"`
	TokenName        string `json:"token_name" gorm:"index;default:''"`
	TokenId          int    `json:"token_id" gorm:"index;"`
	ModelName        string `json:"model_name" gorm:"index;index:index_username_model_name,priority:1;default:''"`
	OriginModelName  string `json:"origin_model_name,omitempty" gorm:"index;index:index_username_origin_model_name,priority:1;default:''"`
	Quota            int    `json:"quota" gorm:"default:0"`
	PromptTokens     int    `json:"prompt_tokens" gorm:"default:0"`
	CompletionTokens int    `json:"completion_tokens" gorm:"default:0"`
	ChannelId        int    `json:"channel_id" gorm:"index"`
	RequestTime      int    `json:"request_time" gorm:"default:0"`
	RequestIp        string `json:"request_ip,omitempty" gorm:"default:''"`
	RequestId        string `json:"request_id,omitempty"`
	SourceIp         string `json:"source_ip" gorm:"default:''"`
	IsStream         bool   `json:"is_stream" gorm:"default:false"`
	IsError          bool   `json:"is_error" gorm:"default:false"`

	Metadata datatypes.JSONType[map[string]any] `json:"metadata" gorm:"type:json"`

	Channel *Channel `json:"channel" gorm:"foreignKey:Id;references:ChannelId"`
}

const (
	LogTypeUnknown = iota
	LogTypeTopup
	LogTypeConsume
	LogTypeManage
	LogTypeSystem
	LogTypeUserQuoteIncrease
	LogLogin
	LogTypeAPIError
	LogTypeArchive
)

func RecordLog(userId int, logType int, content string, requestIp string) {
	if logType == LogTypeConsume && !config.LogConsumeEnabled {
		return
	}
	username, _ := CacheGetUsername(userId)

	log := &Log{
		UserId:    userId,
		Username:  username,
		CreatedAt: utils.GetTimestamp(),
		Type:      logType,
		Content:   content,
		RequestIp: requestIp,
	}
	err := DB.Create(log).Error
	if err != nil {
		logger.SysError("failed to record log: " + err.Error())
	}
}

func RecordConsumeLog(
	ctx context.Context,
	userId int,
	channelId int,
	promptTokens int,
	completionTokens int,
	modelName string,
	tokenName string,
	tokenId int,
	quota int,
	content string,
	requestTime int,
	isStream bool,
	isError bool,
	metadata map[string]any,
	sourceIp string) {
	logger.LogInfo(ctx, fmt.Sprintf("record consume log: userId=%d, channelId=%d, promptTokens=%d, completionTokens=%d, modelName=%s, tokenName=%s, quota=%d, content=%s ,sourceIp=%s", userId, channelId, promptTokens, completionTokens, modelName, tokenName, quota, content, sourceIp))
	if !config.LogConsumeEnabled {
		return
	}

	username, _ := CacheGetUsername(userId)

	log := &Log{
		UserId:           userId,
		Username:         username,
		CreatedAt:        utils.GetTimestamp(),
		Type:             LogTypeConsume,
		Content:          content,
		PromptTokens:     promptTokens,
		CompletionTokens: completionTokens,
		TokenName:        tokenName,
		TokenId:          tokenId,
		ModelName:        modelName,
		Quota:            quota,
		ChannelId:        channelId,
		RequestTime:      requestTime,
		IsStream:         isStream,
		SourceIp:         sourceIp,
		IsError:          isError,
		RequestIp:        ctx.Value(logger.RequestIPKey).(string),
		RequestId:        ctx.Value(logger.RequestIdKey).(string),
	}

	if metadata != nil {
		log.Metadata = datatypes.NewJSONType(metadata)
	}

	err := DB.Create(log).Error
	if err != nil {
		logger.LogError(ctx, "failed to record log: "+err.Error())
	}
}

func RecordConsumeErrorLog(ctx context.Context, userId int, channelId int, modelName string, tokenName string, tokenId int, content string, requestIP string, requestID string) {
	logger.LogInfo(ctx, fmt.Sprintf("record consume error log: userId=%d, channelId=%d, modelName=%s, tokenName=%s, tokenId=%d, content=%s", userId, channelId, modelName, tokenName, tokenId, content))
	if !config.LogConsumeEnabled {
		return
	}

	username, _ := CacheGetUsername(userId)

	log := &Log{
		UserId:    userId,
		Username:  username,
		CreatedAt: utils.GetTimestamp(),
		Type:      LogTypeAPIError,
		Content:   content,
		ChannelId: channelId,
		ModelName: modelName,
		TokenName: tokenName,
		TokenId:   tokenId,
		RequestIp: requestIP,
		RequestId: requestID,
		IsError:   true,
	}

	err := DB.Create(log).Error
	if err != nil {
		logger.LogError(ctx, "failed to record log: "+err.Error())
	}

}

type LogsListParams struct {
	PaginationParams
	LogType        int    `form:"log_type"`
	StartTimestamp int64  `form:"start_timestamp"`
	EndTimestamp   int64  `form:"end_timestamp"`
	ModelName      string `form:"model_name"`
	Username       string `form:"username"`
	TokenName      string `form:"token_name"`
	ChannelId      int    `form:"channel_id"`
	RequestId      string `form:"request_id"`
	RequestIP      string `form:"request_ip"`
	SourceIp       string `form:"source_ip"`
}

var allowedLogsOrderFields = map[string]bool{
	"created_at": true,
	"channel_id": true,
	"user_id":    true,
	"token_name": true,
	"token_id":   true,
	"model_name": true,
	"type":       true,
	"source_ip":  true,
	"request_id": true,
	"request_ip": true,
}

func GetLogsList(params *LogsListParams) (*DataResult[Log], error) {
	var tx *gorm.DB
	var logs []*Log

	tx = DB.Preload("Channel", func(db *gorm.DB) *gorm.DB {
		return db.Select("id, name")
	})

	if params.LogType != LogTypeUnknown {
		tx = tx.Where("type = ?", params.LogType)
	}
	if params.ModelName != "" {
		tx = tx.Where("model_name = ?", params.ModelName)
	}
	if params.Username != "" {
		tx = tx.Where("username = ? or user_id = ?", params.Username, params.Username)
	}
	if params.TokenName != "" {
		tx = tx.Where("token_name = ?", params.TokenName)
	}
	if params.StartTimestamp != 0 {
		tx = tx.Where("created_at >= ?", params.StartTimestamp)
	}
	if params.EndTimestamp != 0 {
		tx = tx.Where("created_at <= ?", params.EndTimestamp)
	}
	if params.ChannelId != 0 {
		tx = tx.Where("channel_id = ?", params.ChannelId)
	}
	if params.RequestId != "" {
		tx = tx.Where("request_id = ?", params.RequestId)
	}
	if params.RequestIP != "" {
		tx = tx.Where("request_ip = ?", params.RequestIP)
	}
	if params.SourceIp != "" {
		tx = tx.Where("source_ip = ?", params.SourceIp)
	}

	return PaginateAndOrder[Log](tx, &params.PaginationParams, &logs, allowedLogsOrderFields)
}

func GetUserLogsList(userId int, params *LogsListParams) (*DataResult[Log], error) {
	var logs []*Log

	tx := DB.Where("user_id = ?", userId).Omit("id")

	if params.LogType != LogTypeUnknown {
		tx = tx.Where("type = ?", params.LogType)
	}
	if params.ModelName != "" {
		tx = tx.Where("model_name = ?", params.ModelName)
	}
	if params.TokenName != "" {
		tx = tx.Where("token_name = ?", params.TokenName)
	}
	if params.StartTimestamp != 0 {
		tx = tx.Where("created_at >= ?", params.StartTimestamp)
	}
	if params.EndTimestamp != 0 {
		tx = tx.Where("created_at <= ?", params.EndTimestamp)
	}

	// 接收 PaginateAndOrder[Log](tx, &params.PaginationParams, &logs, allowedLogsOrderFields)
	dataResult, err := PaginateAndOrder[Log](tx, &params.PaginationParams, &logs, allowedLogsOrderFields)
	if err != nil {
		return nil, err
	}

	// 处理 dataResult 的 Data 的 is_error 字段
	for _, log := range *dataResult.Data {
		if log.IsError {
			log.Content = "请求失败如果多次出现，请联系客服"
		}
	}

	return dataResult, nil
}

func SearchAllLogs(keyword string) (logs []*Log, err error) {
	err = DB.Where("type = ? or content LIKE ?", keyword, keyword+"%").Order("id desc").Limit(config.MaxRecentItems).Find(&logs).Error
	return logs, err
}

func SearchUserLogs(userId int, keyword string) (logs []*Log, err error) {
	err = DB.Where("user_id = ? and type = ?", userId, keyword).Order("id desc").Limit(config.MaxRecentItems).Omit("id").Find(&logs).Error
	return logs, err
}

type Stat struct {
	Quota int `json:"quota"`
	Rpm   int `json:"rpm"`
	Tpm   int `json:"tpm"`
}

func SumUsedQuota(startTimestamp int64, endTimestamp int64, modelName string, username string, tokenName string, channel int, user_id int) (quota int, stat Stat) {
	tx := DB.Table("logs").Select(assembleSumSelectStr("quota"))
	rpmTpmQuery := DB.Table("logs").Select("count(*) rpm, sum(prompt_tokens) + sum(completion_tokens) tpm")
	// rpmTpmQuery 的 created_at 为最近60秒
	rpmTpmQuery = rpmTpmQuery.Where("created_at >= ? and is_error = ?", time.Now().Add(-time.Minute).Unix(), false)

	if username != "" {
		tx = tx.Where("username = ?", username)
		rpmTpmQuery = rpmTpmQuery.Where("username = ?", username)
	}
	if tokenName != "" {
		tx = tx.Where("token_name = ?", tokenName)
		rpmTpmQuery = rpmTpmQuery.Where("token_name = ?", tokenName)
	}
	if startTimestamp != 0 {
		tx = tx.Where("created_at >= ?", startTimestamp)
	}
	if endTimestamp != 0 {
		tx = tx.Where("created_at <= ?", endTimestamp)
	}
	if modelName != "" {
		tx = tx.Where("model_name = ?", modelName)
		rpmTpmQuery = rpmTpmQuery.Where("model_name = ?", modelName)
	}
	if channel != 0 {
		tx = tx.Where("channel_id = ?", channel)
		rpmTpmQuery = rpmTpmQuery.Where("channel_id = ?", channel)
	}
	if user_id != 0 {
		tx = tx.Where("user_id = ?", user_id)
		rpmTpmQuery = rpmTpmQuery.Where("user_id = ?", user_id)
	}
	tx.Where("type = ?", LogTypeConsume).Scan(&quota)
	rpmTpmQuery.Scan(&stat)

	return quota, stat
}

func DeleteOldLog(targetTimestamp int64) (int64, error) {
	result := DB.Where("type = ? AND created_at < ?", LogTypeConsume, targetTimestamp).Delete(&Log{})
	return result.RowsAffected, result.Error
}

// 删除日志
// 1. 按照用户分组查询日志
// 2. 记录归档日志
// 3. 按照用户分组删除日志
func DeleteOldLogByGroup(targetTimestamp int64) (int64, error) {
	// 1. 按照用户分组查询日志
	type UserLogSummary struct {
		UserId     int    `gorm:"column:user_id"`
		Username   string `gorm:"column:username"`
		LogCount   int64  `gorm:"column:log_count"`
		TotalQuota int64  `gorm:"column:total_quota"`
	}

	var userLogSummaries []UserLogSummary
	err := DB.Model(&Log{}).
		Select("user_id, username, COUNT(*) as log_count, SUM(quota) as total_quota").
		Where("type = ? AND created_at < ?", LogTypeConsume, targetTimestamp).
		Group("user_id, username").
		Find(&userLogSummaries).Error

	if err != nil {
		return 0, err
	}

	// 2. 记录归档日志
	var totalRowsAffected int64 = 0
	for _, summary := range userLogSummaries {
		// Convert Unix timestamp to time.Time
		formattedTime := time.Unix(targetTimestamp, 0).Format("2006-01-02 15:04:05")

		archiveContent := fmt.Sprintf("归档截止到 %s 的 %d 条日志，共计 %d 额度",
			formattedTime, summary.LogCount, summary.TotalQuota)

		archiveLog := &Log{
			UserId:    summary.UserId,
			Username:  summary.Username,
			CreatedAt: utils.GetTimestamp(),
			Type:      LogTypeArchive,
			Content:   archiveContent,
		}

		if err := DB.Create(archiveLog).Error; err != nil {
			logger.SysError("failed to record archive log: " + err.Error())
		}
	}

	// 3. 按照用户分组删除日志
	for _, summary := range userLogSummaries {
		result := DB.Where("user_id = ? AND type = ? AND created_at < ?",
			summary.UserId, LogTypeConsume, targetTimestamp).Delete(&Log{})

		if result.Error != nil {
			return totalRowsAffected, result.Error
		}

		totalRowsAffected += result.RowsAffected
	}

	return totalRowsAffected, nil
}

type LogStatistic struct {
	Date             string `gorm:"column:date"`
	RequestCount     int64  `gorm:"column:request_count"`
	Quota            int64  `gorm:"column:quota"`
	PromptTokens     int64  `gorm:"column:prompt_tokens"`
	CompletionTokens int64  `gorm:"column:completion_tokens"`
	RequestTime      int64  `gorm:"column:request_time"`
}

type LogStatisticGroupModel struct {
	LogStatistic
	ModelName string `gorm:"column:model_name"`
}

type LogStatisticGroupChannel struct {
	LogStatistic
	Channel string `gorm:"column:channel"`
}

func RecordLogWithRequestIP(userId int, logType int, content string, requestIP string) {
	if logType == LogTypeConsume && !config.LogConsumeEnabled {
		return
	}
	log := &Log{
		UserId:    userId,
		Username:  GetUsernameById(userId),
		CreatedAt: utils.GetTimestamp(),
		Type:      logType,
		Content:   content,
		RequestIp: requestIP,
	}
	err := DB.Create(log).Error
	if err != nil {
		logger.SysError("failed to record log: " + err.Error())
	}
}

func RecordAPIErrorLog(ctx context.Context, userId int, channelId int, modelName string, tokenName string, tokenId int, content string, requestIP string, requestID string) {
	logger.LogInfo(ctx, fmt.Sprintf("record API error log: userId=%d, channelId=%d, modelName=%s, tokenName=%s, tokenId=%d, content=%s", userId, channelId, modelName, tokenName, tokenId, content))
	log := &Log{
		UserId:    userId,
		Username:  GetUsernameById(userId),
		CreatedAt: utils.GetTimestamp(),
		Type:      LogTypeAPIError,
		Content:   content,
		ChannelId: channelId,
		ModelName: modelName,
		TokenName: tokenName,
		TokenId:   tokenId,
		RequestIp: requestIP,
		RequestId: requestID,
	}

	err := DB.Create(log).Error
	if err != nil {
		logger.SysError("failed to record API error log: " + err.Error())
	}
}
