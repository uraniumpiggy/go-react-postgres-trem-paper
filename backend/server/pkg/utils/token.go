package utils

import (
	"fmt"

	"github.com/golang-jwt/jwt"
)

func IsUserAuthorized(userToken string) (float64, bool) {
	token, err := jwt.Parse(userToken, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("There was an error in parsing")
		}
		return []byte("SecretYouShouldHide"), nil
	})

	if err != nil {
		return 0, false
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !(ok && token.Valid) {
		return 0, false
	}

	userId := claims["user_id"].(float64)

	return userId, true
}
