BINARY := wordpress-mcp
LDFLAGS := -s -w

.PHONY: all build windows linux mac clean tidy vet

all: windows

build:
	go build -trimpath -ldflags="$(LDFLAGS)" -o $(BINARY) .

windows:
	GOOS=windows GOARCH=amd64 go build -trimpath -ldflags="$(LDFLAGS)" -o $(BINARY).exe .

linux:
	GOOS=linux GOARCH=amd64 go build -trimpath -ldflags="$(LDFLAGS)" -o $(BINARY)-linux-amd64 .

mac:
	GOOS=darwin GOARCH=arm64 go build -trimpath -ldflags="$(LDFLAGS)" -o $(BINARY)-darwin-arm64 .

tidy:
	go mod tidy

vet:
	go vet ./...

clean:
	rm -f $(BINARY) $(BINARY).exe $(BINARY)-linux-amd64 $(BINARY)-darwin-arm64
