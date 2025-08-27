package gemini

import (
	"encoding/json"
	"net/http"
	"one-api/common"
	"one-api/common/config"
	"one-api/common/requester"
	"one-api/common/utils"
	"one-api/providers/base"
	"one-api/types"
	"strings"
)

const (
	GeminiVisionMaxImageNum = 16
)

// Gemini 安全设置类别常量
var geminiSafetyCategories = []string{
	"HARM_CATEGORY_HARASSMENT",
	"HARM_CATEGORY_HATE_SPEECH", 
	"HARM_CATEGORY_SEXUALLY_EXPLICIT",
	"HARM_CATEGORY_DANGEROUS_CONTENT",
	"HARM_CATEGORY_CIVIC_INTEGRITY",
}

// isImagePreviewModel 检查是否为 image preview 模型
func isImagePreviewModel(model string) bool {
	return strings.Contains(model, "gemini-2.5-flash-image-preview")
}

// createSafetySettings 创建安全设置
func createSafetySettings(threshold string) []GeminiChatSafetySettings {
	settings := make([]GeminiChatSafetySettings, 0, len(geminiSafetyCategories))
	for _, category := range geminiSafetyCategories {
		settings = append(settings, GeminiChatSafetySettings{
			Category:  category,
			Threshold: threshold,
		})
	}
	return settings
}

// addBuiltinTool 添加内置工具
func addBuiltinTool(tools *[]GeminiChatTools, toolType string) {
	switch toolType {
	case "codeExecution":
		*tools = append(*tools, GeminiChatTools{
			CodeExecution: &GeminiCodeExecution{},
		})
	case "urlContext":
		*tools = append(*tools, GeminiChatTools{
			UrlContext: &GeminiCodeExecution{},
		})
	case "googleSearch":
		*tools = append(*tools, GeminiChatTools{
			GoogleSearch: &GeminiCodeExecution{},
		})
	}
}

// removeThinkingConfigFromRawBody 从原始请求体中移除 thinkingConfig
func removeThinkingConfigFromRawBody(rawBody []byte) []byte {
	var bodyMap map[string]interface{}
	if err := json.Unmarshal(rawBody, &bodyMap); err != nil {
		return rawBody
	}
	
	if genConfig, exists := bodyMap["generationConfig"].(map[string]interface{}); exists {
		delete(genConfig, "thinkingConfig")
	}
	
	if modifiedBody, err := json.Marshal(bodyMap); err == nil {
		return modifiedBody
	}
	return rawBody
}

type GeminiStreamHandler struct {
	Usage   *types.Usage
	Request *types.ChatCompletionRequest

	key string
}

type OpenAIStreamHandler struct {
	Usage     *types.Usage
	ModelName string
}

func (p *GeminiProvider) CreateChatCompletion(request *types.ChatCompletionRequest) (*types.ChatCompletionResponse, *types.OpenAIErrorWithStatusCode) {
	if p.UseOpenaiAPI {
		return p.OpenAIProvider.CreateChatCompletion(request)
	}

	geminiRequest, errWithCode := ConvertFromChatOpenai(request)
	if errWithCode != nil {
		return nil, errWithCode
	}

	req, errWithCode := p.getChatRequest(geminiRequest, false)
	if errWithCode != nil {
		return nil, errWithCode
	}
	defer req.Body.Close()

	geminiChatResponse := &GeminiChatResponse{}
	// 发送请求
	_, errWithCode = p.Requester.SendRequest(req, geminiChatResponse, false)
	if errWithCode != nil {
		return nil, common.ErrorWrapper(errWithCode, "gemini_chat_request_failed", errWithCode.StatusCode)
	}

	return ConvertToChatOpenai(p, geminiChatResponse, request)
}

func (p *GeminiProvider) CreateChatCompletionStream(request *types.ChatCompletionRequest) (requester.StreamReaderInterface[string], *types.OpenAIErrorWithStatusCode) {

	channel := p.GetChannel()
	if p.UseOpenaiAPI {
		return p.OpenAIProvider.CreateChatCompletionStream(request)
	}

	geminiRequest, errWithCode := ConvertFromChatOpenai(request)
	if errWithCode != nil {
		return nil, errWithCode
	}

	req, errWithCode := p.getChatRequest(geminiRequest, false)
	if errWithCode != nil {
		return nil, errWithCode
	}
	defer req.Body.Close()

	// 发送请求
	resp, errWithCode := p.Requester.SendRequestRaw(req)
	if errWithCode != nil {
		return nil, common.ErrorWrapper(errWithCode, "gemini_stream_request_failed", errWithCode.StatusCode)
	}

	chatHandler := &GeminiStreamHandler{
		Usage:   p.Usage,
		Request: request,

		key: channel.Key,
	}

	return requester.RequestStream(p.Requester, resp, chatHandler.HandlerStream)
}

