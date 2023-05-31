package messages

import (
	"context"
	"encoding/json"
	"messenger/internal/apperror"
	"messenger/internal/handlers"
	"messenger/internal/middleware"
	"messenger/pkg/utils"
	"net/http"
	"strconv"
	"strings"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

type handler struct {
	service *Service
}

func NewHandler(service *Service) handlers.Handler {
	return &handler{service: service}
}

func (h *handler) Register(router *mux.Router) {
	router.HandleFunc("/ws", h.ServeChat).Methods(http.MethodGet, http.MethodOptions)
	router.HandleFunc("/chats/{chatId}/history", middleware.ErrorMiddleware(middleware.AuthMiddleware(h.GetChatHistory))).Methods(http.MethodGet, http.MethodOptions)
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (h *handler) ServeChat(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		w.Write(apperror.ErrInternalError.Marshal())
	}

	_, bytes, err := conn.ReadMessage()
	userData := strings.Split(string(bytes), " ")

	id := userData[0]
	if id == "" {
		w.Write(apperror.ErrUnauthorized.Marshal())
	}
	chatId, err := strconv.Atoi(id)
	if err != nil {
		w.Write(apperror.ErrBadRequest.Marshal())
	}

	token := userData[1]

	if token == "" {
		w.Write(apperror.ErrUnauthorized.Marshal())
	}

	userID, isAuth := utils.IsUserAuthorized(token)

	if !isAuth {
		w.Write(apperror.ErrUnauthorized.Marshal())
	}

	h.service.SendMessageToChat(context.Background(), conn, uint32(chatId), uint32(userID))
}

func (h *handler) GetChatHistory(w http.ResponseWriter, r *http.Request, userId uint32) error {
	page := r.URL.Query().Get("page")
	limit := r.URL.Query().Get("limit")
	params := mux.Vars(r)
	chatId := params["chatId"]
	if page == "" || limit == "" || chatId == "" {
		return apperror.ErrBadRequest
	}
	msgs, err := h.service.GetMessages(context.Background(), page, limit, chatId)
	if err != nil {
		return err
	}
	json.NewEncoder(w).Encode(msgs)
	return nil
}
