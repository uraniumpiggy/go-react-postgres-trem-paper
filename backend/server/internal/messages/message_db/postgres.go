package messagesdb

import (
	"context"
	"database/sql"
	"messenger/internal/apperror"
	"messenger/internal/messages"
)

type db struct {
	*sql.DB
}

func NewStorage(database *sql.DB) *db {
	return &db{database}
}

func (d *db) IsUserInChat(ctx context.Context, userId, chatId uint32) (bool, error) {
	var count int
	err := d.QueryRowContext(ctx, `select count(user_id) from users_chats where user_id = $1 and chat_id = $2`, userId, chatId).Scan(&count)
	if err != nil {
		return false, err
	}
	if count == 0 {
		return false, nil
	}
	return true, nil
}

func (d *db) SaveMessage(ctx context.Context, data *messages.Message) error {
	var count int
	err := d.QueryRowContext(ctx, `select count(user_id) from users_chats where user_id = $1 and chat_id = $2`, data.UserId, data.ChatId).Scan(&count)
	if err != nil {
		return err
	}
	if count == 0 {
		return apperror.ErrPermissionDenied
	}

	_, err = d.ExecContext(ctx, `insert into messages (user_id, chat_id, body) values ($1, $2, $3)`, data.UserId, data.ChatId, data.Body)
	return err
}

func (d *db) GetMessages(ctx context.Context, limit, offset, chat_id uint32) ([]*messages.Message, error) {
	res := make([]*messages.Message, 0)
	rows, err := d.QueryContext(ctx, `select u.username, m.user_id, m.chat_id, m.body, m.created_at from messages as m join users u on u.id = m.user_id where chat_id = $1 order by created_at desc limit $2 offset $3`, chat_id, limit, offset)
	defer rows.Close()
	if err != nil {
		return nil, err
	}

	for rows.Next() {
		message := &messages.Message{}
		if err := rows.Scan(&message.Username, &message.UserId, &message.ChatId, &message.Body, &message.CreatedAt); err != nil {
			return nil, err
		}
		res = append(res, message)
	}

	return res, nil
}

func (d *db) GetUsername(ctx context.Context, userID uint32) (string, error) {
	var res string

	err := d.QueryRowContext(ctx, `select username from users where id = $1`, userID).Scan(&res)

	return res, err
}
