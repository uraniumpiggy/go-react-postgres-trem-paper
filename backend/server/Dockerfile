FROM golang:alpine as builder

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download 

COPY . .

EXPOSE 8089

CMD ["go", "run", "./cmd/main/main.go"]