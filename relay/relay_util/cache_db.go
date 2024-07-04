package relay_util

import (
	"errors"
	"one-api/common/utils"
	"one-api/model"
	"time"
)

type ChatCacheDB struct{}

func (db *ChatCacheDB) Get(hash string, userId int) *ChatCacheProps {
	cache, _ := model.GetChatCache(hash, userId)
	if cache == nil {
		return nil
	}

	props, err := utils.UnmarshalString[ChatCacheProps](cache.Data)
	if err != nil {
		return nil
	}

	return &props
}

func (db *ChatCacheDB) Set(hash string, props *ChatCacheProps, expire int64) error {
	return SetCacheDB(hash, props, expire)
}

func SetCacheDB(hash string, props *ChatCacheProps, expire int64) error {
	data := utils.Marshal(props)
	if data == "" {
		return errors.New("marshal error")
	}

	expire = expire * 60 * 12 * 60 * 24
	expire += time.Now().Unix()

	cache := &model.ChatCache{
		Hash:   hash,
		UserId: props.UserId,
		// 创建一个空 JSON
		Data:             "{}",
		Expiration:       expire,
		CreatedAt:        utils.GetTimestamp(),
		ModelName:        props.ModelName,
		ChannelId:        props.ChannelID,
		Request:          utils.Marshal(props.Request),
		Response:         utils.Marshal(props.Response),
		PromptTokens:     props.PromptTokens,
		CompletionTokens: props.CompletionTokens,
	}

	return cache.Insert()
}
