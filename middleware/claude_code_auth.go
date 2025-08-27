package middleware

import (
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"one-api/common/config"
	"one-api/model"
	"strings"

	"github.com/gin-gonic/gin"
)

// Claude Code 认证中间件
func ClaudeCodeAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 获取API Key
		apiKey := c.GetHeader("Authorization")
		if apiKey == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "缺少认证信息",
				"code":  "MISSING_API_KEY",
			})
			c.Abort()
			return
		}

		// 移除Bearer前缀
		if strings.HasPrefix(apiKey, "Bearer ") {
			apiKey = strings.TrimPrefix(apiKey, "Bearer ")
		}

		// 验证API Key格式
		if !strings.HasPrefix(apiKey, "cc-sk-") {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "无效的API Key格式",
				"code":  "INVALID_API_KEY_FORMAT",
			})
			c.Abort()
			return
		}

		// 验证API Key
		keyModel, subscription, err := model.ValidateClaudeCodeAPIKey(apiKey)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": err.Error(),
				"code":  "INVALID_API_KEY",
			})
			c.Abort()
			return
		}

		// 检查订阅状态
		if !subscription.CanUseService() {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "订阅已过期或已达到使用限制",
				"code":  "SUBSCRIPTION_LIMIT_EXCEEDED",
			})
			c.Abort()
			return
		}

		// 客户端验证
		if err := validateClient(c, subscription); err != nil {
			c.JSON(http.StatusForbidden, gin.H{
				"error": err.Error(),
				"code":  "CLIENT_VALIDATION_FAILED",
			})
			c.Abort()
			return
		}

		// 将认证信息存储到上下文
		c.Set("api_key_model", keyModel)
		c.Set("subscription", subscription)
		c.Set("user_id", subscription.UserId)

		c.Next()
	}
}

// 验证客户端信息
func validateClient(c *gin.Context, subscription *model.ClaudeCodeSubscription) error {
	// 1. 验证User-Agent
	userAgent := c.GetHeader("User-Agent")
	if !strings.Contains(userAgent, "Claude-Code-Client") {
		return errors.New("只允许Claude Code客户端访问")
	}

	// 2. 验证客户端指纹
	clientInfoHeader := c.GetHeader("X-Client-Info")
	if clientInfoHeader == "" {
		return errors.New("缺少客户端验证信息")
	}

	var clientInfo model.ClientFingerprint
	if err := json.Unmarshal([]byte(clientInfoHeader), &clientInfo); err != nil {
		return errors.New("无效的客户端信息格式")
	}

	// 验证客户端信息完整性
	if clientInfo.MachineId == "" || clientInfo.Platform == "" ||
		clientInfo.ProcessName == "" || clientInfo.Version == "" {
		return errors.New("客户端信息不完整")
	}

	// 3. 验证进程名称（防止非法客户端）
	allowedProcessNames := []string{
		"claude-code",
		"claude-code.exe",
		"Claude Code",
		"Claude Code.exe",
	}

	isValidProcess := false
	for _, validName := range allowedProcessNames {
		if strings.Contains(clientInfo.ProcessName, validName) {
			isValidProcess = true
			break
		}
	}

	if !isValidProcess {
		return errors.New("无效的客户端进程")
	}

	// 4. 生成并验证客户端指纹
	fingerprint := model.GenerateClientFingerprint(clientInfo)
	if err := subscription.ValidateClientFingerprint(fingerprint); err != nil {
		return err
	}

	// 5. 验证请求来源（防止浏览器调用）
	referer := c.GetHeader("Referer")
	if referer != "" && (strings.Contains(referer, "http://") || strings.Contains(referer, "https://")) {
		return errors.New("不允许从网页端访问")
	}

	// 6. 验证特殊头部（客户端会设置的特殊标识）
	clientSecret := c.GetHeader("X-Client-Secret")
	expectedSecret := generateClientSecret(clientInfo, subscription.UserId)
	if clientSecret != expectedSecret {
		return errors.New("客户端验证密钥错误")
	}

	return nil
}

// 生成客户端密钥（基于客户端信息和用户ID）
func generateClientSecret(clientInfo model.ClientFingerprint, userId int) string {
	data := fmt.Sprintf("%s-%s-%d-%s",
		clientInfo.MachineId,
		clientInfo.ProcessName,
		userId,
		"claude-code-secret")

	return getMD5Hash(data)[:16] // 取前16位作为密钥
}

// MD5哈希函数
func getMD5Hash(text string) string {
	hash := md5.Sum([]byte(text))
	return hex.EncodeToString(hash[:])
}

// 验证请求频率（防止滥用）
func ClaudeCodeRateLimit() gin.HandlerFunc {
	return func(c *gin.Context) {
		subscription, exists := c.Get("subscription")
		if !exists {
			c.Next()
			return
		}

		sub := subscription.(*model.ClaudeCodeSubscription)

		// 检查本月使用量
		if sub.UsedRequestsThisMonth >= sub.MaxRequestsPerMonth {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error": "本月使用量已达上限",
				"code":  "MONTHLY_LIMIT_EXCEEDED",
				"limit": sub.MaxRequestsPerMonth,
				"used":  sub.UsedRequestsThisMonth,
			})
			c.Abort()
			return
		}

		// 可以在这里添加更细粒度的频率限制
		// 例如：每分钟最多10次请求

		c.Next()
	}
}

// 管理员权限验证
func ClaudeCodeAdminAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		userId := c.GetInt("id")
		if userId == 0 {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"message": "请先登录",
			})
			c.Abort()
			return
		}

		role := c.GetInt("role")
		if role < config.RoleAdminUser {
			c.JSON(http.StatusForbidden, gin.H{
				"success": false,
				"message": "权限不足",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
