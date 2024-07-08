package doubao

import (
	"one-api/common/requester"
	"one-api/model"
	"one-api/providers/base"
	"one-api/types"
)

type DoubaoProviderFactory struct{}

type DoubaoProvider struct {
	base.BaseProvider
}

// 创建 Provider
func (f DoubaoProviderFactory) Create(channel *model.Channel) base.ProviderInterface {
	return &DoubaoProvider{
		BaseProvider: base.BaseProvider{
			Config:    getConfig(),
			Channel:   channel,
			Requester: requester.NewHTTPRequester(*channel.Proxy, requestErrorHandle),
		},
	}
}

// 请求错误处理
func requestErrorHandle(resp *http.Response) *types.OpenAIError {
	CozeError := &DoubaoStatus{}
	err := json.NewDecoder(resp.Body).Decode(CozeError)
	if err != nil {
		return nil
	}

	return errorHandle(CozeError)
}

// 错误处理
func errorHandle(CozeError *CozeStatus) *types.OpenAIError {
	if CozeError.Code == 0 {
		return nil
	}
	return &types.OpenAIError{
		Message: CozeError.Msg,
		Type:    "Coze error",
		Code:    CozeError.Code,
	}
}

func getConfig() base.ProviderConfig {
	return base.ProviderConfig{
		BaseURL:         "https://ark.cn-beijing.volces.com/api",
		ChatCompletions: "/v3/chat/completions",
	}
}
