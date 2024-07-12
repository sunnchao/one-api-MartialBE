package doubao

import (
	"one-api/common/requester"
	"one-api/model"
	"one-api/providers/base"
	"one-api/providers/openai"
)

type DoubaoProviderFactory struct{}

// 创建 Provider
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
		BaseURL:         "https://doubao.saiban.free.hr",
		ChatCompletions: "/v1/chat/completions",
	}
}
