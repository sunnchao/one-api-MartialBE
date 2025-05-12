package model

import (
	"one-api/common/logger"
	"one-api/common/utils"
	"time"

	"gorm.io/gorm"
)

// ChannelKey represents a key for a channel
type ChannelKey struct {
	Id            int            `json:"id" gorm:"primaryKey"`
	ChannelId     int            `json:"channel_id" gorm:"index"`
	Key           string         `json:"key" gorm:"type:text"`
	Status        int            `json:"status" gorm:"default:1"` // 1: enabled, 2: disabled
	LastUsedTime  int64          `json:"last_used_time" gorm:"bigint;default:0"`
	ErrorCount    int            `json:"error_count" gorm:"default:0"`
	LastErrorTime int64          `json:"last_error_time" gorm:"bigint;default:0"`
	LastErrorMsg  string         `json:"last_error_msg" gorm:"type:text"`
	CreatedTime   int64          `json:"created_time" gorm:"bigint"`
	UsedQuota     int64          `json:"used_quota" gorm:"bigint;default:0"`
	IsDeleted     int            `json:"is_deleted" gorm:"default:0"`
	DeletedAt     gorm.DeletedAt `json:"-" gorm:"index"`
}

// Constants for ChannelKey status
const (
	ChannelKeyStatusEnabled  = 1
	ChannelKeyStatusDisabled = 2
)

// GetChannelKeysByChannelId retrieves all keys for a given channel ID
func GetChannelKeysByChannelId(channelId int) ([]*ChannelKey, error) {
	var keys []*ChannelKey
	err := DB.Where("channel_id = ? AND status = ?", channelId, ChannelKeyStatusEnabled).Find(&keys).Error
	return keys, err
}

// GetNextAvailableKey gets the next available key for a channel using round-robin selection
func GetNextAvailableKey(channelId int) (*ChannelKey, error) {
	var keys []*ChannelKey
	err := DB.Where("channel_id = ? AND status = ? AND is_deleted = ?", channelId, ChannelKeyStatusEnabled, 0).
		Order("last_used_time ASC").
		Find(&keys).Error

	if err != nil {
		return nil, err
	}

	if len(keys) == 0 {
		return nil, nil
	}

	// Use the key with the oldest last_used_time (round-robin)
	selectedKey := keys[0]

	// Update last used time
	err = DB.Model(selectedKey).Update("last_used_time", time.Now().Unix()).Error
	if err != nil {
		logger.SysError("failed to update key last used time: " + err.Error())
	}

	return selectedKey, nil
}

// RecordKeyError records an error for a key
func RecordKeyError(keyId int, errorMsg string) error {
	key := &ChannelKey{Id: keyId}

	// Get current key to check error count
	err := DB.First(key).Error
	if err != nil {
		return err
	}

	// Increment error count and update last error info
	key.ErrorCount++
	key.LastErrorTime = time.Now().Unix()
	key.LastErrorMsg = errorMsg

	// If error count exceeds threshold, disable the key
	if key.ErrorCount >= 3 { // Configurable threshold
		key.Status = ChannelKeyStatusDisabled
	}

	err = DB.Model(key).Updates(ChannelKey{
		ErrorCount:    key.ErrorCount,
		LastErrorTime: key.LastErrorTime,
		LastErrorMsg:  key.LastErrorMsg,
		Status:        key.Status,
	}).Error

	return err
}

// ResetKeyErrors resets error count for a key
func ResetKeyErrors(keyId int) error {
	err := DB.Model(&ChannelKey{Id: keyId}).Updates(map[string]interface{}{
		"error_count":     0,
		"last_error_time": 0,
		"last_error_msg":  "",
		"status":          ChannelKeyStatusEnabled,
	}).Error

	return err
}

// InsertChannelKey adds a new key to a channel
func InsertChannelKey(channelId int, key string) error {
	channelKey := &ChannelKey{
		ChannelId:   channelId,
		Key:         key,
		Status:      ChannelKeyStatusEnabled,
		CreatedTime: utils.GetTimestamp(),
	}

	err := DB.Create(channelKey).Error
	return err
}

// UpdateChannelKeyUsedQuota updates used quota for a key
func UpdateChannelKeyUsedQuota(id int, quota int) {
	err := DB.Model(&ChannelKey{}).Where("id = ?", id).
		Update("used_quota", gorm.Expr("used_quota + ?", quota)).Error

	if err != nil {
		logger.SysError("failed to update channel key used quota: " + err.Error())
	}
}

// DeleteChannelKeys deletes all keys for a channel
func DeleteChannelKeys(channelId int) error {
	err := DB.Where("channel_id = ?", channelId).Delete(&ChannelKey{}).Error
	return err
}

// EnableChannelKey enables a disabled key
func EnableChannelKey(keyId int) error {
	err := DB.Model(&ChannelKey{Id: keyId}).Updates(map[string]interface{}{
		"status":      ChannelKeyStatusEnabled,
		"error_count": 0,
	}).Error

	return err
}

// DisableChannelKey disables a key
func DisableChannelKey(keyId int) error {
	err := DB.Model(&ChannelKey{Id: keyId}).Update("status", ChannelKeyStatusDisabled).Error
	return err
}
