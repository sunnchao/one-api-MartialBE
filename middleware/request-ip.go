package middleware

import (
	"context"
	"github.com/gin-gonic/gin"
	"one-api/common/logger"
)

func RequestIP() func(c *gin.Context) {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		c.Set(logger.RequestIPKey, ip)
		ctx := context.WithValue(c.Request.Context(), logger.RequestIPKey, ip)
		ctx = context.WithValue(ctx, "requestIP", ip)
		c.Request = c.Request.WithContext(ctx)
		//c.Header(logger.RequestIPKey, ip)
		c.Next()
	}
}
