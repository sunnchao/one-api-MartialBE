package common

import (
	"bytes"
	"fmt"
	"io"
	"one-api/common/logger"
	"one-api/types"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

func UnmarshalBodyReusable(c *gin.Context, v any) error {
	requestBody, err := io.ReadAll(c.Request.Body)
	if err != nil {
		return err
	}
	err = c.Request.Body.Close()
	if err != nil {
		return err
	}
	c.Request.Body = io.NopCloser(bytes.NewBuffer(requestBody))
	err = c.ShouldBind(v)
	if err != nil {
		if errs, ok := err.(validator.ValidationErrors); ok {
			// 返回第一个错误字段的名称
			return fmt.Errorf("field %s is required", errs[0].Field())
		}
		return err
	}

	c.Request.Body = io.NopCloser(bytes.NewBuffer(requestBody))
	return nil
}

func ErrorWrapper(err error, code string, statusCode int) *types.OpenAIErrorWithStatusCode {
	errString := "error"
	if err != nil {
		errString = err.Error()
	}

	if strings.Contains(errString, "Post") || strings.Contains(errString, "dial") {
		logger.SysError(fmt.Sprintf("error: %s", errString))
		errString = "请求上游地址失败"
	}

	return StringErrorWrapper(errString, code, statusCode)
}

func ErrorWrapperLocal(err error, code string, statusCode int) *types.OpenAIErrorWithStatusCode {
	openaiErr := ErrorWrapper(err, code, statusCode)
	openaiErr.LocalError = true
	return openaiErr
}

func ErrorToOpenAIError(err error) *types.OpenAIError {
	return &types.OpenAIError{
		Code:    "system error",
		Message: err.Error(),
		Type:    "chirou_api_error",
	}
}

func StringErrorWrapper(err string, code string, statusCode int) *types.OpenAIErrorWithStatusCode {
	openAIError := types.OpenAIError{
		Message: err,
		Type:    "chirou_api_error",
		Code:    code,
	}
	return &types.OpenAIErrorWithStatusCode{
		OpenAIError: openAIError,
		StatusCode:  statusCode,
	}
}

func StringErrorWrapperLocal(err string, code string, statusCode int) *types.OpenAIErrorWithStatusCode {
	openaiErr := StringErrorWrapper(err, code, statusCode)
	openaiErr.LocalError = true
	return openaiErr

}

func AbortWithMessage(c *gin.Context, statusCode int, message string) {
	c.JSON(statusCode, gin.H{
		"error": gin.H{
			"message": message,
			"type":    "chirou_api_error",
		},
	})
	c.Abort()
	logger.LogError(c.Request.Context(), message)
}

func AbortWithErr(c *gin.Context, statusCode int, err error) {
	c.JSON(statusCode, err)
	c.Abort()
	logger.LogError(c.Request.Context(), err.Error())
}

func APIRespondWithError(c *gin.Context, status int, err error) {
	c.JSON(status, gin.H{
		"success": false,
		"message": err.Error(),
	})
}
