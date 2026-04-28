package main

import (
	"fmt"
	"os"

	"github.com/mark3labs/mcp-go/server"
)

const version = "0.1.0"

func main() {
	c, err := NewClientFromEnv(os.Getenv)
	if err != nil {
		fmt.Fprintln(os.Stderr, "wordpress-mcp:", err)
		fmt.Fprintln(os.Stderr, "Set WORDPRESS_URL, WORDPRESS_USERNAME, and WORDPRESS_APP_PASSWORD before launching.")
		os.Exit(1)
	}

	s := server.NewMCPServer(
		"wordpress-mcp",
		version,
		server.WithToolCapabilities(true),
	)

	registerReadTools(s, c)
	registerWriteTools(s, c)

	if err := server.ServeStdio(s); err != nil {
		fmt.Fprintln(os.Stderr, "wordpress-mcp: stdio server exited:", err)
		os.Exit(1)
	}
}