func (p *GeminiProvider) getChatRequest(geminiRequest *GeminiChatRequest, isRelay bool) (*http.Request, *types.OpenAIErrorWithStatusCode) {
	url := "generateContent"
	if geminiRequest.Stream {
		url = "streamGenerateContent?alt=sse"
	}
	// 获取请求地址
	fullRequestURL := p.GetFullRequestURL(url, geminiRequest.Model)

	// 获取请求头
	headers := p.GetRequestHeaders()
	if geminiRequest.Stream {
		headers["Accept"] = "text/event-stream"
	}

	var body any
	if isRelay {
		var exists bool
		rawBody, exists := p.GetRawBody()
		if !exists {
			return nil, common.StringErrorWrapperLocal("request body not found", "request_body_not_found", http.StatusInternalServerError)
		}
		
		// 如果是 gemini-2.5-flash-image-preview 模型，需要从 raw body 中移除 ThinkingConfig
		if isImagePreviewModel(geminiRequest.Model) {
			body = removeThinkingConfigFromRawBody(rawBody)
		} else {
			body = rawBody
		}
	} else {
		p.pluginHandle(geminiRequest)
		
		// 如果是 gemini-2.5-flash-image-preview 模型，移除 ThinkingConfig
		if isImagePreviewModel(geminiRequest.Model) {
			geminiRequest.GenerationConfig.ThinkingConfig = nil
		}
		
		body = geminiRequest
	}

	// 创建请求
	req, err := p.Requester.NewRequest(http.MethodPost, fullRequestURL, p.Requester.WithBody(body), p.Requester.WithHeader(headers))
	if err != nil {
		return nil, common.ErrorWrapper(err, "new_request_failed", http.StatusInternalServerError)
	}

	return req, nil
}

func ConvertFromChatOpenai(request *types.ChatCompletionRequest) (*GeminiChatRequest, *types.OpenAIErrorWithStatusCode) {

	threshold := "BLOCK_NONE"

	geminiRequest := GeminiChatRequest{
		Contents:       make([]GeminiChatContent, 0, len(request.Messages)),
		SafetySettings: createSafetySettings(threshold),
		GenerationConfig: GeminiChatGenerationConfig{
			Temperature:        request.Temperature,
			TopP:               request.TopP,
			MaxOutputTokens:    request.MaxTokens,
			ResponseModalities: request.Modalities,
		},
	}

	if strings.HasPrefix(request.Model, "gemini-2.0-flash-exp") || strings.HasPrefix(request.Model, "gemini-2.5-flash-image-preview") {
		geminiRequest.GenerationConfig.ResponseModalities = []string{"Text", "Image"}
	}

	if strings.HasSuffix(request.Model, "-tts") {
		geminiRequest.GenerationConfig.ResponseModalities = []string{"AUDIO"}
	}

	if request.Reasoning != nil && !isImagePreviewModel(request.Model) {
		geminiRequest.GenerationConfig.ThinkingConfig = &ThinkingConfig{
			ThinkingBudget: &request.Reasoning.MaxTokens,
		}
	}

	if config.GeminiSettingsInstance.GetOpenThink(request.Model) && !isImagePreviewModel(request.Model) {
		if geminiRequest.GenerationConfig.ThinkingConfig == nil {
			geminiRequest.GenerationConfig.ThinkingConfig = &ThinkingConfig{}
		}
		geminiRequest.GenerationConfig.ThinkingConfig.IncludeThoughts = true
	}

	functions := request.GetFunctions()

	if functions != nil {
		var geminiChatTools GeminiChatTools
		builtinTools := make(map[string]bool)
		
		for _, function := range functions {
			// 检查是否为内置工具
			if function.Name == "googleSearch" || function.Name == "codeExecution" || function.Name == "urlContext" {
				builtinTools[function.Name] = true
				continue
			}

			// 清理空的参数
			if params, ok := function.Parameters.(map[string]interface{}); ok {
				if properties, ok := params["properties"].(map[string]interface{}); ok && len(properties) == 0 {
					function.Parameters = nil
				}
			}

			geminiChatTools.FunctionDeclarations = append(geminiChatTools.FunctionDeclarations, *function)
		}

		// 添加内置工具
		for toolName := range builtinTools {
			addBuiltinTool(&geminiRequest.Tools, toolName)
		}

		// 如果有自定义函数，添加到工具列表
		if len(geminiChatTools.FunctionDeclarations) > 0 {
			geminiRequest.Tools = append(geminiRequest.Tools, geminiChatTools)
		}
	}

	geminiContent, systemContent, err := OpenAIToGeminiChatContent(request.Messages)
	if err != nil {
		return nil, err
	}

	if systemContent != "" {
		geminiRequest.SystemInstruction = &GeminiChatContent{
			Parts: []GeminiPart{
				{Text: systemContent},
			},
		}
	}

	geminiRequest.Contents = geminiContent
	geminiRequest.Stream = request.Stream
	geminiRequest.Model = request.Model

	if request.ResponseFormat != nil && (request.ResponseFormat.Type == "json_schema" || request.ResponseFormat.Type == "json_object") {
		geminiRequest.GenerationConfig.ResponseMimeType = "application/json"

		if request.ResponseFormat.JsonSchema != nil && request.ResponseFormat.JsonSchema.Schema != nil {
			cleanedSchema := removeAdditionalPropertiesWithDepth(request.ResponseFormat.JsonSchema.Schema, 0)
			geminiRequest.GenerationConfig.ResponseSchema = cleanedSchema
		}
	}

	return &geminiRequest, nil
}

