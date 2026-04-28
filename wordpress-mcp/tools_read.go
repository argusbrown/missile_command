package main

import (
	"context"
	"fmt"
	"net/url"
	"strconv"

	"github.com/mark3labs/mcp-go/mcp"
	"github.com/mark3labs/mcp-go/server"
)

// readableCollections maps tool name suffix → REST path.
var readableCollections = map[string]string{
	"posts":      "/posts",
	"pages":      "/pages",
	"users":      "/users",
	"categories": "/categories",
	"tags":       "/tags",
}

// registerReadTools adds list_X and get_X tools for each readable collection.
func registerReadTools(s *server.MCPServer, c *Client) {
	for name, path := range readableCollections {
		s.AddTool(buildListTool(name), makeListHandler(c, name, path))
		s.AddTool(buildGetTool(name), makeGetHandler(c, name, path))
	}
}

func buildListTool(name string) mcp.Tool {
	opts := []mcp.ToolOption{
		mcp.WithDescription(fmt.Sprintf("List WordPress %s. Returns the raw REST API JSON array.", name)),
		mcp.WithNumber("page", mcp.Description("Page of results (1-based).")),
		mcp.WithNumber("per_page", mcp.Description("Items per page (1-100, default 10).")),
		mcp.WithString("search", mcp.Description("Free-text search filter.")),
		mcp.WithString("orderby", mcp.Description("Field to order by (e.g. date, id, title, slug).")),
		mcp.WithString("order", mcp.Description("Sort direction: asc or desc.")),
	}
	// posts and pages additionally support filtering by status
	if name == "posts" || name == "pages" {
		opts = append(opts,
			mcp.WithString("status", mcp.Description("Status filter: publish, draft, pending, private, future, or any. Defaults to publish.")),
			mcp.WithString("author", mcp.Description("Comma-separated author IDs.")),
			mcp.WithString("categories", mcp.Description("Comma-separated category IDs (posts only).")),
			mcp.WithString("tags", mcp.Description("Comma-separated tag IDs (posts only).")),
		)
	}
	return mcp.NewTool("list_"+name, opts...)
}

func buildGetTool(name string) mcp.Tool {
	singular := name
	if len(singular) > 0 && singular[len(singular)-1] == 's' {
		singular = singular[:len(singular)-1]
	}
	if name == "categories" {
		singular = "category"
	}
	return mcp.NewTool("get_"+singular,
		mcp.WithDescription(fmt.Sprintf("Fetch a single WordPress %s by numeric ID.", singular)),
		mcp.WithNumber("id", mcp.Description("Resource ID."), mcp.Required()),
	)
}

func makeListHandler(c *Client, name, path string) server.ToolHandlerFunc {
	return func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		args := req.GetArguments()
		q := url.Values{}

		if v, ok := args["page"].(float64); ok && v > 0 {
			q.Set("page", strconv.Itoa(int(v)))
		}
		if v, ok := args["per_page"].(float64); ok && v > 0 {
			q.Set("per_page", strconv.Itoa(int(v)))
		}
		for _, key := range []string{"search", "orderby", "order", "status", "author", "categories", "tags"} {
			if v, ok := args[key].(string); ok && v != "" {
				q.Set(key, v)
			}
		}

		raw, err := c.Get(path, q)
		if err != nil {
			return mcp.NewToolResultErrorFromErr(fmt.Sprintf("list_%s failed", name), err), nil
		}
		return mcp.NewToolResultText(string(raw)), nil
	}
}

func makeGetHandler(c *Client, name, path string) server.ToolHandlerFunc {
	return func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		args := req.GetArguments()
		idF, ok := args["id"].(float64)
		if !ok || idF <= 0 {
			return mcp.NewToolResultError("id is required and must be a positive integer"), nil
		}
		raw, err := c.Get(fmt.Sprintf("%s/%d", path, int(idF)), nil)
		if err != nil {
			return mcp.NewToolResultErrorFromErr(fmt.Sprintf("get %s failed", name), err), nil
		}
		return mcp.NewToolResultText(string(raw)), nil
	}
}
