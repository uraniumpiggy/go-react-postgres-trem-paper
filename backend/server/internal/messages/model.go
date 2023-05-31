package messages

import "time"

type Message struct {
	UserId    uint32    `json:"user_id"`
	Username  string    `json:"username"`
	ChatId    uint32    `json:"chat_id"`
	Body      string    `json:"body"`
	CreatedAt time.Time `json:"created_at"`
}
