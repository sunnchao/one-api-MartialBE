package openai

import (
  "bytes"
  "encoding/json"
  "io"
  "net/http"
  "one-api/common"
  "one-api/common/config"
  "one-api/common/requester"
  "one-api/types"
  "regexp"
  "strings"
)

type OpenAIStreamHandler struct {
  Usage      *types.Usage
  ModelName  string
  isAzure    bool
  EscapeJSON bool

  ReasoningHandler bool
  ExtraBilling     map[string]types.ExtraBilling `json:"-"`
  UsageHandler     UsageHandler
}

func (p *OpenAIProvider) CreateChatCompletion(request *types.ChatCompletionRequest) (openaiResponse *types.ChatCompletionResponse, errWithCode *types.OpenAIErrorWithStatusCode) {
  if p.RequestHandleBefore != nil {
    errWithCode = p.RequestHandleBefore(request)
    if errWithCode != nil {
      return nil, errWithCode
    }
  }
  otherProcessing(request, p.GetOtherArg())

  req, errWithCode := p.GetRequestTextBody(config.RelayModeChatCompletions, request.Model, request)
  if errWithCode != nil {
    return nil, errWithCode
  }
  defer req.Body.Close()

  response := &OpenAIProviderChatResponse{}
  // 发送请求
  _, errWithCode = p.Requester.SendRequest(req, response, false)
  if errWithCode != nil {
    return nil, errWithCode
  }

  // 检测是否错误
  openaiErr := ErrorHandle(&response.OpenAIErrorResponse)
  if openaiErr != nil {
    errWithCode = &types.OpenAIErrorWithStatusCode{
      OpenAIError: *openaiErr,
      StatusCode:  http.StatusBadRequest,
    }
    return nil, errWithCode
  }

  if response.Usage == nil || response.Usage.CompletionTokens == 0 {
    response.Usage = &types.Usage{
      PromptTokens:     p.Usage.PromptTokens,
      CompletionTokens: 0,
      TotalTokens:      0,
    }
    // 那么需要计算
    response.Usage.CompletionTokens = common.CountTokenText(response.GetContent(), request.Model)
    response.Usage.TotalTokens = response.Usage.PromptTokens + response.Usage.CompletionTokens
  } else if p.UsageHandler != nil {
    p.UsageHandler(response.Usage)
  }

  *p.Usage = *response.Usage

  p.Usage.ExtraBilling = getChatExtraBilling(request)

  convertChatCompletionImages(&response.ChatCompletionResponse)

  return &response.ChatCompletionResponse, nil
}

func (p *OpenAIProvider) CreateChatCompletionStream(request *types.ChatCompletionRequest) (requester.StreamReaderInterface[string], *types.OpenAIErrorWithStatusCode) {
  if p.RequestHandleBefore != nil {
    errWithCode := p.RequestHandleBefore(request)
    if errWithCode != nil {
      return nil, errWithCode
    }
  }
  otherProcessing(request, p.GetOtherArg())
  streamOptions := request.StreamOptions
  // 如果支持流式返回Usage 则需要更改配置：
  if p.SupportStreamOptions {
    request.StreamOptions = &types.StreamOptions{
      IncludeUsage: true,
    }
  } else {
    // 避免误传导致报错
    request.StreamOptions = nil
  }
  req, errWithCode := p.GetRequestTextBody(config.RelayModeChatCompletions, request.Model, request)
  if errWithCode != nil {
    return nil, errWithCode
  }
  defer req.Body.Close()

  // 恢复原来的配置
  request.StreamOptions = streamOptions

  // 发送请求
  resp, errWithCode := p.Requester.SendRequestRaw(req)
  if errWithCode != nil {
    return nil, errWithCode
  }

  chatHandler := OpenAIStreamHandler{
    Usage:      p.Usage,
    ModelName:  request.Model,
    isAzure:    p.IsAzure,
    EscapeJSON: p.StreamEscapeJSON,

    ExtraBilling: getChatExtraBilling(request),
    UsageHandler: p.UsageHandler,
  }

  return requester.RequestStream(p.Requester, resp, chatHandler.HandlerChatStream)
}

