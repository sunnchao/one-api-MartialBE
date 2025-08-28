package controller

import (
	"net/http"
	"one-api/common/config"
	"one-api/common/logger"
	"one-api/model"
	"strconv"

	"github.com/gin-gonic/gin"
)

// 获取用户优惠券列表
func GetUserCoupons(c *gin.Context) {
	userId := c.GetInt("id")
	if userId == 0 {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "请先登录",
			"data":    nil,
		})
		return
	}

	// 获取状态参数
	statusStr := c.Query("status")
	status := 0
	if statusStr != "" {
		status, _ = strconv.Atoi(statusStr)
	}

	coupons, err := model.GetUserCoupons(userId, status)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "获取优惠券失败",
			"data":    nil,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    coupons,
	})
}

// 获取可用优惠券（用于下单时选择）
func GetAvailableCoupons(c *gin.Context) {
	userId := c.GetInt("id")
	if userId == 0 {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "请先登录",
			"data":    nil,
		})
		return
	}

	amountStr := c.Query("amount")
	amount, err := strconv.ParseFloat(amountStr, 64)
	if err != nil || amount <= 0 {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "请提供有效的金额",
			"data":    nil,
		})
		return
	}

	coupons, err := model.GetAvailableCouponsForAmount(userId, amount)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "获取可用优惠券失败",
			"data":    nil,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    coupons,
	})
}

// 使用优惠券（内部接口，用于订单系统调用）
func ApplyCoupon(c *gin.Context) {
	userId := c.GetInt("id")
	if userId == 0 {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "请先登录",
			"data":    nil,
		})
		return
	}

	var request struct {
		CouponCode  string  `json:"coupon_code" binding:"required"`
		OrderAmount float64 `json:"order_amount" binding:"required"`
		OrderId     string  `json:"order_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "参数错误",
			"data":    nil,
		})
		return
	}

	coupon, discountAmount, err := model.UseCoupon(request.CouponCode, userId, request.OrderAmount, request.OrderId)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": err.Error(),
			"data":    nil,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "优惠券使用成功",
		"data": gin.H{
			"coupon":          coupon,
			"discount_amount": discountAmount,
			"final_amount":    request.OrderAmount - discountAmount,
		},
	})
}

// 验证优惠券（用于前端实时验证）
func ValidateCoupon(c *gin.Context) {
	userId := c.GetInt("id")
	if userId == 0 {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "请先登录",
			"data":    nil,
		})
		return
	}

	code := c.Query("code")
	amountStr := c.Query("amount")

	if code == "" || amountStr == "" {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "参数不完整",
			"data":    nil,
		})
		return
	}

	amount, err := strconv.ParseFloat(amountStr, 64)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "金额格式错误",
			"data":    nil,
		})
		return
	}

	coupon, err := model.GetUserCouponByCode(code)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "优惠券不存在",
			"data":    nil,
		})
		return
	}

	if coupon.UserId != userId {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "这不是你的优惠券",
			"data":    nil,
		})
		return
	}

	if coupon.Status != model.CouponStatusUnused {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "优惠券已使用或已过期",
			"data":    nil,
		})
		return
	}

	if amount < coupon.MinAmount {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "订单金额不足",
			"data":    nil,
		})
		return
	}

	// 计算预期折扣
	var discountAmount float64
	switch coupon.Type {
	case model.CouponTypePercentage:
		discountAmount = amount * (coupon.Value / 100)
		if coupon.MaxDiscount > 0 && discountAmount > coupon.MaxDiscount {
			discountAmount = coupon.MaxDiscount
		}
	case model.CouponTypeFixed:
		discountAmount = coupon.Value
		if discountAmount > amount {
			discountAmount = amount
		}
	case model.CouponTypeRecharge:
		discountAmount = coupon.Value
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "优惠券可用",
		"data": gin.H{
			"coupon":          coupon,
			"discount_amount": discountAmount,
			"final_amount":    amount - discountAmount,
		},
	})
}

// 管理员接口：获取所有优惠券模板
func GetCouponTemplates(c *gin.Context) {
	role := c.GetInt("role")
	if role < config.RoleAdminUser {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "无权限",
			"data":    nil,
		})
		return
	}

	templates, err := model.GetCouponTemplates()
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "获取失败",
			"data":    nil,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    templates,
	})
}

// 管理员接口：创建优惠券模板
func CreateCouponTemplate(c *gin.Context) {
	role := c.GetInt("role")
	if role < config.RoleAdminUser {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "无权限",
			"data":    nil,
		})
		return
	}

	var template model.CouponTemplate
	if err := c.ShouldBindJSON(&template); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "参数错误: " + err.Error(),
			"data":    nil,
		})
		return
	}

	// 验证参数
	if template.Name == "" || template.Type == "" || template.Value <= 0 {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "参数不完整",
			"data":    nil,
		})
		return
	}

	if template.Type != model.CouponTypePercentage &&
		template.Type != model.CouponTypeFixed &&
		template.Type != model.CouponTypeRecharge {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "不支持的优惠券类型",
			"data":    nil,
		})
		return
	}

	if err := template.Create(); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "创建失败: " + err.Error(),
			"data":    nil,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "创建成功",
		"data":    template,
	})
}

// 管理员接口：更新优惠券模板
func UpdateCouponTemplate(c *gin.Context) {
	role := c.GetInt("role")
	if role < config.RoleAdminUser {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "无权限",
			"data":    nil,
		})
		return
	}

	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "无效的ID",
			"data":    nil,
		})
		return
	}

	template, err := model.GetCouponTemplateById(id)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "模板不存在",
			"data":    nil,
		})
		return
	}

	if err := c.ShouldBindJSON(template); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "参数错误: " + err.Error(),
			"data":    nil,
		})
		return
	}

	template.Id = id
	if err := template.Update(); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "更新失败: " + err.Error(),
			"data":    nil,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "更新成功",
		"data":    template,
	})
}

// 管理员接口：删除优惠券模板
func DeleteCouponTemplate(c *gin.Context) {
	role := c.GetInt("role")
	if role < config.RoleAdminUser {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "无权限",
			"data":    nil,
		})
		return
	}

	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "无效的ID",
			"data":    nil,
		})
		return
	}

	template, err := model.GetCouponTemplateById(id)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "模板不存在",
			"data":    nil,
		})
		return
	}

	if err := template.Delete(); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "删除失败: " + err.Error(),
			"data":    nil,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "删除成功",
		"data":    nil,
	})
}

// 管理员接口：批量发放优惠券
func BatchIssueCoupons(c *gin.Context) {
	role := c.GetInt("role")
	if role < config.RoleAdminUser {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "无权限",
			"data":    nil,
		})
		return
	}

	var request struct {
		TemplateId int    `json:"template_id" binding:"required"`
		UserIds    []int  `json:"user_ids" binding:"required"`
		Source     string `json:"source"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "参数错误: " + err.Error(),
			"data":    nil,
		})
		return
	}

	if request.Source == "" {
		request.Source = model.CouponSourceAdmin
	}

	var successCount, failCount int
	var failedUsers []int

	for _, userId := range request.UserIds {
		_, err := model.IssueCouponToUser(userId, request.TemplateId, request.Source)
		if err != nil {
			failCount++
			failedUsers = append(failedUsers, userId)
			logger.SysError("批量发放优惠券失败: userId=" + strconv.Itoa(userId) + ", error=" + err.Error())
		} else {
			successCount++
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "批量发放完成",
		"data": gin.H{
			"success_count": successCount,
			"fail_count":    failCount,
			"failed_users":  failedUsers,
		},
	})
}

