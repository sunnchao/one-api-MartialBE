package controller

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"sync"
	"time"

	"one-api/common"
	"one-api/common/config"
	"one-api/common/logger"
	"one-api/common/utils"
	"one-api/model"
	"one-api/payment"
	"one-api/payment/types"

	"github.com/gin-gonic/gin"
)

type OrderRequest struct {
	UUID   string `json:"uuid" binding:"required"`
	Amount int    `json:"amount" binding:"required"`
}

type OrderResponse struct {
	TradeNo string `json:"trade_no"`
	*types.PayRequest
}

// 检查是否在国庆活动期间
func isNationalDayPromoActive() bool {
	if !config.NationalDayPromoEnabled {
		return false
	}

	now := time.Now()

	// 解析配置的开始和结束时间
	startDate, err := time.Parse("2006-01-02", config.NationalDayPromoStartDate)
	if err != nil {
		return false
	}

	endDate, err := time.Parse("2006-01-02", config.NationalDayPromoEndDate)
	if err != nil {
		return false
	}

	// 设置为当天的开始和结束时间
	startDate = time.Date(startDate.Year(), startDate.Month(), startDate.Day(), 0, 0, 0, 0, time.Local)
	endDate = time.Date(endDate.Year(), endDate.Month(), endDate.Day(), 23, 59, 59, 0, time.Local)

	return now.After(startDate.Add(-time.Second)) && now.Before(endDate.Add(time.Second))
}

// 计算国庆活动的额外奖励 - 阶梯奖励
func calculateNationalDayBonus(baseQuota int) int {
	if !isNationalDayPromoActive() {
		return 0
	}

	// 将 quota 转换为美元金额进行阶梯计算
	baseAmount := int(float64(baseQuota) / config.QuotaPerUnit)

	// 阶梯奖励配置：充 10 块送 1，充 50 送 8，充 100 送 18，充 500 送 108
	var bonusAmount int
	if baseAmount >= 500 {
		bonusAmount = 108
	} else if baseAmount >= 100 {
		bonusAmount = 18
	} else if baseAmount >= 50 {
		bonusAmount = 8
	} else if baseAmount >= 10 {
		bonusAmount = 1
	} else {
		return 0 // 小于10不赠送
	}

	// 将奖励金额转换回 quota
	return int(float64(bonusAmount) * config.QuotaPerUnit)
}

// CreateOrder
func CreateOrder(c *gin.Context) {
	var orderReq OrderRequest
	if err := c.ShouldBindJSON(&orderReq); err != nil {
		common.APIRespondWithError(c, http.StatusOK, errors.New("invalid request"))

		return
	}

	if orderReq.Amount <= 0 || orderReq.Amount < config.PaymentMinAmount {
		common.APIRespondWithError(c, http.StatusOK, fmt.Errorf("金额必须大于等于 %d", config.PaymentMinAmount))

		return
	}

	userId := c.GetInt("id")
	user, err := model.GetUserById(userId, false)
	if err != nil {
		common.APIRespondWithError(c, http.StatusOK, errors.New("用户不存在"))
		return
	}

	// 关闭用户未完成的订单
	go model.CloseUnfinishedOrder()

	paymentService, err := payment.NewPaymentService(orderReq.UUID)
	if err != nil {
		common.APIRespondWithError(c, http.StatusOK, err)
		return
	}
	// 获取手续费和支付金额
	discount, fee, payMoney := calculateOrderAmount(paymentService.Payment, orderReq.Amount)
	// 开始支付
	tradeNo := utils.GenerateTradeNo()
	payRequest, err := paymentService.Pay(tradeNo, payMoney, user)
	if err != nil {
		common.APIRespondWithError(c, http.StatusOK, errors.New("创建支付失败，请稍后再试"))
		return
	}

	// 创建订单
	order := &model.Order{
		UserId:        userId,
		GatewayId:     paymentService.Payment.ID,
		TradeNo:       tradeNo,
		Amount:        orderReq.Amount,
		OrderAmount:   payMoney,
		OrderCurrency: paymentService.Payment.Currency,
		Fee:           fee,
		Discount:      discount,
		Status:        model.OrderStatusPending,
		Quota:         orderReq.Amount * int(config.QuotaPerUnit),
	}

	err = order.Insert()
	if err != nil {
		common.APIRespondWithError(c, http.StatusOK, errors.New("创建订单失败，请稍后再试"))
		return
	}

	orderResp := &OrderResponse{
		TradeNo:    tradeNo,
		PayRequest: payRequest,
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    orderResp,
	})
}

