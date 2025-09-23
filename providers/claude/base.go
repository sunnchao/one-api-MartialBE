package claude

import (
	"encoding/json"
	"fmt"
	"net/http"
	"one-api/common/requester"
	"one-api/model"
	"one-api/providers/base"
	"one-api/types"
	"strings"
)

type ClaudeProviderFactory struct{}

// 创建 ClaudeProvider
func (f ClaudeProviderFactory) Create(channel *model.Channel) base.ProviderInterface {
	return &ClaudeProvider{
		BaseProvider: base.BaseProvider{
			Config:    getConfig(),
			Channel:   channel,
			Requester: requester.NewHTTPRequester(*channel.Proxy, RequestErrorHandle),
		},
	}
}

type ClaudeProvider struct {
	base.BaseProvider
}

func getConfig() base.ProviderConfig {
	return base.ProviderConfig{
		BaseURL:         "https://api.anthropic.com",
		ChatCompletions: "/v1/messages",
		ModelList:       "/v1/models",
	}
}

// 请求错误处理
func RequestErrorHandle(resp *http.Response) *types.OpenAIError {
	claudeError := &ClaudeError{}
	err := json.NewDecoder(resp.Body).Decode(claudeError)
	if err != nil {
		return nil
	}

	return errorHandle(claudeError)
}

// 错误处理
func errorHandle(claudeError *ClaudeError) *types.OpenAIError {
	if claudeError == nil {
		return nil
	}

	if claudeError.Type == "" {
		return nil
	}
	return &types.OpenAIError{
		Message: claudeError.ErrorInfo.Message,
		Type:    claudeError.ErrorInfo.Type,
		Code:    claudeError.Type,
	}
}

// 获取请求头
func (p *ClaudeProvider) GetRequestHeaders() (headers map[string]string) {
	headers = make(map[string]string)
	p.CommonRequestHeaders(headers)

	headers["x-api-key"] = p.Channel.Key
	anthropicVersion := p.Context.Request.Header.Get("anthropic-version")
	if anthropicVersion == "" {
		anthropicVersion = "2023-06-01"
	}
	headers["anthropic-version"] = anthropicVersion

	return headers
}

// 获取原始请求的header头
func (p *ClaudeProvider) GetOriginalRequestHeaders() (headers map[string]string) {
	headers = make(map[string]string)

	hasAuthorization := false
	hasXApiKey := false
	if p.Context != nil && p.Context.Request != nil {
		// 复制原始请求的所有header头
		for key, values := range p.Context.Request.Header {
			if len(values) > 0 {
				headers[key] = values[0] // 取第一个值
				// 检查是否包含Authorization头
				if strings.ToLower(key) == "authorization" {
					hasAuthorization = true
				}
				if strings.ToLower(key) == "x-api-key" {
					hasXApiKey = true
				}
			}
		}
	}
	p.CommonRequestHeaders(headers)

	// 如果原始header中没有Authorization，则添加Authorization头
	if hasAuthorization {
		headers["Authorization"] = "Bearer " + p.Channel.Key
	} else if hasXApiKey {
		headers["x-api-key"] = p.Channel.Key
		delete(headers, "X-Api-Key")
	} else {
		headers["x-api-key"] = p.Channel.Key
		// 删除 X-Api-Key 头
		delete(headers, "X-Api-Key")
	}
	
	return headers
}

func (p *ClaudeProvider) GetFullRequestURL(requestURL string) string {
	baseURL := strings.TrimSuffix(p.GetBaseURL(), "/")
	if strings.HasPrefix(baseURL, "https://gateway.ai.cloudflare.com") {
		requestURL = strings.TrimPrefix(requestURL, "/v1")
	}

	return fmt.Sprintf("%s%s", baseURL, requestURL)
}

func stopReasonClaude2OpenAI(reason string) string {
	switch reason {
	case "end_turn", "stop_sequence":
		return types.FinishReasonStop
	case "max_tokens":
		return types.FinishReasonLength
	case "tool_use":
		return types.FinishReasonToolCalls
	case "refusal":
		return types.FinishReasonContentFilter
	default:
		return reason
	}
}

func convertRole(role string) string {
	switch role {
	case types.ChatMessageRoleUser, types.ChatMessageRoleTool, types.ChatMessageRoleFunction:
		return types.ChatMessageRoleUser
	default:
		return types.ChatMessageRoleAssistant
	}
}
