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
	"time"

	"github.com/gin-gonic/gin"
)

// Claude Code 认证中间件 - 基于实际Claude API请求格式
func ClaudeCodeAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. 获取Authorization头部
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			respondWithError(c, http.StatusUnauthorized, "authentication_error", "Missing Authorization header")
			return
		}

		// 2. 验证Bearer token格式
		if !strings.HasPrefix(authHeader, "Bearer ") {
			respondWithError(c, http.StatusUnauthorized, "authentication_error", "Invalid Authorization header format. Expected 'Bearer <token>'")
			return
		}

		// 3. 提取API Key
		apiKey := strings.TrimPrefix(authHeader, "Bearer ")
		if apiKey == "" {
			respondWithError(c, http.StatusUnauthorized, "authentication_error", "Missing API key in Authorization header")
			return
		}

		// 4. 验证API Key格式 (支持Claude Code格式)
		if !strings.HasPrefix(apiKey, "cc-sk-") {
			respondWithError(c, http.StatusUnauthorized, "authentication_error", "Invalid API key format. Expected format: cc-sk-...")
			return
		}

		// 5. 验证API Key有效性
		keyModel, subscription, err := model.ValidateClaudeCodeAPIKey(apiKey)
		if err != nil {
			respondWithError(c, http.StatusUnauthorized, "authentication_error", err.Error())
			return
		}

		// 6. 检查订阅状态
		if !subscription.CanUseService() {
			respondWithError(c, http.StatusForbidden, "permission_error", "Subscription expired or usage limit exceeded")
			return
		}

		// 7. 验证内容类型（Claude API通常要求application/json）
		contentType := c.GetHeader("Content-Type")
		if contentType != "" && !strings.Contains(contentType, "application/json") {
			respondWithError(c, http.StatusUnsupportedMediaType, "invalid_request_error", "Content-Type must be application/json")
			return
		}

		// 8. 验证Claude API版本（如果有）
		apiVersion := c.GetHeader("anthropic-version")
		if apiVersion != "" && !isValidAnthropicVersion(apiVersion) {
			respondWithError(c, http.StatusBadRequest, "invalid_request_error", "Unsupported anthropic-version")
			return
		}

		// 9. 基础的客户端验证（更宽松）
		if err := validateBasicClient(c, subscription); err != nil {
			respondWithError(c, http.StatusForbidden, "permission_error", err.Error())
			return
		}

		// 10. 将认证信息存储到上下文
		c.Set("api_key_model", keyModel)
		c.Set("subscription", subscription)
		c.Set("user_id", subscription.UserId)
		c.Set("api_key", apiKey)

		c.Next()
	}
}

// 响应错误的统一格式（符合Claude API错误格式）
func respondWithError(c *gin.Context, status int, errorType, message string) {
	c.JSON(status, gin.H{
		"type":    "error",
		"error": gin.H{
			"type":    errorType,
			"message": message,
		},
	})
	c.Abort()
}

// 验证anthropic-version头部
func isValidAnthropicVersion(version string) bool {
	validVersions := []string{
		"2023-06-01",
		"2023-01-01", 
		"2024-02-01",
		// 可以根据需要添加更多支持的版本
	}
	
	for _, validVersion := range validVersions {
		if version == validVersion {
			return true
		}
	}
	return false
}

// 基础客户端验证（更宽松的验证，符合实际使用场景）
func validateBasicClient(c *gin.Context, subscription *model.ClaudeCodeSubscription) error {
	// 1. 检查User-Agent是否存在（但不强制特定格式）
	userAgent := c.GetHeader("User-Agent")
	if userAgent == "" {
		return errors.New("Missing User-Agent header")
	}

	// 2. 防止明显的浏览器请求
	referer := c.GetHeader("Referer")
	origin := c.GetHeader("Origin")
	
	// 如果同时有Referer和Origin，可能是浏览器请求
	if referer != "" && origin != "" {
		return errors.New("Browser requests are not allowed")
	}

	// 3. 检查是否有可疑的浏览器特征
	if strings.Contains(strings.ToLower(userAgent), "mozilla") && 
	   strings.Contains(strings.ToLower(userAgent), "webkit") {
		return errors.New("Browser requests are not allowed")
	}

	// 4. 可选的客户端指纹验证（如果提供了X-Client-Info）
	clientInfoHeader := c.GetHeader("X-Client-Info")
	if clientInfoHeader != "" {
		var clientInfo model.ClientFingerprint
		if err := json.Unmarshal([]byte(clientInfoHeader), &clientInfo); err == nil {
			// 如果提供了客户端信息，进行指纹验证
			fingerprint := model.GenerateClientFingerprint(clientInfo)
			if err := subscription.ValidateClientFingerprint(fingerprint); err != nil {
				return err
			}
		}
	}

	return nil
}

// 原有的严格客户端验证（保留用于特殊情况）
func validateStrictClient(c *gin.Context, subscription *model.ClaudeCodeSubscription) error {
	// 1. 验证User-Agent
	userAgent := c.GetHeader("User-Agent")
	if !strings.Contains(userAgent, "claude-cli") {
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

// 验证请求频率（防止滥用）- 符合Claude API响应格式
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
			c.Header("X-RateLimit-Limit", fmt.Sprintf("%d", sub.MaxRequestsPerMonth))
			c.Header("X-RateLimit-Remaining", "0")
			c.Header("X-RateLimit-Reset", fmt.Sprintf("%d", getNextMonthReset()))
			
			c.JSON(http.StatusTooManyRequests, gin.H{
				"type": "error",
				"error": gin.H{
					"type":    "rate_limit_error",
					"message": "Monthly usage limit exceeded",
					"details": gin.H{
						"limit":     sub.MaxRequestsPerMonth,
						"used":      sub.UsedRequestsThisMonth,
						"remaining": 0,
						"reset_at":  getNextMonthReset(),
					},
				},
			})
			c.Abort()
			return
		}

		// 设置剩余额度头部
		remaining := sub.MaxRequestsPerMonth - sub.UsedRequestsThisMonth
		c.Header("X-RateLimit-Limit", fmt.Sprintf("%d", sub.MaxRequestsPerMonth))
		c.Header("X-RateLimit-Remaining", fmt.Sprintf("%d", remaining))
		c.Header("X-RateLimit-Reset", fmt.Sprintf("%d", getNextMonthReset()))

		c.Next()
	}
}

// 获取下个月重置时间戳
func getNextMonthReset() int64 {
	now := time.Now()
	nextMonth := now.AddDate(0, 1, 0)
	return nextMonth.Unix()
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
