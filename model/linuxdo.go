package model

import (
	"fmt"
	"one-api/common"
	"one-api/common/config"
	"one-api/common/utils"
)

// QuotaForNewLinuxDoUser 为新注册的 LinuxDo 用户赠送奖励
func (user User) QuotaForNewLinuxDoUser() {
	var bonusMultiplier float64

	switch {
	case user.LinuxDoLevel == 0:
		bonusMultiplier = 0.1
	case user.LinuxDoLevel == 1:
		bonusMultiplier = 0.25
	case user.LinuxDoLevel == 2:
		bonusMultiplier = 0.5
	case user.LinuxDoLevel == 3:
		bonusMultiplier = 1
	default:
		bonusMultiplier = float64(user.LinuxDoLevel) - 1
	}

	quota := int(float64(config.QuotaPerUnit) * bonusMultiplier)
	if err := IncreaseUserQuota(user.Id, quota); err != nil {
		return
	}

	RecordLog(user.Id, LogTypeSystem, fmt.Sprintf("linux do %v级用户注册, 赠送 %s", user.LinuxDoLevel, common.LogQuota(quota)), utils.GetIp())
}