// tradeNo lock
var orderLocks sync.Map
var createLock sync.Mutex

// LockOrder 尝试对给定订单号加锁
func LockOrder(tradeNo string) {
	lock, ok := orderLocks.Load(tradeNo)
	if !ok {
		createLock.Lock()
		defer createLock.Unlock()
		lock, ok = orderLocks.Load(tradeNo)
		if !ok {
			lock = new(sync.Mutex)
			orderLocks.Store(tradeNo, lock)
		}
	}
	lock.(*sync.Mutex).Lock()
}

// UnlockOrder 释放给定订单号的锁
func UnlockOrder(tradeNo string) {
	lock, ok := orderLocks.Load(tradeNo)
	if ok {
		lock.(*sync.Mutex).Unlock()
	}
}

func PaymentCallback(c *gin.Context) {
	uuid := c.Param("uuid")
	paymentService, err := payment.NewPaymentService(uuid)
	if err != nil {
		common.APIRespondWithError(c, http.StatusOK, errors.New("payment not found"))
		return
	}

	payNotify, err := paymentService.HandleCallback(c, paymentService.Payment.Config)
	if err != nil {
		return
	}

	LockOrder(payNotify.GatewayNo)
	defer UnlockOrder(payNotify.GatewayNo)

	order, err := model.GetOrderByTradeNo(payNotify.TradeNo)
	if err != nil {
		logger.SysError(fmt.Sprintf("gateway callback failed to find order, trade_no: %s,", payNotify.TradeNo))
		return
	}
	fmt.Println(order.Status, order.Status != model.OrderStatusPending)

	if order.Status != model.OrderStatusPending {
		return
	}

	order.GatewayNo = payNotify.GatewayNo
	order.Status = model.OrderStatusSuccess
	err = order.Update()
	if err != nil {
		logger.SysError(fmt.Sprintf("gateway callback failed to update order, trade_no: %s,", payNotify.TradeNo))
		return
	}

	err = model.IncreaseUserQuota(order.UserId, order.Quota)
	if err != nil {
		logger.SysError(fmt.Sprintf("gateway callback failed to increase user quota, trade_no: %s,", payNotify.TradeNo))
		return
	}

	// 检查国庆活动期间，发放额外奖励
	nationalDayBonus := calculateNationalDayBonus(order.Quota)
	var totalActualQuota = order.Quota
	if nationalDayBonus > 0 {
		err = model.IncreaseUserQuota(order.UserId, nationalDayBonus)
		if err != nil {
			logger.SysError(fmt.Sprintf("gateway callback failed to increase national day bonus, trade_no: %s, bonus: %d", payNotify.TradeNo, nationalDayBonus))
		} else {
			totalActualQuota += nationalDayBonus
			// 记录国庆奖励日志
			model.RecordQuotaLog(order.UserId, model.LogTypeTopup, nationalDayBonus, c.ClientIP(), fmt.Sprintf("国庆活动额外奖励，基础充值: %d，奖励积分: %d", order.Quota, nationalDayBonus))
		}
	}

	// Try to upgrade user group based on cumulative recharge amount
	err = model.CheckAndUpgradeUserGroup(order.UserId, order.Quota)
	if err != nil {
		logger.SysError(fmt.Sprintf("failed to check and upgrade user group, trade_no: %s, error: %s", payNotify.TradeNo, err.Error()))
	}

	model.RecordQuotaLog(order.UserId, model.LogTypeTopup, order.Quota, c.ClientIP(), fmt.Sprintf("在线充值成功，充值积分: %d，支付金额：%.2f %s%s",
		totalActualQuota,
		order.OrderAmount,
		order.OrderCurrency,
		func() string {
			if nationalDayBonus > 0 {
				return fmt.Sprintf("，国庆活动奖励: %d", nationalDayBonus)
			}
			return ""
		}()))

}

