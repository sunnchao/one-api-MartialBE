package relay

import (
	"encoding/json"
	"net/http"
	"one-api/common"
	"one-api/common/config"
	"one-api/common/requester"
	"one-api/providers/claude"
	"one-api/safty"
	"one-api/types"
	"strings"

	"github.com/gin-gonic/gin"
)

var AllowChannelType = []int{config.ChannelTypeAnthropic, config.ChannelTypeVertexAI, config.ChannelTypeBedrock, config.ChannelTypeOpenRouter}

type relayClaudeOnly struct {
	relayBase
	claudeRequest *claude.ClaudeRequest
}

func NewRelayClaudeOnly(c *gin.Context) *relayClaudeOnly {
	c.Set("allow_channel_type", AllowChannelType)
	relay := &relayClaudeOnly{
		relayBase: relayBase{
			allowHeartbeat: true,
			c:              c,
		},
	}

	return relay
}

func (r *relayClaudeOnly) setRequest() error {
	r.claudeRequest = &claude.ClaudeRequest{}
	if err := common.UnmarshalBodyReusable(r.c, r.claudeRequest); err != nil {
		return err
	}
	r.setOriginalModel(r.claudeRequest.Model)
	return nil
}

func (r *relayClaudeOnly) getRequest() interface{} {
	return r.claudeRequest
}

func (r *relayClaudeOnly) IsStream() bool {
	return r.claudeRequest.Stream
}

func (r *relayClaudeOnly) getPromptTokens() (int, error) {
	channel := r.provider.GetChannel()
	return CountTokenMessages(r.claudeRequest, channel.PreCost)
}

func (r *relayClaudeOnly) send() (err *types.OpenAIErrorWithStatusCode, done bool) {
	chatProvider, ok := r.provider.(claude.ClaudeChatInterface)
	if !ok {
		err = common.StringErrorWrapperLocal("channel not implemented", "channel_error", http.StatusServiceUnavailable)
		done = true
		return
	}

	r.claudeRequest.Model = r.modelName
	// 内容审查
	if config.EnableSafe {
		for _, message := range r.claudeRequest.Messages {
			if message.Content != nil {
				CheckResult, _ := safty.CheckContent(message.Content)
				if !CheckResult.IsSafe {
					err = common.StringErrorWrapperLocal(CheckResult.Reason, CheckResult.Code, http.StatusBadRequest)
					done = true
					return
				}
			}
		}
	}

	if r.claudeRequest.Stream {
		var response requester.StreamReaderInterface[string]
		response, err = chatProvider.CreateClaudeChatStream(r.claudeRequest)
		if err != nil {
			return
		}

		if r.heartbeat != nil {
			r.heartbeat.Stop()
		}

		doneStr := func() string {
			return ""
		}
		firstResponseTime := responseGeneralStreamClient(r.c, response, doneStr)
		r.SetFirstResponseTime(firstResponseTime)
	} else {
		var response *claude.ClaudeResponse
		response, err = chatProvider.CreateClaudeChat(r.claudeRequest)
		if err != nil {
			return
		}

		if r.heartbeat != nil {
			r.heartbeat.Stop()
		}

		openErr := responseJsonClient(r.c, response)

		if openErr != nil {
			err = openErr
		}
	}

	if err != nil {
		done = true
	}
	return
}

func (r *relayClaudeOnly) GetError(err *types.OpenAIErrorWithStatusCode) (int, any) {
	newErr := FilterOpenAIErr(r.c, err)

	claudeErr := claude.OpenaiErrToClaudeErr(&newErr)

	return newErr.StatusCode, claudeErr.ClaudeError
}

func (r *relayClaudeOnly) HandleJsonError(err *types.OpenAIErrorWithStatusCode) {
	statusCode, response := r.GetError(err)
	r.c.JSON(statusCode, response)
}

func (r *relayClaudeOnly) HandleStreamError(err *types.OpenAIErrorWithStatusCode) {
	_, response := r.GetError(err)

	str, jsonErr := json.Marshal(response)
	if jsonErr != nil {
		return
	}
	r.c.Writer.Write([]byte("event: error\ndata: " + string(str) + "\n\n"))
	r.c.Writer.Flush()
}