func (h *OpenAIStreamHandler) HandlerChatStream(rawLine *[]byte, dataChan chan string, errChan chan error) {
  // 如果rawLine 前缀不为data:，则直接返回
  if !strings.HasPrefix(string(*rawLine), "data:") {
    *rawLine = nil
    return
  }

  // 去除前缀
  *rawLine = (*rawLine)[5:]
  *rawLine = bytes.TrimSpace(*rawLine)

  // 如果等于 DONE 则结束
  if string(*rawLine) == "[DONE]" {
    errChan <- io.EOF
    *rawLine = requester.StreamClosed
    return
  }

  var openaiResponse OpenAIProviderChatStreamResponse
  err := json.Unmarshal(*rawLine, &openaiResponse)
  if err != nil {
    errChan <- common.ErrorToOpenAIError(err)
    return
  }

  aiError := ErrorHandle(&openaiResponse.OpenAIErrorResponse)
  if aiError != nil {
    errChan <- aiError
    return
  }

  if convertChatStreamImages(&openaiResponse.ChatCompletionStreamResponse) {
    h.EscapeJSON = true
  }

  if openaiResponse.Usage != nil {
    if openaiResponse.Usage.CompletionTokens > 0 {
      if h.UsageHandler != nil && h.UsageHandler(openaiResponse.Usage) {
        h.EscapeJSON = true
      }
      *h.Usage = *openaiResponse.Usage

      if h.ExtraBilling != nil {
        h.Usage.ExtraBilling = h.ExtraBilling
      }
    }

    if len(openaiResponse.Choices) == 0 {
      *rawLine = nil
      return
    }
  } else {
    if len(openaiResponse.Choices) > 0 && openaiResponse.Choices[0].Usage != nil {
      if openaiResponse.Choices[0].Usage.CompletionTokens > 0 {
        if h.UsageHandler != nil && h.UsageHandler(openaiResponse.Choices[0].Usage) {
          h.EscapeJSON = true
        }
        *h.Usage = *openaiResponse.Choices[0].Usage
        if h.ExtraBilling != nil {
          h.Usage.ExtraBilling = h.ExtraBilling
        }
      }
    } else {
      if h.Usage.TotalTokens == 0 {
        h.Usage.TotalTokens = h.Usage.PromptTokens
      }
      h.Usage.TextBuilder.WriteString(openaiResponse.GetResponseText())
    }
  }

  if h.ReasoningHandler && len(openaiResponse.Choices) > 0 {
    for index, choices := range openaiResponse.Choices {
      if choices.Delta.ReasoningContent == "" && choices.Delta.Reasoning != "" {
        openaiResponse.Choices[index].Delta.ReasoningContent = choices.Delta.Reasoning
        openaiResponse.Choices[index].Delta.Reasoning = ""
      }
    }

    h.EscapeJSON = true
  }

  if h.EscapeJSON {
    if data, err := json.Marshal(openaiResponse.ChatCompletionStreamResponse); err == nil {
      dataChan <- string(data)
      return
    }
  }
  dataChan <- string(*rawLine)
}

func convertChatCompletionImages(response *types.ChatCompletionResponse) bool {
  if response == nil {
    return false
  }

  modified := false
  for idx := range response.Choices {
    if convertChatCompletionMessage(&response.Choices[idx].Message) {
      modified = true
    }
  }

  return modified
}

func convertChatCompletionMessage(message *types.ChatCompletionMessage) bool {
  if message == nil {
    return false
  }

  modified := false
  if message.Content != nil {
    if newContent, changed := convertAnyImageData(message.Content); changed {
      message.Content = newContent
      modified = true
    }
  }

  if len(message.Images) > 0 {
    if newImages, changed := convertChatMessageParts(message.Images); changed {
      message.Images = newImages
      modified = true
    }
  }

  if len(message.Image) > 0 {
    if newImage, changed := convertMultimediaData(message.Image); changed {
      message.Image = newImage
      modified = true
    }
  }

  return modified
}

func convertChatStreamImages(response *types.ChatCompletionStreamResponse) bool {
  if response == nil {
    return false
  }

  modified := false
  for idx := range response.Choices {
    choice := &response.Choices[idx]
    if len(choice.Delta.Images) > 0 {
      if newImages, changed := convertChatMessageParts(choice.Delta.Images); changed {
        choice.Delta.Images = newImages
        modified = true
      }
    }

    if len(choice.Delta.Image) > 0 {
      if newImage, changed := convertMultimediaData(choice.Delta.Image); changed {
        choice.Delta.Image = newImage
        modified = true
      }
    }
  }

  return modified
}

func convertChatMessageParts(parts []types.ChatMessagePart) ([]types.ChatMessagePart, bool) {
  modified := false

  for idx := range parts {
    part := &parts[idx]
    if part.ImageURL != nil {
      if newURL := uploadBase64Image(part.ImageURL.URL); newURL != "" {
        part.ImageURL.URL = newURL
        modified = true
      }
    }
  }

  return parts, modified
}

func convertMultimediaData(items []types.MultimediaData) ([]types.MultimediaData, bool) {
  modified := false

  for idx := range items {
    if newURL := uploadBase64Image(items[idx].Data); newURL != "" {
      items[idx].Data = newURL
      modified = true
    }
  }

  return items, modified
}

func otherProcessing(request *types.ChatCompletionRequest, otherArg string) {
  matched, _ := regexp.MatchString(`^o[1-9]`, request.Model)
  if matched || strings.HasPrefix(request.Model, "gpt-5") {
    if request.MaxTokens > 0 {
      request.MaxCompletionTokens = request.MaxTokens
      request.MaxTokens = 0
    }

    if request.Model != "gpt-5-chat-latest" {
      request.Temperature = nil
    }

    if otherArg != "" {
      request.ReasoningEffort = &otherArg
    }
  }
}

func getChatExtraBilling(request *types.ChatCompletionRequest) map[string]types.ExtraBilling {
  if !strings.Contains(request.Model, "search-preview") {
    return nil
  }

  searchType := "medium"
  if request.WebSearchOptions != nil && request.WebSearchOptions.SearchContextSize != "" {
    searchType = request.WebSearchOptions.SearchContextSize
  }

  return map[string]types.ExtraBilling{
    types.APITollTypeWebSearchPreview: {
      Type:      searchType,
      CallCount: 1,
    },
  }
}