func CheckOrderStatus(c *gin.Context) {
	tradeNo := c.Query("trade_no")
	userId := c.GetInt("id")
	success := false

	if tradeNo != "" {
		order, err := model.GetUserOrder(userId, tradeNo)
		if err == nil {
			if order.Status == model.OrderStatusSuccess {
				success = true
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": success,
		"message": "",
	})
}

// discountMoney优惠金额 fee手续费，payMoney实付金额
func calculateOrderAmount(payment *model.Payment, amount int) (discountMoney, fee, payMoney float64) {
	// 获取折扣
	discount := common.GetRechargeDiscount(strconv.Itoa(amount))
	newMoney := float64(amount) * discount // 折后价值
	oldTotal := float64(amount)            //原价值
	if payment.PercentFee > 0 {
		//手续费=（原始价值*折扣*手续费率）
		fee = utils.Decimal(newMoney*payment.PercentFee, 2) //折后手续
		oldTotal = utils.Decimal(oldTotal*(1+payment.PercentFee), 2)
	} else if payment.FixedFee > 0 {
		//固定费率不计算折扣
		fee = payment.FixedFee
	}

	//实际费用=（折后价+折后手续费）*汇率
	total := utils.Decimal(newMoney+fee, 2)
	if payment.Currency == model.CurrencyTypeUSD {
		payMoney = total
	} else {
		oldTotal = utils.Decimal(oldTotal*config.PaymentUSDRate, 2)
		payMoney = utils.Decimal(total*config.PaymentUSDRate, 2)
	}
	discountMoney = oldTotal - payMoney //折扣金额 = 原价值-实际支付价值
	return
}

func GetOrderList(c *gin.Context) {
	var params model.SearchOrderParams
	if err := c.ShouldBindQuery(&params); err != nil {
		common.APIRespondWithError(c, http.StatusOK, err)
		return
	}

	payments, err := model.GetOrderList(&params)
	if err != nil {
		common.APIRespondWithError(c, http.StatusOK, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "",
		"data":    payments,
	})
}

// EpayCallback 固定的易支付回调接口
func EpayCallback(c *gin.Context) {
	tradeNo := c.Query("out_trade_no")
	if tradeNo == "" {
		c.String(http.StatusOK, "fail")
		return
	}

	order, err := model.GetOrderByTradeNo(tradeNo)
	if err != nil {
		logger.SysError(fmt.Sprintf("epay callback failed to find order, trade_no: %s", tradeNo))
		c.String(http.StatusOK, "fail")
		return
	}

	gatewayPayment, err := model.GetPaymentByID(order.GatewayId)
	if err != nil {
		logger.SysError(fmt.Sprintf("epay callback failed to find payment, trade_no: %s, gateway_id: %d", tradeNo, order.GatewayId))
		c.String(http.StatusOK, "fail")
		return
	}

	paymentService, err := payment.NewPaymentService(gatewayPayment.UUID)
	if err != nil {
		logger.SysError(fmt.Sprintf("epay callback failed to create payment service, trade_no: %s", tradeNo))
		c.String(http.StatusOK, "fail")
		return
	}

	payNotify, err := paymentService.HandleCallback(c, paymentService.Payment.Config)
	if err != nil {
		return
	}

	LockOrder(payNotify.GatewayNo)
	defer UnlockOrder(payNotify.GatewayNo)

	if order.Status != model.OrderStatusPending {
		return
	}

	order.GatewayNo = payNotify.GatewayNo
	order.Status = model.OrderStatusSuccess
	err = order.Update()
	if err != nil {
		logger.SysError(fmt.Sprintf("epay callback failed to update order, trade_no: %s", tradeNo))
		return
	}

	err = model.IncreaseUserQuota(order.UserId, order.Quota)
	if err != nil {
		logger.SysError(fmt.Sprintf("epay callback failed to increase user quota, trade_no: %s", tradeNo))
		return
	}

	err = model.CheckAndUpgradeUserGroup(order.UserId, order.Quota)
	if err != nil {
		logger.SysError(fmt.Sprintf("epay callback failed to upgrade user group, trade_no: %s, error: %s", tradeNo, err.Error()))
	}

	model.RecordQuotaLog(order.UserId, model.LogTypeTopup, order.Quota, c.ClientIP(), fmt.Sprintf("在线充值成功，充值积分: %d，支付金额：%.2f %s", order.Quota, order.OrderAmount, order.OrderCurrency))

	if err != nil {
		logger.SysError(fmt.Sprintf("epay callback failed to process inviter reward, trade_no: %s, error: %s", tradeNo, err.Error()))
	}
}