func removeAdditionalPropertiesWithDepth(schema interface{}, depth int) interface{} {
	if depth >= 5 {
		return schema
	}

	v, ok := schema.(map[string]interface{})
	if !ok || len(v) == 0 {
		return schema
	}

	// 如果type不为object和array，则直接返回
	if typeVal, exists := v["type"]; !exists || (typeVal != "object" && typeVal != "array") {
		return schema
	}

	delete(v, "title")

	switch v["type"] {
	case "object":
		delete(v, "additionalProperties")
		// 处理 properties
		if properties, ok := v["properties"].(map[string]interface{}); ok {
			for key, value := range properties {
				properties[key] = removeAdditionalPropertiesWithDepth(value, depth+1)
			}
		}
		for _, field := range []string{"allOf", "anyOf", "oneOf"} {
			if nested, ok := v[field].([]interface{}); ok {
				for i, item := range nested {
					nested[i] = removeAdditionalPropertiesWithDepth(item, depth+1)
				}
			}
		}
	case "array":
		if items, ok := v["items"].(map[string]interface{}); ok {
			v["items"] = removeAdditionalPropertiesWithDepth(items, depth+1)
		}
	}

	return v
}

func ConvertToChatOpenai(provider base.ProviderInterface, response *GeminiChatResponse, request *types.ChatCompletionRequest) (openaiResponse *types.ChatCompletionResponse, errWithCode *types.OpenAIErrorWithStatusCode) {
	openaiResponse = &types.ChatCompletionResponse{
		ID:      response.ResponseId,
		Object:  "chat.completion",
		Created: utils.GetTimestamp(),
		Model:   request.Model,
		Choices: make([]types.ChatCompletionChoice, 0, len(response.Candidates)),
	}

	if len(response.Candidates) == 0 {
		errWithCode = common.StringErrorWrapper("no candidates", "no_candidates", http.StatusInternalServerError)
		return
	}

	for _, candidate := range response.Candidates {
		openaiResponse.Choices = append(openaiResponse.Choices, candidate.ToOpenAIChoice(request))
	}

	usage := provider.GetUsage()
	*usage = ConvertOpenAIUsage(response.UsageMetadata)
	openaiResponse.Usage = usage

	return
}

// 转换为OpenAI聊天流式请求体
func (h *GeminiStreamHandler) HandlerStream(rawLine *[]byte, dataChan chan string, errChan chan error) {
	// 如果rawLine 前缀不为data:，则直接返回
	if !strings.HasPrefix(string(*rawLine), "data: ") {
		*rawLine = nil
		return
	}

	// 去除前缀
	*rawLine = (*rawLine)[6:]

	var geminiResponse GeminiChatResponse
	err := json.Unmarshal(*rawLine, &geminiResponse)
	if err != nil {
		errChan <- common.ErrorWrapper(err, "gemini_stream_response_parse_failed", http.StatusInternalServerError)
		return
	}

	aiError := errorHandle(&geminiResponse.GeminiErrorResponse, h.key)
	if aiError != nil {
		errChan <- aiError
		return
	}

	h.convertToOpenaiStream(&geminiResponse, dataChan)

}

