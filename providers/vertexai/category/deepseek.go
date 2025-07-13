package category

import (
  "encoding/json"
  "net/http"
  "one-api/common"
  "one-api/common/requester"
  "one-api/providers/base"
  "one-api/providers/gemini"
  "one-api/types"
)

func init() {
  CategoryMap["deepseek"] = &Category{
    Category:                  "deepseek",
    ChatComplete:              ConvertDeepSeekFromChatOpenai,
    ResponseChatComplete:      ConvertDeepSeekToChatOpenai,
    ResponseChatCompleteStrem: DeepSeekChatCompleteStrem,
    ErrorHandler:              gemini.RequestErrorHandle(""),
    GetModelName:              GetDeepSeekModelName,
    GetOtherUrl:               getDeepSeekOtherUrl,
  }
}

func ConvertDeepSeekFromChatOpenai(request *types.ChatCompletionRequest) (any, *types.OpenAIErrorWithStatusCode) {
  geminiRequest, err := gemini.ConvertFromChatOpenai(request)
  if err != nil {
    return nil, err
  }

  return geminiRequest, nil
}

func ConvertDeepSeekToChatOpenai(provider base.ProviderInterface, response *http.Response, request *types.ChatCompletionRequest) (*types.ChatCompletionResponse, *types.OpenAIErrorWithStatusCode) {
  geminiResponse := &gemini.GeminiChatResponse{}
  err := json.NewDecoder(response.Body).Decode(geminiResponse)
  if err != nil {
    return nil, common.ErrorWrapper(err, "decode_response_failed", http.StatusInternalServerError)
  }

  return gemini.ConvertToChatOpenai(provider, geminiResponse, request)
}

func DeepSeekChatCompleteStrem(provider base.ProviderInterface, request *types.ChatCompletionRequest) requester.HandlerPrefix[string] {
  chatHandler := &gemini.GeminiStreamHandler{
    Usage:   provider.GetUsage(),
    Request: request,
  }

  return chatHandler.HandlerStream
}

func GetDeepSeekModelName(modelName string) string {
  return modelName
}

func getDeepSeekOtherUrl(stream bool) string {
  if stream {
    return "streamGenerateContent?alt=sse"
  }
  return "generateContent"
}
