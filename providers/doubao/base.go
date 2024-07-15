package doubao

import (
	"one-api/common/requester"
	"one-api/model"
	"one-api/providers/base"
	"one-api/providers/openai"
)

type DoubaoProviderFactory struct{}

// 创建 DoubaoProvider
func (f DoubaoProviderFactory) Create(channel *model.Channel) base.ProviderInterface {
	return &DoubaoProvider{
		OpenAIProvider: openai.OpenAIProvider{
			BaseProvider: base.BaseProvider{
				Config:    getConfig(),
				Channel:   channel,
				Requester: requester.NewHTTPRequester(*channel.Proxy, openai.RequestErrorHandle),
			},
			BalanceAction: false,
		},
	}
}

type DoubaoProvider struct {
	openai.OpenAIProvider
}

func getConfig() base.ProviderConfig {
	return base.ProviderConfig{
		BaseURL:         "https://ark.cn-beijing.volces.com/api/v3",
		ChatCompletions: "/chat/completions",
	}
}

//
//// 请求错误处理
//func requestErrorHandle(resp *http.Response) *types.OpenAIError {
//	doubaoError := &DoubaoStatus{}
//	err := json.NewDecoder(resp.Body).Decode(doubaoError)
//	if err != nil {
//		return nil
//	}
//
//	return errorHandle(doubaoError)
//}
//
//// 错误处理
//func errorHandle(DoubaoError *DoubaoStatus) *types.OpenAIError {
//	if DoubaoError.Code == 0 {
//		return nil
//	}
//	return &types.OpenAIError{
//		Message: DoubaoError.Msg,
//		Type:    "Doubao error",
//		Code:    DoubaoError.Code,
//	}
//}

// 获取请求头
func (p *DoubaoProvider) GetRequestHeaders() (headers map[string]string) {
	headers = make(map[string]string)
	p.CommonRequestHeaders(headers)

	return headers
}
