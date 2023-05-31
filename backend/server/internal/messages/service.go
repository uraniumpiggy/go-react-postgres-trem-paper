package messages

import (
	"context"
	"errors"
	"messenger/internal/apperror"
	"strconv"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type Service struct {
	mutex       sync.RWMutex
	connections map[uint32]map[uint32]*websocket.Conn
	storage     Storage
}

func NewService(storage Storage) *Service {
	return &Service{
		mutex:       sync.RWMutex{},
		connections: make(map[uint32]map[uint32]*websocket.Conn),
		storage:     storage,
	}
}

func (s *Service) SendMessageToChat(ctx context.Context, conn *websocket.Conn, chatId, userId uint32) error {
	isCorrectUser, err := s.storage.IsUserInChat(ctx, userId, chatId)
	if err != nil {
		return apperror.ErrInternalError
	}
	if !isCorrectUser {
		return apperror.ErrPermissionDenied
	}
	disconnect := make(chan struct{})

	s.mutex.Lock()

	_, ok := s.connections[chatId]
	if !ok {
		s.connections[chatId] = make(map[uint32]*websocket.Conn)
		s.connections[chatId][userId] = conn
	} else {
		s.connections[chatId][userId] = conn
	}

	s.mutex.Unlock()
	defer func() {
		s.mutex.Lock()
		for id, _ := range s.connections[chatId] {
			if id == userId {
				delete(s.connections[chatId], userId)
				break
			}
		}
		if len(s.connections[chatId]) == 0 {
			delete(s.connections, chatId)
		}
		s.mutex.Unlock()
	}()
	go func() {
		for {
			_, message, err := conn.ReadMessage()
			if err != nil {
				disconnect <- struct{}{}
				break
			}

			username, err := s.storage.GetUsername(ctx, userId)
			if err != nil {
				username = "Undefined"
			}

			msg := &Message{
				ChatId:    chatId,
				UserId:    userId,
				Username:  username,
				Body:      string(message),
				CreatedAt: time.Now(),
			}

			err = s.storage.SaveMessage(ctx, msg)
			if err != nil {
				if errors.Is(err, apperror.ErrPermissionDenied) {
					conn.Close()
				}
			}

			for _, c := range s.connections[chatId] {
				c.WriteJSON(msg)
			}
		}
	}()

	select {
	case <-disconnect:
		return nil
	}
}

func (s *Service) GetMessages(ctx context.Context, page, limit, chatId string) ([]*Message, error) {
	nPage, err1 := strconv.ParseUint(page, 10, 32)
	nLimit, err2 := strconv.ParseUint(limit, 10, 32)
	nChatId, err3 := strconv.ParseUint(chatId, 10, 32)

	if err1 != nil || err2 != nil || err3 != nil {
		return nil, apperror.ErrBadRequest
	}

	if nPage < 0 || nLimit < 0 || nChatId < 0 {
		return nil, apperror.ErrBadRequest
	}

	offset := (nPage - 1) * nLimit
	messages, err := s.storage.GetMessages(ctx, uint32(nLimit), uint32(offset), uint32(nChatId))
	if err != nil {
		return nil, err
	}
	return messages, nil
}
