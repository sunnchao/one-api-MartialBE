package notify

import (
	"context"
	"fmt"
	"one-api/common"
)

func (n *Notify) Send(ctx context.Context, title, message string, notifier string) {
	if ctx == nil {
		ctx = context.Background()
	}

	for channelName, channel := range n.notifiers {
		if channel == nil {
			continue
		}
		if notifier != "" {
			if channelName != notifier {
				continue
			}
		}
		err := channel.Send(ctx, title, message)
		if err != nil {
			common.LogError(ctx, fmt.Sprintf("%s err: %s", channelName, err.Error()))
		}
	}
}

func Send(params ...string) {
	//lint:ignore SA1029 reason: 需要使用该类型作为错误处理
	ctx := context.WithValue(context.Background(), common.RequestIdKey, "NotifyTask")
	title := params[0]
	message := params[1]
	notifier := params[2]
	notifyChannels.Send(ctx, title, message, notifier)
}
