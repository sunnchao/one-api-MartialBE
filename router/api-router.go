package router

import (
	"one-api/controller"
	"one-api/middleware"
	"one-api/relay"

	"github.com/gin-contrib/gzip"
	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func SetApiRouter(router *gin.Engine) {
	apiRouter := router.Group("/api")
	apiRouter.GET("/metrics", middleware.MetricsWithBasicAuth(), gin.WrapH(promhttp.Handler()))
	apiRouter.Use(gzip.Gzip(gzip.DefaultCompression))

	systemInfo := apiRouter.Group("/system_info")
	systemInfo.Use(middleware.RootAuth())
	{
		systemInfo.POST("/log", controller.SystemLog)
	}

	apiRouter.POST("/telegram/:token", middleware.Telegram(), controller.TelegramBotWebHook)
	apiRouter.Use(middleware.GlobalAPIRateLimit())
	{
		apiRouter.GET("/image/:id", controller.CheckImg)
		apiRouter.GET("/status", controller.GetStatus)
		apiRouter.GET("/notice", controller.GetNotice)
		apiRouter.GET("/about", controller.GetAbout)
		apiRouter.GET("/prices", middleware.PricesAuth(), middleware.CORS(), controller.GetPricesList)
		apiRouter.GET("/ownedby", relay.GetModelOwnedBy)
		apiRouter.GET("/available_model", middleware.CORS(), middleware.TrySetUserBySession(), relay.AvailableModel)
		apiRouter.GET("/user_group_map", middleware.TrySetUserBySession(), controller.GetUserGroupRatio)
		apiRouter.GET("/user_group_map_by_admin", middleware.AdminAuth(), controller.GetUserGroupRatioByAdmin)
		apiRouter.GET("/home_page_content", controller.GetHomePageContent)
		apiRouter.GET("/verification", middleware.CriticalRateLimit(), middleware.TurnstileCheck(), controller.SendEmailVerification)
		apiRouter.GET("/reset_password", middleware.CriticalRateLimit(), middleware.TurnstileCheck(), controller.SendPasswordResetEmail)
		apiRouter.POST("/user/reset", middleware.CriticalRateLimit(), controller.ResetPassword)
		apiRouter.GET("/oauth/github", middleware.CriticalRateLimit(), controller.GitHubOAuth)
		apiRouter.GET("/oauth/lark", middleware.CriticalRateLimit(), controller.LarkOAuth)
		apiRouter.GET("/oauth/state", middleware.CriticalRateLimit(), controller.GenerateOAuthCode)
		apiRouter.GET("/oauth/wechat", middleware.CriticalRateLimit(), controller.WeChatAuth)
		apiRouter.GET("/oauth/wechat/bind", middleware.CriticalRateLimit(), middleware.UserAuth(), controller.WeChatBind)
		apiRouter.GET("/oauth/email/bind", middleware.CriticalRateLimit(), middleware.UserAuth(), controller.EmailBind)
		apiRouter.GET("/oauth/linuxdo", middleware.CriticalRateLimit(), controller.LinuxDoOAuth)
		apiRouter.GET("/oauth/endpoint", middleware.CriticalRateLimit(), controller.OIDCEndpoint)
		apiRouter.GET("/oauth/oidc", middleware.CriticalRateLimit(), controller.OIDCAuth)

		webauthnGroup := apiRouter.Group("/webauthn")
		{
			// 注册相关
			webauthnGroup.POST("/registration/begin", middleware.UserAuth(), controller.WebauthnBeginRegistration)
			webauthnGroup.POST("/registration/finish", middleware.UserAuth(), controller.WebauthnFinishRegistration)

			// 登录相关
			webauthnGroup.POST("/login/begin", middleware.CriticalRateLimit(), controller.WebauthnBeginLogin)
			webauthnGroup.POST("/login/finish", middleware.CriticalRateLimit(), controller.WebauthnFinishLogin)

			// 凭据管理
			webauthnGroup.GET("/credentials", middleware.UserAuth(), controller.GetUserWebAuthnCredentials)
			webauthnGroup.DELETE("/credentials/:id", middleware.UserAuth(), controller.DeleteWebAuthnCredential)
		}

		apiRouter.Any("/payment/notify/:uuid", controller.PaymentCallback)
		apiRouter.GET("/epay/notify", controller.EpayCallback)
		apiRouter.Any("/payment/packages/notify", controller.ClaudeCodePaymentNotify)

		userRoute := apiRouter.Group("/user")
		{
			userRoute.POST("/register", middleware.CriticalRateLimit(), middleware.TurnstileCheck(), controller.Register)
			userRoute.POST("/login", middleware.CriticalRateLimit(), middleware.TurnstileCheck(), controller.Login)
			userRoute.GET("/logout", controller.Logout)

			selfRoute := userRoute.Group("/")
			selfRoute.Use(middleware.UserAuth())
			{
				selfRoute.GET("/dashboard", controller.GetUserDashboard)
				selfRoute.GET("/dashboard/rate", controller.GetRateRealtime)
				selfRoute.GET("/dashboard/uptimekuma/status-page", controller.UptimeKumaStatusPage)
				selfRoute.GET("/dashboard/uptimekuma/status-page/heartbeat", controller.UptimeKumaStatusPageHeartbeat)
				selfRoute.GET("/invoice", controller.GetUserInvoice)
				selfRoute.GET("/invoice/detail", controller.GetUserInvoiceDetail)
				selfRoute.GET("/self", controller.GetSelf)
				selfRoute.PUT("/self", controller.UpdateSelf)
				selfRoute.POST("/unbind", controller.Unbind)
				// selfRoute.DELETE("/self", controller.DeleteSelf)
				selfRoute.GET("/token", controller.GenerateAccessToken)
				selfRoute.GET("/aff", controller.GetAffCode)
				selfRoute.POST("/topup", controller.TopUp)
				selfRoute.GET("/payment", controller.GetUserPaymentList)
				selfRoute.POST("/order", controller.CreateOrder)
				selfRoute.GET("/order/status", controller.CheckOrderStatus)
				selfRoute.GET("/checkin/list", controller.UserOperationCheckInList)
				selfRoute.POST("/checkin", middleware.TurnstileCheck(), controller.UserOperationCheckIn)
				selfRoute.GET("/notifications", controller.GetUserNotifications)
				selfRoute.PUT("/notifications", controller.UpdateUserNotifications)

				// 优惠券相关路由
				selfRoute.GET("/coupons", controller.GetUserCoupons)
				selfRoute.GET("/coupons/available", controller.GetAvailableCoupons)
				selfRoute.GET("/coupons/validate", controller.ValidateCoupon)
				selfRoute.POST("/coupons/apply", controller.ApplyCoupon)

			}

      packagesRoute := userRoute.Group("/packages");
      packagesRoute.Use(middleware.UserAuth())
			{
				// 订阅管理
        packagesRoute.GET("/plans", controller.GetClaudeCodePlans)
        packagesRoute.GET("/subscription", controller.GetClaudeCodeSubscription)
        packagesRoute.POST("/purchase", controller.PurchaseClaudeCodeSubscription)
        packagesRoute.POST("/cancel", controller.CancelClaudeCodeSubscription)
        packagesRoute.GET("/usage-stats", controller.GetClaudeCodeUsageStats)

				// API Key 管理
        packagesRoute.GET("/api-keys", controller.GetClaudeCodeAPIKeys)
        packagesRoute.POST("/api-keys", controller.CreateClaudeCodeAPIKey)
        packagesRoute.DELETE("/api-keys/:id", controller.DeleteClaudeCodeAPIKey)
			}

			adminRoute := userRoute.Group("/")
			adminRoute.Use(middleware.AdminAuth())
			{
				adminRoute.GET("/", controller.GetUsersList)
				adminRoute.GET("/:id", controller.GetUser)
				adminRoute.POST("/", controller.CreateUser)
				adminRoute.POST("/manage", controller.ManageUser)
				adminRoute.POST("/quota/:id", controller.ChangeUserQuota)
				adminRoute.PUT("/", controller.UpdateUser)
				adminRoute.DELETE("/:id", controller.DeleteUser)
				adminRoute.GET("/token/:userId", controller.GetUserTokensListByUserId)
			}
		}
		optionRoute := apiRouter.Group("/option")
		optionRoute.Use(middleware.RootAuth())
		{
			optionRoute.GET("/", controller.GetOptions)
			optionRoute.PUT("/", controller.UpdateOption)
			optionRoute.GET("/telegram", controller.GetTelegramMenuList)
			optionRoute.POST("/telegram", controller.AddOrUpdateTelegramMenu)
			optionRoute.GET("/telegram/status", controller.GetTelegramBotStatus)
			optionRoute.PUT("/telegram/reload", controller.ReloadTelegramBot)
			optionRoute.GET("/telegram/:id", controller.GetTelegramMenu)
			optionRoute.DELETE("/telegram/:id", controller.DeleteTelegramMenu)
			optionRoute.GET("/safe_tools", controller.GetSafeTools)
			optionRoute.POST("/invoice/gen/:time", controller.GenInvoice)
			optionRoute.POST("/invoice/update/:time", controller.UpdateInvoice)
			optionRoute.POST("/system_info/log", controller.SystemLog)
		}

		modelOwnedByRoute := apiRouter.Group("/model_ownedby")
		modelOwnedByRoute.GET("/", controller.GetAllModelOwnedBy)
		modelOwnedByRoute.Use(middleware.AdminAuth())
		{
			modelOwnedByRoute.GET("/:id", controller.GetModelOwnedBy)
			modelOwnedByRoute.POST("/", controller.CreateModelOwnedBy)
			modelOwnedByRoute.PUT("/", controller.UpdateModelOwnedBy)
			modelOwnedByRoute.DELETE("/:id", controller.DeleteModelOwnedBy)
		}

		modelInfoRoute := apiRouter.Group("/model_info")
		modelInfoRoute.GET("/", controller.GetAllModelInfo)
		modelInfoRoute.Use(middleware.AdminAuth())
		{
			modelInfoRoute.GET("/:id", controller.GetModelInfo)
			modelInfoRoute.POST("/", controller.CreateModelInfo)
			modelInfoRoute.PUT("/", controller.UpdateModelInfo)
			modelInfoRoute.DELETE("/:id", controller.DeleteModelInfo)
		}

		userGroup := apiRouter.Group("/user_group")
		userGroup.Use(middleware.AdminAuth())
		{
			userGroup.GET("/", controller.GetUserGroups)
			userGroup.GET("/:id", controller.GetUserGroupById)
			userGroup.POST("/", controller.AddUserGroup)
			userGroup.PUT("/enable/:id", controller.ChangeUserGroupEnable)
			userGroup.PUT("/", controller.UpdateUserGroup)
			userGroup.DELETE("/:id", controller.DeleteUserGroup)

		}
		channelRoute := apiRouter.Group("/channel")
		channelRoute.Use(middleware.AdminAuth())
		{
			channelRoute.GET("/", controller.GetChannelsList)
			channelRoute.GET("/models", relay.ListModelsForAdmin)
			channelRoute.POST("/provider_models_list", controller.GetModelList)
			channelRoute.GET("/:id", controller.GetChannel)
			channelRoute.GET("/test", controller.TestAllChannels)
			channelRoute.GET("/test/:id", controller.TestChannel)
			channelRoute.GET("/update_balance", controller.UpdateAllChannelsBalance)
			channelRoute.GET("/update_balance/:id", controller.UpdateChannelBalance)
			channelRoute.POST("/", controller.AddChannel)
			channelRoute.PUT("/", controller.UpdateChannel)
			channelRoute.PUT("/batch/azure_api", controller.BatchUpdateChannelsAzureApi)
			channelRoute.PUT("/batch/del_model", controller.BatchDelModelChannels)
			channelRoute.DELETE("/disabled", controller.DeleteDisabledChannel)
			channelRoute.DELETE("/:id/tag", controller.DeleteChannelTag)
			channelRoute.DELETE("/:id", controller.DeleteChannel)
			channelRoute.DELETE("/batch", controller.BatchDeleteChannel)
			// channelRoute.GET("/:id/keys", controller.GetChannelKeys)
			// channelRoute.POST("/key/:id/enable", controller.EnableChannelKey)
			// channelRoute.POST("/key/:id/disable", controller.DisableChannelKey)
			// channelRoute.POST("/key/:id/reset", controller.ResetChannelKeyErrors)
		}

		// GeminiCli OAuth routes (no auth required for callback)
		geminiCliRoute := apiRouter.Group("/geminicli")
		{
			geminiCliRoute.POST("/oauth/start", middleware.AdminAuth(), controller.StartGeminiCliOAuth)
			geminiCliRoute.GET("/oauth/callback", controller.GeminiCliOAuthCallback)
			geminiCliRoute.GET("/oauth/status/:state", middleware.AdminAuth(), controller.GetGeminiCliOAuthStatus)
		}

		// ClaudeCode OAuth routes
		claudCodeRoute := apiRouter.Group("/claudecode")
    claudCodeRoute.Use(middleware.AdminAuth())
		{
      claudCodeRoute.POST("/oauth/start", controller.StartClaudeCodeOAuth)
      claudCodeRoute.POST("/oauth/exchange-code", controller.ClaudeCodeOAuthCallback)
		}

		// Codex OAuth routes
		codexRoute := apiRouter.Group("/codex")
		codexRoute.Use(middleware.AdminAuth())
		{
			codexRoute.POST("/oauth/start", controller.StartCodexOAuth)
			codexRoute.POST("/oauth/exchange-code", controller.CodexOAuthCallback)
		}

		// Antigravity OAuth routes
		antigravityRoute := apiRouter.Group("/antigravity")
		{
			antigravityRoute.POST("/oauth/start", middleware.AdminAuth(), controller.StartAntigravityOAuth)
			antigravityRoute.GET("/oauth/callback", controller.AntigravityOAuthCallback)
			antigravityRoute.GET("/oauth/status/:state", middleware.AdminAuth(), controller.GetAntigravityOAuthStatus)
		}
		channelTagRoute := apiRouter.Group("/channel_tag")
		channelTagRoute.Use(middleware.AdminAuth())
		{
			channelTagRoute.GET("/_all", controller.GetChannelsTagAllList)
			channelTagRoute.GET("/:tag/list", controller.GetChannelsTagList)
			channelTagRoute.GET("/:tag", controller.GetChannelsTag)
			channelTagRoute.PUT("/:tag", controller.UpdateChannelsTag)
			channelTagRoute.DELETE("/:tag", controller.DeleteChannelsTag)
			channelTagRoute.DELETE("/:tag/disabled", controller.DeleteDisabledChannelsTag)
			channelTagRoute.PUT("/:tag/priority", controller.UpdateChannelsTagPriority)
			channelTagRoute.PUT("/:tag/status/:status", controller.ChangeChannelsTagStatus)

		}

		tokenRoute := apiRouter.Group("/token")
		tokenRoute.Use(middleware.UserAuth())
		{
			tokenRoute.GET("/playground", controller.GetPlaygroundToken)
			tokenRoute.GET("/", controller.GetUserTokensList)
			tokenRoute.GET("/:id", controller.GetToken)
			tokenRoute.POST("/", controller.AddToken)
			tokenRoute.PUT("/", controller.UpdateToken)
			tokenRoute.DELETE("/:id", controller.DeleteToken)
		}
		redemptionRoute := apiRouter.Group("/redemption")
		redemptionRoute.Use(middleware.AdminAuth())
		{
			redemptionRoute.GET("/", controller.GetRedemptionsList)
			redemptionRoute.GET("/:id", controller.GetRedemption)
			redemptionRoute.POST("/", controller.AddRedemption)
			redemptionRoute.PUT("/", controller.UpdateRedemption)
			redemptionRoute.DELETE("/:id", controller.DeleteRedemption)
		}
		logRoute := apiRouter.Group("/log")
		logRoute.GET("/", middleware.AdminAuth(), controller.GetLogsList)
		logRoute.DELETE("/", middleware.AdminAuth(), controller.DeleteHistoryLogs)
		// logRoute.GET("/stat", middleware.AdminAuth(), controller.GetLogsStat)
		// logRoute.GET("/self/stat", middleware.UserAuth(), controller.GetLogsSelfStat)
		// logRoute.GET("/search", middleware.AdminAuth(), controller.SearchAllLogs)
		logRoute.GET("/self", middleware.UserAuth(), controller.GetUserLogsList)
		// logRoute.GET("/self/search", middleware.UserAuth(), controller.SearchUserLogs)
		groupRoute := apiRouter.Group("/group")
		groupRoute.Use(middleware.AdminAuth())
		{
			groupRoute.GET("/", controller.GetGroups)
		}

		analyticsRoute := apiRouter.Group("/analytics")
		analyticsRoute.Use(middleware.AdminAuth())
		{
			analyticsRoute.GET("/statistics", controller.GetStatisticsDetail)
			analyticsRoute.GET("/period", controller.GetStatisticsByPeriod)
			analyticsRoute.GET("/multi_user_stats", controller.GetMultiUserStatistics)
			analyticsRoute.GET("/multi_user_stats/export", controller.ExportMultiUserStatisticsCSV)
		}
		pricesRoute := apiRouter.Group("/prices")
		pricesRoute.Use(middleware.AdminAuth())
		{
			pricesRoute.GET("/model_list", controller.GetAllModelList)
			pricesRoute.POST("/single", controller.AddPrice)
			pricesRoute.PUT("/single/*model", controller.UpdatePrice)
			pricesRoute.DELETE("/single/*model", controller.DeletePrice)
			pricesRoute.POST("/multiple", controller.BatchSetPrices)
			pricesRoute.PUT("/multiple/delete", controller.BatchDeletePrices)
			pricesRoute.POST("/sync", controller.SyncPricing)
			pricesRoute.GET("/updateService", controller.GetUpdatePriceService)

		}

		paymentRoute := apiRouter.Group("/payment")
		paymentRoute.Use(middleware.AdminAuth())
		{
			paymentRoute.GET("/order", controller.GetOrderList)
			paymentRoute.GET("/", controller.GetPaymentList)
			paymentRoute.GET("/:id", controller.GetPayment)
			paymentRoute.POST("/", controller.AddPayment)
			paymentRoute.PUT("/", controller.UpdatePayment)
			paymentRoute.DELETE("/:id", controller.DeletePayment)
		}

		mjRoute := apiRouter.Group("/mj")
		mjRoute.GET("/self", middleware.UserAuth(), controller.GetUserMidjourney)
		mjRoute.GET("/", middleware.AdminAuth(), controller.GetAllMidjourney)

		taskRoute := apiRouter.Group("/task")
		taskRoute.GET("/self", middleware.UserAuth(), controller.GetUserAllTask)
		taskRoute.GET("/", middleware.AdminAuth(), controller.GetAllTask)

		// 优惠券管理路由
		couponRoute := apiRouter.Group("/coupon")
		{
			// 公开接口
			couponRoute.GET("/checkin_rewards", controller.GetCheckinRewards)

			// 管理员接口
			adminCouponRoute := couponRoute.Group("/admin")
			adminCouponRoute.Use(middleware.AdminAuth())
			{
				// 优惠券模板管理
				adminCouponRoute.GET("/templates", controller.GetCouponTemplates)
				adminCouponRoute.POST("/templates", controller.CreateCouponTemplate)
				adminCouponRoute.PUT("/templates/:id", controller.UpdateCouponTemplate)
				adminCouponRoute.DELETE("/templates/:id", controller.DeleteCouponTemplate)
				adminCouponRoute.POST("/batch_issue", controller.BatchIssueCoupons)

				// 签到奖励配置管理
				adminCouponRoute.POST("/checkin_rewards", controller.CreateCheckinReward)
				adminCouponRoute.PUT("/checkin_rewards/:id", controller.UpdateCheckinReward)
			}
		}
	}

	sseRouter := router.Group("/api/sse")
	sseRouter.Use(middleware.GlobalAPIRateLimit())
	{
		sseRouter.POST("/channel/check", middleware.AdminAuth(), controller.CheckChannel)
	}

	// Claude Code管理员路由
	claudeCodeAdminRouter := router.Group("/api/packages-admin")
	claudeCodeAdminRouter.Use(middleware.AdminAuth()) // 使用普通管理员权限
	{
		// 订阅管理
		claudeCodeAdminRouter.GET("/subscriptions", controller.GetAllClaudeCodeSubscriptions)
		claudeCodeAdminRouter.GET("/users/search", controller.AdminSearchUsers)
		claudeCodeAdminRouter.POST("/grant-subscription", controller.AdminGrantClaudeCodeSubscription)
		claudeCodeAdminRouter.DELETE("/subscriptions/:id", controller.AdminCancelClaudeCodeSubscription)

		// 套餐管理
		claudeCodeAdminRouter.GET("/plans", controller.GetClaudeCodePlans)
		claudeCodeAdminRouter.GET("/plans/:id", controller.GetClaudeCodePlanById)
		claudeCodeAdminRouter.POST("/plans", controller.CreateClaudeCodePlan)
		claudeCodeAdminRouter.PUT("/plans/:id", controller.UpdateClaudeCodePlan)
		claudeCodeAdminRouter.DELETE("/plans/:id", controller.DeleteClaudeCodePlan)
	}

}