func CountTokenMessages(request *claude.ClaudeRequest, preCostType int) (int, error) {
	if preCostType == config.PreContNotAll {
		return 0, nil
	}

	tokenEncoder := common.GetTokenEncoder(request.Model)

	tokenNum := 0

	tokensPerMessage := 4
	var textMsg strings.Builder

	for _, message := range request.Messages {
		tokenNum += tokensPerMessage
		switch v := message.Content.(type) {
		case string:
			textMsg.WriteString(v)
		case []any:
			for _, m := range v {
				content := m.(map[string]any)
				switch content["type"] {
				case "text":
					textMsg.WriteString(content["text"].(string))
				default:
					// 不算了  就只算他50吧
					tokenNum += 50
				}
			}
		}
	}

	if textMsg.Len() > 0 {
		tokenNum += common.GetTokenNum(tokenEncoder, textMsg.String())
	}

	return tokenNum, nil
}

// relayClaudeCountTokens handles count_tokens requests
type relayClaudeCountTokens struct {
	relayBase
	countTokensRequest *claude.CountTokensRequest
}

func NewRelayClaudeCountTokens(c *gin.Context) *relayClaudeCountTokens {
	c.Set("allow_channel_type", AllowChannelType)
	relay := &relayClaudeCountTokens{
		relayBase: relayBase{
			allowHeartbeat: false,
			c:              c,
		},
	}

	return relay
}

func (r *relayClaudeCountTokens) setRequest() error {
	r.countTokensRequest = &claude.CountTokensRequest{}
	if err := common.UnmarshalBodyReusable(r.c, r.countTokensRequest); err != nil {
		return err
	}
	r.setOriginalModel(r.countTokensRequest.Model)
	return nil
}

func (r *relayClaudeCountTokens) getRequest() interface{} {
	return r.countTokensRequest
}

func (r *relayClaudeCountTokens) IsStream() bool {
	return false
}

func (r *relayClaudeCountTokens) getPromptTokens() (int, error) {
	// For count_tokens, we don't need to pre-calculate tokens
	return 0, nil
}

func (r *relayClaudeCountTokens) send() (err *types.OpenAIErrorWithStatusCode, done bool) {
	chatProvider, ok := r.provider.(claude.ClaudeChatInterface)
	if !ok {
		err = common.StringErrorWrapperLocal("channel not implemented", "channel_error", http.StatusServiceUnavailable)
		done = true
		return
	}

	r.countTokensRequest.Model = r.modelName

	response, err := chatProvider.CreateClaudeCountTokens(r.countTokensRequest)
	if err != nil {
		done = true
		return
	}

	if r.heartbeat != nil {
		r.heartbeat.Stop()
	}

	openErr := responseJsonClient(r.c, response)

	if openErr != nil {
		err = openErr
		done = true
	}

	return
}

func (r *relayClaudeCountTokens) GetError(err *types.OpenAIErrorWithStatusCode) (int, any) {
	newErr := FilterOpenAIErr(r.c, err)

	claudeErr := claude.OpenaiErrToClaudeErr(&newErr)

	return newErr.StatusCode, claudeErr.ClaudeError
}

func (r *relayClaudeCountTokens) HandleJsonError(err *types.OpenAIErrorWithStatusCode) {
	statusCode, response := r.GetError(err)
	r.c.JSON(statusCode, response)
}

func (r *relayClaudeCountTokens) HandleStreamError(err *types.OpenAIErrorWithStatusCode) {
	// count_tokens doesn't support streaming
	r.HandleJsonError(err)
}

// ClaudeCountTokens handles Claude count_tokens API requests
func ClaudeCountTokens(c *gin.Context) {
	relay := NewRelayClaudeCountTokens(c)

	if err := relay.setRequest(); err != nil {
		openaiErr := common.StringErrorWrapperLocal(err.Error(), "chirou_api_error", http.StatusBadRequest)
		relay.HandleJsonError(openaiErr)
		return
	}

	if err := relay.setProvider(relay.getOriginalModel()); err != nil {
		openaiErr := common.StringErrorWrapperLocal(err.Error(), "chirou_api_error", http.StatusServiceUnavailable)
		relay.HandleJsonError(openaiErr)
		return
	}

	apiErr, _ := relay.send()
	if apiErr != nil {
		relay.HandleJsonError(apiErr)
		return
	}
}
