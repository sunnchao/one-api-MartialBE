package model

import (
	"errors"
	"gorm.io/datatypes"
	"gorm.io/gorm"
	"one-api/common/utils"
)

type PushPlanOptionJsonType map[string]map[string]interface{}
type UserPush struct {
	Id                int                                         `json:"id"`
	UserId            int                                         `json:"user_id"`
	CreatedTime       int64                                       `json:"created_time" gorm:"type:bigint"`
	UpdatedTime       int64                                       `json:"updated_time" gorm:"type:bigint"`
	NotifyType        string                                      `json:"notify_type" gorm:"type:varchar(255);default:'email'"`
	SubscriptionPlans string                                      `json:"subscription_options" gorm:"type:varchar(255);default:'quota_push,sale_push,back_push,system_push,price_push'"`
	PushPlanOptions   *datatypes.JSONType[PushPlanOptionJsonType] `json:"push_options" gorm:"type:json;"`
}

func (userPush *UserPush) FillUserPushByUserId() error {
	// 使用Find()获取
	if userPush.UserId == 0 {
		return errors.New("userId is empty")
	}
	result := DB.Model(&UserPush{}).Where("user_id = ?", userPush.UserId).Limit(1).Find(&userPush)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			// 初始化一个 UserPush
			userPush.NotifyType = "email"
			userPush.CreatedTime = utils.GetTimestamp()
			userPush.UpdatedTime = utils.GetTimestamp()
			userPush.SubscriptionPlans = "quota_push,sale_push,back_push,system_push,price_push"
			// 存放 quota_push={'minQuota': 1, 'email': ''}
			defaultOptions := PushPlanOptionJsonType{
				"quota_push": {
					"minQuota": 1,
					"email":    "",
				},
			}
			jsonType := datatypes.NewJSONType(defaultOptions)
			userPush.PushPlanOptions = &jsonType

			err := InsertUserPush(*userPush)
			if err != nil {
				return err
			}
			return nil
		}
		return result.Error
	}
	return nil
}

// 插入一条 UserPush
func InsertUserPush(userPush UserPush) (err error) {
	err = DB.Model(&UserPush{}).Create(&userPush).Error
	return err
}

// 更改 UserPush
func UpdateUserPush(userId int, userPush UserPush) (err error) {
	err = DB.Model(&UserPush{}).Where("user_id = ?", userId).Updates(&userPush).Error
	return err
}
