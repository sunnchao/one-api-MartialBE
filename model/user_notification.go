package model

import (
	"one-api/common/logger"
	"time"

	"gorm.io/datatypes"
)

// 通知类型枚举
type NotifyType string

const (
	Email NotifyType = "email"
	// 以下通知类型暂时不启用，但保留以便未来扩展
	// Wechat   NotifyType = "wechat"
	// WxPusher NotifyType = "wxpusher"
	// DingTalk NotifyType = "dingtalk"
	// Feishu   NotifyType = "feishu"
	// Webhook  NotifyType = "webhook"
	// Telegram NotifyType = "telegram"
)

// 订阅事件类型枚举
type SubscriptionEvent string

const (
	QuotaPush      SubscriptionEvent = "quota_push"
	SalePush       SubscriptionEvent = "sale_push"
	BackPush       SubscriptionEvent = "back_push"
	SystemPush     SubscriptionEvent = "system_push"
	PricePush      SubscriptionEvent = "price_push"
	BalanceWarning SubscriptionEvent = "balance_warning"
)

// 定义余额警告配置结构
type BalanceWarningConfig struct {
	Threshold     float64 `json:"threshold"`      // 余额警告阈值
	NotifyContent string  `json:"notify_content"` // 联系方式
}

type PushPlanOptionJsonType map[string]map[string]interface{}

/**
PushOptions 配置
{
	"balance_warning": {
		"threshold": 1,
		"notify_content": "test@example.com"
	}
}

*/
type UserNotification struct {
	ID                int                                         `json:"id" gorm:"primaryKey"`
	UserID            int                                         `json:"user_id" gorm:"index:idx_user_notify_type,unique:true,priority:1"`
	CreatedTime       int64                                       `json:"created_time" gorm:"type:bigint"`
	UpdatedTime       int64                                       `json:"updated_time" gorm:"type:bigint"`
	NotifyType        NotifyType                                  `json:"notify_type" gorm:"type:varchar(32);default:'email';index:idx_user_notify_type,unique:true,priority:2"`
	SubscriptionPlans datatypes.JSONType[[]SubscriptionEvent]     `json:"subscription_events" gorm:"type:json;not null"`
	PushOptions       *datatypes.JSONType[PushPlanOptionJsonType] `json:"push_options" gorm:"type:json;not null"`
}

func GetUserNotifications(userId int) ([]*UserNotification, error) {
	userNotifications := []*UserNotification{}
	if err := DB.Model(&UserNotification{}).Where("user_id = ?", userId).Find(&userNotifications).Error; err != nil {
		return nil, err
	}
	return userNotifications, nil
}

func UpdateUserNotifications(userId int, notifications []UserNotification) error {
	// Update implementation to handle slice
	return nil
}

// 初始化用户的通知配置
func InsertUserNotification(user *User) {
	// 初始化订阅计划
	subscriptionPlans := datatypes.NewJSONType([]SubscriptionEvent{BalanceWarning})

	// 初始化推送选项
	options := make(PushPlanOptionJsonType)

	// 为 balance_warning 设置默认阈值 和联系方式配置
	balanceWarningOptions := make(map[string]interface{})
	balanceWarningOptions["threshold"] = 1
	balanceWarningOptions["notify_content"] = user.Email
	options[string(BalanceWarning)] = balanceWarningOptions

	pushOptions := datatypes.NewJSONType(options)

	userNotification := &UserNotification{
		UserID:            user.Id,
		NotifyType:        Email,
		SubscriptionPlans: subscriptionPlans,
		PushOptions:       &pushOptions,
		CreatedTime:       time.Now().Unix(),
		UpdatedTime:       time.Now().Unix(),
	}

	if err := DB.Create(userNotification).Error; err != nil {
		logger.SysLog("Failed to create user notification: " + err.Error())
	}
}

// 针对所有用户，初始化用户的通知配置
func InitAllUserNotification() {
	users, err := GetAllUsers()
	if err != nil {
		logger.SysLog("Failed to get all users: " + err.Error())
		return
	}
	for _, user := range users {
		InsertUserNotification(user)
	}
}

// 根据用户ID获取用户的通知配置
func (userNotification *UserNotification) GetUserNotificationsByUserId() ([]*UserNotification, error) {
	var userNotifications []*UserNotification
	if err := DB.Model(&UserNotification{}).Where("user_id = ?", userNotification.UserID).Find(&userNotifications).Error; err != nil {
		return nil, err
	}
	return userNotifications, nil
}

func (userNotification *UserNotification) UpdateUserNotificationByUserId() error {
	return DB.Model(&UserNotification{}).Where("user_id = ?", userNotification.UserID).Updates(userNotification).Error
}
