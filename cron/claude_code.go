package cron

import (
	"fmt"
	"one-api/common/logger"
	"one-api/model"
	"time"

	"github.com/robfig/cron/v3"
)

// 初始化Claude Code相关的定时任务
func InitClaudeCodeCron(c *cron.Cron) {
	// 每小时检查一次过期订阅
	_, err := c.AddFunc("0 * * * *", CheckExpiredSubscriptions)
	if err != nil {
		logger.SysError("添加Claude Code过期订阅检查任务失败: " + err.Error())
	} else {
		logger.SysLog("Claude Code过期订阅检查任务已添加")
	}

	// 每月1号重置使用量
	_, err = c.AddFunc("0 0 1 * *", ResetMonthlyUsage)
	if err != nil {
		logger.SysError("添加Claude Code月度使用量重置任务失败: " + err.Error())
	} else {
		logger.SysLog("Claude Code月度使用量重置任务已添加")
	}

	// 每天检查即将到期的订阅，发送提醒
	_, err = c.AddFunc("0 9 * * *", CheckExpiringSubscriptions)
	if err != nil {
		logger.SysError("添加Claude Code到期提醒任务失败: " + err.Error())
	} else {
		logger.SysLog("Claude Code到期提醒任务已添加")
	}
}

// 检查过期订阅
func CheckExpiredSubscriptions() {
	logger.SysLog("开始检查Claude Code过期订阅")

	if err := model.CheckExpiredClaudeCodeSubscriptions(); err != nil {
		logger.SysError("检查Claude Code过期订阅失败: " + err.Error())
	} else {
		logger.SysLog("Claude Code过期订阅检查完成")
	}
}

// 重置月度使用量
func ResetMonthlyUsage() {
	logger.SysLog("开始重置Claude Code月度使用量")

	if err := model.ResetMonthlyClaudeCodeUsage(); err != nil {
		logger.SysError("重置Claude Code月度使用量失败: " + err.Error())
	} else {
		logger.SysLog("Claude Code月度使用量重置完成")
	}
}

// 检查即将到期的订阅
func CheckExpiringSubscriptions() {
	logger.SysLog("开始检查Claude Code即将到期的订阅")

	// 查找7天内到期的订阅
	sevenDaysLater := time.Now().AddDate(0, 0, 7).Unix()
	threeDaysLater := time.Now().AddDate(0, 0, 3).Unix()
	oneDayLater := time.Now().AddDate(0, 0, 1).Unix()

	// 7天内到期提醒
	var subscriptions7Days []model.ClaudeCodeSubscription
	if err := model.DB.Where("status = 'active' AND end_time <= ? AND end_time > ?",
		sevenDaysLater, threeDaysLater).Find(&subscriptions7Days).Error; err == nil {

		for _, sub := range subscriptions7Days {
			sendExpirationNotice(&sub, 7)
		}
	}

	// 3天内到期提醒
	var subscriptions3Days []model.ClaudeCodeSubscription
	if err := model.DB.Where("status = 'active' AND end_time <= ? AND end_time > ?",
		threeDaysLater, oneDayLater).Find(&subscriptions3Days).Error; err == nil {

		for _, sub := range subscriptions3Days {
			sendExpirationNotice(&sub, 3)
		}
	}

	// 1天内到期提醒
	var subscriptions1Day []model.ClaudeCodeSubscription
	if err := model.DB.Where("status = 'active' AND end_time <= ?",
		oneDayLater).Find(&subscriptions1Day).Error; err == nil {

		for _, sub := range subscriptions1Day {
			sendExpirationNotice(&sub, 1)
		}
	}

	logger.SysLog("Claude Code即将到期订阅检查完成")
}

// 发送到期提醒
func sendExpirationNotice(subscription *model.ClaudeCodeSubscription, daysLeft int) {
	// 获取用户信息
	user, err := model.GetUserById(subscription.UserId, false)
	if err != nil {
		logger.SysError("获取用户信息失败: " + err.Error())
		return
	}

	// 这里可以集成现有的通知系统发送邮件或其他通知
	// 例如通过邮件、Telegram等方式通知用户
	logger.SysLog(fmt.Sprintf("用户 %s 的Claude Code订阅将在 %d 天后到期", user.Username, daysLeft))

	// TODO: 集成通知系统发送实际通知
	// 例如：
	// notify.SendEmailNotification(user.Email, "Claude Code订阅即将到期",
	//     fmt.Sprintf("您的%s订阅将在%d天后到期，请及时续费", subscription.PlanType, daysLeft))
}
