package middleware

import (
	"errors"
	"fmt"
	"github.com/gorilla/mux"
	"messenger/internal/apperror"
	"messenger/pkg/utils"
	"net/http"
	"strconv"

	"github.com/gorilla/websocket"
)

type appErrorHandler func(w http.ResponseWriter, r *http.Request) error
type authHandler func(w http.ResponseWriter, r *http.Request, userId uint32) error
type appWsHandler func(*websocket.Conn, uint32, uint32) error

func AuthMiddleware(h authHandler) appErrorHandler {
	return func(w http.ResponseWriter, r *http.Request) error {
		if r.Header["Token"] == nil {
			return apperror.ErrUnauthorized
		}

		userID, isAuth := utils.IsUserAuthorized(r.Header["Token"][0])

		if !isAuth {
			return apperror.ErrUnauthorized
		}

		err := h(w, r, uint32(userID))
		return err
	}
}

func ErrorMiddleware(h appErrorHandler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		var appError *apperror.AppError
		err := h(w, r)
		if err != nil {
			if errors.As(err, &appError) {
				if errors.Is(err, apperror.ErrNotFound) {
					w.WriteHeader(http.StatusNotFound)
					w.Write(apperror.ErrNotFound.Marshal())
					return
				} else if errors.Is(err, apperror.ErrBadRequest) {
					w.WriteHeader(http.StatusBadRequest)
					w.Write(apperror.ErrBadRequest.Marshal())
					return
				} else if errors.Is(err, apperror.ErrPermissionDenied) {
					w.WriteHeader(http.StatusForbidden)
					w.Write(apperror.ErrPermissionDenied.Marshal())
					return
				} else if errors.Is(err, apperror.ErrUnauthorized) {
					w.WriteHeader(http.StatusUnauthorized)
					w.Write(apperror.ErrUnauthorized.Marshal())
					return
				} else if errors.Is(err, apperror.ErrInternalError) {
					w.WriteHeader(http.StatusInternalServerError)
					w.Write(apperror.ErrInternalError.Marshal())
					return
				}
			}
			w.WriteHeader(500)
			w.Write(apperror.ErrInternalError.Marshal())
			return
		}
	}
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func WsMiddleware(h appWsHandler) authHandler {
	return func(w http.ResponseWriter, r *http.Request, userId uint32) error {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			return err
		}
		id := r.Header["chatId"][0]
		if id == "" {
			return fmt.Errorf("Some err")
		}
		chatId, err := strconv.Atoi(id)
		if err != nil {
			return err
		}
		err = h(conn, uint32(chatId), userId)
		return err
	}
}

func CorsMiddleware() mux.MiddlewareFunc {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
			w.Header().Set("Access-Control-Allow-Methods", "DELETE, POST, GET, OPTIONS")
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Token, Accept, Origin, chatId")

			if req.Method == http.MethodOptions {
				w.WriteHeader(http.StatusOK)
				return
			}

			next.ServeHTTP(w, req)
		})
	}
}