// 获取签到奖励配置
func GetCheckinRewards(c *gin.Context) {
	rewards, err := model.GetCheckinRewards()
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "获取失败",
			"data":    nil,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    rewards,
	})
}

// 管理员接口：创建签到奖励配置
func CreateCheckinReward(c *gin.Context) {
	role := c.GetInt("role")
	if role < config.RoleAdminUser {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "无权限",
			"data":    nil,
		})
		return
	}

	var reward model.CheckinReward
	if err := c.ShouldBindJSON(&reward); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "参数错误: " + err.Error(),
			"data":    nil,
		})
		return
	}

	if err := reward.Create(); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "创建失败: " + err.Error(),
			"data":    nil,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "创建成功",
		"data":    reward,
	})
}

// 管理员接口：更新签到奖励配置
func UpdateCheckinReward(c *gin.Context) {
	role := c.GetInt("role")
	if role < config.RoleAdminUser {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "无权限",
			"data":    nil,
		})
		return
	}

	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "无效的ID",
			"data":    nil,
		})
		return
	}

	var reward model.CheckinReward
	if err := model.DB.Where("id = ?", id).First(&reward).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "配置不存在",
			"data":    nil,
		})
		return
	}

	if err := c.ShouldBindJSON(&reward); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "参数错误: " + err.Error(),
			"data":    nil,
		})
		return
	}

	reward.Id = id
	if err := reward.Update(); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"message": "更新失败: " + err.Error(),
			"data":    nil,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "更新成功",
		"data":    reward,
	})
}
