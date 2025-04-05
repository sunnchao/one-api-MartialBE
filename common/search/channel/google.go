package channel

import (
	"fmt"
	"net/http"
	"net/url"
	"one-api/common/requester"
	"one-api/common/search/search_type"
)

type GoogleResponse struct {
	Query           string         `json:"query"`
	NumberOfResults int            `json:"number_of_results"`
	Results         []GoogleResult `json:"results"`
}

type GoogleResult struct {
	Url     string `json:"url"`
	Title   string `json:"title"`
	Content string `json:"content"`
}

type Google struct {
	Key    string
	Cx     string // 搜索引擎ID
	ApiUrl string
}

func NewGoogle(apiKey, cx string) *Google {
	return &Google{
		Key:    apiKey,
		Cx:     cx,
		ApiUrl: "https://www.googleapis.com/customsearch/v1",
	}
}

func (g *Google) Name() string {
	return "google"
}

func (g *Google) Query(query string) (*search_type.SearchResponses, error) {
	client := requester.NewHTTPRequester("", nil)
	client.IsOpenAI = false

	// 构建带参数的请求URL
	params := url.Values{}
	params.Add("key", g.Key)
	params.Add("cx", g.Cx)
	params.Add("q", query)
	params.Add("num", "5") // 控制返回结果数量
	fullUrl := g.ApiUrl + "?" + params.Encode()

	req, err := client.NewRequest(http.MethodGet, fullUrl, client.WithHeader(requester.GetJsonHeaders()))
	if err != nil {
		return nil, err
	}

	// 更新响应结构体以匹配Google API格式
	var resp struct {
		Items []struct {
			Title   string `json:"title"`
			Link    string `json:"link"`
			Snippet string `json:"snippet"`
		} `json:"items"`
		Error struct {
			Code    int    `json:"code"`
			Message string `json:"message"`
		} `json:"error"`
	}

	_, opErr := client.SendRequest(req, &resp, true)
	if opErr != nil {
		return nil, opErr
	}

	// 处理API错误
	if resp.Error.Code != 0 {
		return nil, fmt.Errorf("Google API error %d: %s", resp.Error.Code, resp.Error.Message)
	}

	responses := &search_type.SearchResponses{
		Results: make([]search_type.SearchResult, 0),
	}
	for _, item := range resp.Items {
		responses.Results = append(responses.Results, search_type.SearchResult{
			Title:   item.Title,
			Content: item.Snippet,
			Url:     item.Link,
		})
	}

	return responses, nil
}
