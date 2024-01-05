package baidu

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"one-api/common"
	"one-api/providers/base"
	"one-api/types"
	"strings"
)

func (baiduResponse *BaiduChatResponse) ResponseHandler(resp *http.Response) (OpenAIResponse any, errWithCode *types.OpenAIErrorWithStatusCode) {
	if baiduResponse.ErrorMsg != "" {
		return nil, &types.OpenAIErrorWithStatusCode{
			OpenAIError: types.OpenAIError{
				Message: baiduResponse.ErrorMsg,
				Type:    "baidu_error",
				Param:   "",
				Code:    baiduResponse.ErrorCode,
			},
			StatusCode: resp.StatusCode,
		}
	}

	choice := types.ChatCompletionChoice{
		Index: 0,
		Message: types.ChatCompletionMessage{
			Role: "assistant",
			// 	Content: baiduResponse.Result,
		},
		FinishReason: base.StopFinishReason,
	}

	if baiduResponse.FunctionCall != nil {
		if baiduResponse.FunctionCate == "tool" {
			choice.Message.ToolCalls = []*types.ChatCompletionToolCalls{
				{
					Id:       baiduResponse.Id,
					Type:     "function",
					Function: baiduResponse.FunctionCall,
				},
			}
			choice.FinishReason = &base.StopFinishReasonToolFunction
		} else {
			choice.Message.FunctionCall = baiduResponse.FunctionCall
			choice.FinishReason = &base.StopFinishReasonCallFunction
		}
	} else {
		choice.Message.Content = baiduResponse.Result
	}

	OpenAIResponse = types.ChatCompletionResponse{
		ID:      baiduResponse.Id,
		Object:  "chat.completion",
		Created: baiduResponse.Created,
		Choices: []types.ChatCompletionChoice{choice},
		Usage:   baiduResponse.Usage,
	}

	return
}

func (p *BaiduProvider) getChatRequestBody(request *types.ChatCompletionRequest) *BaiduChatRequest {
	messages := make([]BaiduMessage, 0, len(request.Messages))
	for _, message := range request.Messages {
		if message.Role == "system" {
			messages = append(messages, BaiduMessage{
				Role:    "user",
				Content: message.StringContent(),
			})
			messages = append(messages, BaiduMessage{
				Role:    "assistant",
				Content: "Okay",
			})
		} else if message.Role == "function" {
			messages = append(messages, BaiduMessage{
				Role:    "assistant",
				Content: "Okay",
			})
			messages = append(messages, BaiduMessage{
				Role:    "user",
				Content: "请根据以下相关内容回答：" + message.StringContent(),
			})
		} else {
			messages = append(messages, BaiduMessage{
				Role:    message.Role,
				Content: message.StringContent(),
			})
		}
	}

	baiduChatRequest := &BaiduChatRequest{
		Messages:    messages,
		Temperature: request.Temperature,
		Stream:      request.Stream,
	}

	if request.Tools != nil {
		functions := make([]*types.ChatCompletionFunction, 0, len(request.Tools))
		for _, tool := range request.Tools {
			functions = append(functions, &tool.Function)
		}
		baiduChatRequest.Functions = functions
	} else if request.Functions != nil {
		baiduChatRequest.Functions = request.Functions
	}

	return baiduChatRequest
}

func (p *BaiduProvider) ChatAction(request *types.ChatCompletionRequest, isModelMapped bool, promptTokens int) (usage *types.Usage, errWithCode *types.OpenAIErrorWithStatusCode) {
	requestBody := p.getChatRequestBody(request)
	fullRequestURL := p.GetFullRequestURL(p.ChatCompletions, request.Model)
	if fullRequestURL == "" {
		return nil, common.ErrorWrapper(nil, "invalid_baidu_config", http.StatusInternalServerError)
	}

	headers := p.GetRequestHeaders()
	if request.Stream {
		headers["Accept"] = "text/event-stream"
	}

	client := common.NewClient()
	req, err := client.NewRequest(p.Context.Request.Method, fullRequestURL, common.WithBody(requestBody), common.WithHeader(headers))
	if err != nil {
		return nil, common.ErrorWrapper(err, "new_request_failed", http.StatusInternalServerError)
	}

	if request.Stream {
		usage, errWithCode = p.sendStreamRequest(req, request.Model, request.GetFunctionCate())
		if errWithCode != nil {
			return
		}

	} else {
		baiduChatRequest := &BaiduChatResponse{
			Model:        request.Model,
			FunctionCate: request.GetFunctionCate(),
		}
		errWithCode = p.SendRequest(req, baiduChatRequest, false)
		if errWithCode != nil {
			return
		}

		usage = baiduChatRequest.Usage
	}
	return

}