func (h *GeminiStreamHandler) convertToOpenaiStream(geminiResponse *GeminiChatResponse, dataChan chan string) {
	streamResponse := types.ChatCompletionStreamResponse{
		ID:      geminiResponse.ResponseId,
		Object:  "chat.completion.chunk",
		Created: utils.GetTimestamp(),
		Model:   h.Request.Model,
		// Choices: choices,
	}

	choices := make([]types.ChatCompletionStreamChoice, 0, len(geminiResponse.Candidates))

	isStop := false
	for _, candidate := range geminiResponse.Candidates {
		if candidate.FinishReason != nil && *candidate.FinishReason == "STOP" {
			isStop = true
			candidate.FinishReason = nil
		}
		choices = append(choices, candidate.ToOpenAIStreamChoice(h.Request))
	}

	if len(choices) > 0 && (choices[0].Delta.ToolCalls != nil || choices[0].Delta.FunctionCall != nil) {
		choices := choices[0].ConvertOpenaiStream()
		for _, choice := range choices {
			chatCompletionCopy := streamResponse
			chatCompletionCopy.Choices = []types.ChatCompletionStreamChoice{choice}
			responseBody, _ := json.Marshal(chatCompletionCopy)
			dataChan <- string(responseBody)
		}
	} else {
		streamResponse.Choices = choices
		responseBody, _ := json.Marshal(streamResponse)
		dataChan <- string(responseBody)
	}

	if isStop {
		streamResponse.Choices = []types.ChatCompletionStreamChoice{
			{
				FinishReason: types.FinishReasonStop,
				Delta: types.ChatCompletionStreamChoiceDelta{
					Role: types.ChatMessageRoleAssistant,
				},
			},
		}
		responseBody, _ := json.Marshal(streamResponse)
		dataChan <- string(responseBody)
	}

	h.Usage.TextBuilder.WriteString(streamResponse.GetResponseText())

	// 和ExecutableCode的tokens共用，所以跳过
	if geminiResponse.UsageMetadata == nil {
		return
	}

	usage := ConvertOpenAIUsage(geminiResponse.UsageMetadata)

	usage.TextBuilder = h.Usage.TextBuilder
	*h.Usage = usage
}

func ConvertOpenAIUsage(geminiUsage *GeminiUsageMetadata) types.Usage {
	if geminiUsage == nil {
		return types.Usage{
			PromptTokens:     0,
			CompletionTokens: 0,
			TotalTokens:      0,
		}
	}

	usage := types.Usage{
		PromptTokens:     geminiUsage.PromptTokenCount,
		CompletionTokens: geminiUsage.CandidatesTokenCount + geminiUsage.ThoughtsTokenCount,
		TotalTokens:      geminiUsage.TotalTokenCount,

		CompletionTokensDetails: types.CompletionTokensDetails{
			ReasoningTokens: geminiUsage.ThoughtsTokenCount,
		},
	}

	for _, p := range geminiUsage.PromptTokensDetails {
		switch p.Modality {
		case "TEXT":
			usage.PromptTokensDetails.TextTokens = p.TokenCount
		case "AUDIO":
			usage.PromptTokensDetails.AudioTokens = p.TokenCount
		}
	}

	for _, c := range geminiUsage.CandidatesTokensDetails {
		switch c.Modality {
		case "TEXT":
			usage.CompletionTokensDetails.TextTokens = c.TokenCount
		case "AUDIO":
			usage.CompletionTokensDetails.AudioTokens = c.TokenCount
		case "IMAGE":
			usage.CompletionTokensDetails.ImageTokens = c.TokenCount
		}
	}

	return usage
}

func (p *GeminiProvider) pluginHandle(request *GeminiChatRequest) {
	if !p.UseCodeExecution {
		return
	}

	if len(request.Tools) > 0 {
		return
	}

	if p.Channel.Plugin == nil {
		return
	}

	request.Tools = append(request.Tools, GeminiChatTools{
		CodeExecution: &GeminiCodeExecution{},
	})

}
