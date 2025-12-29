package gemini

import (
	"encoding/base64"
	"math"
	"net/http"
	"strconv"
	"strings"

	"one-api/common"
	"one-api/common/image"
	"one-api/common/storage"
	"one-api/common/utils"
	"one-api/types"
)

func (p *GeminiProvider) CreateImageGenerations(request *types.ImageRequest) (*types.ImageResponse, *types.OpenAIErrorWithStatusCode) {
	// 创建动态参数map
	parameters := make(GeminiImageParametersDynamic)
	parameters["sampleCount"] = request.N

	// 设置默认的personGeneration
	parameters["personGeneration"] = "allow_adult"

	// 处理AspectRatio
	if request.AspectRatio != nil {
		parameters["aspectRatio"] = *request.AspectRatio
	} else {
		switch request.Size {
		case "1024x1792":
			parameters["aspectRatio"] = "9:16"
		case "1792x1024":
			parameters["aspectRatio"] = "16:9"
		default:
			parameters["aspectRatio"] = "1:1"
		}
	}

	// 透传所有额外参数
	if request.ExtraParams != nil {
		for key, value := range request.ExtraParams {
			parameters[key] = value
		}
	}

	geminiRequest := &GeminiImageRequest{
		Instances: []GeminiImageInstance{
			{
				Prompt: request.Prompt,
			},
		},
		Parameters: parameters,
	}

	fullRequestURL := p.GetFullRequestURL("predict", request.Model)
	//headers := p.GetRequestHeaders()
	headers := p.GetOriginalRequestHeaders()

	req, err := p.Requester.NewRequest(http.MethodPost, fullRequestURL, p.Requester.WithBody(geminiRequest), p.Requester.WithHeader(headers))
	if err != nil {
		return nil, common.ErrorWrapper(err, "new_request_failed", http.StatusInternalServerError)
	}

	defer req.Body.Close()

	geminiImageResponse := &GeminiImageResponse{}
	_, errWithCode := p.Requester.SendRequest(req, geminiImageResponse, false)
	if errWithCode != nil {
		return nil, errWithCode
	}

	imageCount := len(geminiImageResponse.Predictions)

	// 如果imageCount为0，则返回错误
	if imageCount == 0 {
		return nil, common.StringErrorWrapper("no image generated", "no_image_generated", http.StatusInternalServerError)
	}

	openaiResponse := &types.ImageResponse{
		Created: utils.GetTimestamp(),
		Data:    make([]types.ImageResponseDataInner, 0, imageCount),
	}

	totalPromptTokens := 0
	usage := p.GetUsage()

	for _, prediction := range geminiImageResponse.Predictions {
		if prediction.BytesBase64Encoded == "" {
			continue
		}

		width, height := getGeminiImageDimensions(prediction.BytesBase64Encoded, request.Size)
		ratio, _ := image.GetResolutionPricing(width, height)
		if ratio < 1 {
			ratio = 1
		}
		perImageTokens := int(math.Ceil(258 * ratio))
		totalPromptTokens += perImageTokens

		url := ""
		if request.ResponseFormat == "" || request.ResponseFormat == "url" {
			body, err := base64.StdEncoding.DecodeString(prediction.BytesBase64Encoded)
			if err == nil {
				url = storage.Upload(body, utils.GetUUID()+".png")
			}
		}

		data := types.ImageResponseDataInner{}
		if url != "" {
			data.URL = url
		} else {
			data.B64JSON = prediction.BytesBase64Encoded
		}

		openaiResponse.Data = append(openaiResponse.Data, data)
	}

	if totalPromptTokens == 0 {
		totalPromptTokens = imageCount * 258
	}

	usage.PromptTokens = totalPromptTokens
	usage.PromptTokensDetails.InputTokens = totalPromptTokens
	usage.TotalTokens = usage.PromptTokens

	return openaiResponse, nil
}

func getGeminiImageDimensions(encoded, fallbackSize string) (width, height int) {
	width, height, err := image.GetImageSizeFromBase64(encoded)
	if err == nil {
		return width, height
	}

	if fallbackWidth, fallbackHeight, ok := parseSizeDimensions(fallbackSize); ok {
		return fallbackWidth, fallbackHeight
	}

	return 0, 0
}

func parseSizeDimensions(size string) (width, height int, ok bool) {
	if size == "" {
		return 0, 0, false
	}
	parts := strings.Split(size, "x")
	if len(parts) != 2 {
		return 0, 0, false
	}
	left, err := strconv.Atoi(strings.TrimSpace(parts[0]))
	if err != nil {
		return 0, 0, false
	}
	right, err := strconv.Atoi(strings.TrimSpace(parts[1]))
	if err != nil {
		return 0, 0, false
	}
	return left, right, true
}