func (p *BaiduProvider) streamResponseBaidu2OpenAI(baiduResponse *BaiduChatStreamResponse) []*types.ChatCompletionStreamResponse {
	// var choice types.ChatCompletionStreamChoice
	choice := types.ChatCompletionStreamChoice{
		Index: 0,
		Delta: types.ChatCompletionStreamChoiceDelta{
			Role: "assistant",
		},
	}

	if baiduResponse.FunctionCall != nil {
		if baiduResponse.FunctionCate == "tool" {
			choice.Delta.ToolCalls = []*types.ChatCompletionToolCalls{
				{
					Id:       baiduResponse.Id,
					Type:     "function",
					Function: baiduResponse.FunctionCall,
				},
			}
			choice.FinishReason = &base.StopFinishReasonToolFunction
		} else {
			choice.Delta.FunctionCall = baiduResponse.FunctionCall
			choice.FinishReason = &base.StopFinishReasonCallFunction
		}
	} else {
		choice.Delta.Content = baiduResponse.Result
		if baiduResponse.IsEnd {
			choice.FinishReason = &base.StopFinishReason
		}
	}

	chatCompletion := types.ChatCompletionStreamResponse{
		ID:      baiduResponse.Id,
		Object:  "chat.completion.chunk",
		Created: baiduResponse.Created,
		Model:   baiduResponse.Model,
		// Choices: []types.ChatCompletionStreamChoice{choice},
	}
	var response []*types.ChatCompletionStreamResponse

	if baiduResponse.FunctionCall == nil {
		chatCompletion.Choices = []types.ChatCompletionStreamChoice{choice}
		response = append(response, &chatCompletion)
	} else {
		choices := choice.ConvertOpenaiStream()
		for _, choice := range choices {
			chatCompletionCopy := chatCompletion
			chatCompletionCopy.Choices = []types.ChatCompletionStreamChoice{choice}
			response = append(response, &chatCompletionCopy)
		}
	}

	return response
}

func (p *BaiduProvider) sendStreamRequest(req *http.Request, model string, functionCate string) (usage *types.Usage, errWithCode *types.OpenAIErrorWithStatusCode) {
	defer req.Body.Close()

	usage = &types.Usage{}
	// 发送请求
	client := common.GetHttpClient(p.Channel.Proxy)
	resp, err := client.Do(req)
	if err != nil {
		return nil, common.ErrorWrapper(err, "http_request_failed", http.StatusInternalServerError)
	}
	common.PutHttpClient(client)

	if common.IsFailureStatusCode(resp) {
		return nil, common.HandleErrorResp(resp)
	}

	// 如果返回的是json，则直接返回
	contentType := resp.Header.Get("Content-Type")
	if strings.Contains(contentType, "application/json") {
		var baiduResponse BaiduChatResponse
		err = common.DecodeResponse(resp.Body, &baiduResponse)
		if err != nil {
			return nil, common.ErrorWrapper(err, "decode_response_failed", http.StatusInternalServerError)
		}
		if baiduResponse.ErrorMsg != "" {
			return nil, &types.OpenAIErrorWithStatusCode{
				OpenAIError: types.OpenAIError{
					Message: baiduResponse.ErrorMsg,
					Type:    "baidu_error",
					Param:   "",
					Code:    baiduResponse.ErrorCode,
				},
				StatusCode: resp.StatusCode,
			}
		}
		return
	}

	defer resp.Body.Close()

	scanner := bufio.NewScanner(resp.Body)
	scanner.Split(func(data []byte, atEOF bool) (advance int, token []byte, err error) {
		if atEOF && len(data) == 0 {
			return 0, nil, nil
		}
		if i := strings.Index(string(data), "\n"); i >= 0 {
			return i + 1, data[0:i], nil
		}
		if atEOF {
			return len(data), data, nil
		}
		return 0, nil, nil
	})
	dataChan := make(chan string)
	stopChan := make(chan bool)
	go func() {
		for scanner.Scan() {
			data := scanner.Text()
			if len(data) < 6 { // ignore blank line or wrong format
				continue
			}
			data = data[6:]
			dataChan <- data
		}
		stopChan <- true
	}()
	common.SetEventStreamHeaders(p.Context)
	p.Context.Stream(func(w io.Writer) bool {
		select {
		case data := <-dataChan:
			var baiduResponse BaiduChatStreamResponse
			baiduResponse.FunctionCate = functionCate
			err := json.Unmarshal([]byte(data), &baiduResponse)
			if err != nil {
				common.SysError("error unmarshalling stream response: " + err.Error())
				return true
			}
			baiduResponse.Model = model
			if err := p.handleStreamResponse(&baiduResponse, usage); err != nil {
				common.SysError(err.Error())
				return true
			}
			return true
		case <-stopChan:
			p.Context.Render(-1, common.CustomEvent{Data: "data: [DONE]"})
			return false
		}
	})

	return usage, nil
}

func (p *BaiduProvider) handleStreamResponse(baiduResponse *BaiduChatStreamResponse, usage *types.Usage) error {
	if baiduResponse.Usage.TotalTokens != 0 {
		usage.TotalTokens = baiduResponse.Usage.TotalTokens
		usage.PromptTokens = baiduResponse.Usage.PromptTokens
		usage.CompletionTokens = baiduResponse.Usage.TotalTokens - baiduResponse.Usage.PromptTokens
	}
	responses := p.streamResponseBaidu2OpenAI(baiduResponse)

	for _, response := range responses {
		jsonResponse, err := json.Marshal(response)
		if err != nil {
			return fmt.Errorf("error marshalling stream response: %w", err)
		}
		p.Context.Render(-1, common.CustomEvent{Data: "data: " + string(jsonResponse)})
	}
	return nil
}
