package main

import (
	"context"
	"fmt"
	"strconv"
	"strings"

	"github.com/mark3labs/mcp-go/mcp"
	"github.com/mark3labs/mcp-go/server"
)

// registerWriteTools adds tools that create or update *drafts* only. Status
// is forced server-side to "draft"; updates refuse to touch resources whose
// current status is "publish" so this binary can never be used to publish.
func registerWriteTools(s *server.MCPServer, c *Client) {
	s.AddTool(
		mcp.NewTool("create_draft_post",
			mcp.WithDescription("Create a new WordPress post as a draft. Status is hard-coded to \"draft\" — this tool cannot publish."),
			mcp.WithString("title", mcp.Description("Post title."), mcp.Required()),
			mcp.WithString("content", mcp.Description("Post content (HTML allowed)."), mcp.Required()),
			mcp.WithString("excerpt", mcp.Description("Optional excerpt.")),
			mcp.WithString("slug", mcp.Description("Optional URL slug.")),
			mcp.WithString("categories", mcp.Description("Comma-separated category IDs.")),
			mcp.WithString("tags", mcp.Description("Comma-separated tag IDs.")),
		),
		makeCreateDraftHandler(c, "/posts", true),
	)

	s.AddTool(
		mcp.NewTool("update_draft_post",
			mcp.WithDescription("Update an existing draft post. Refuses to modify posts whose current status is \"publish\" and never changes status away from draft."),
			mcp.WithNumber("id", mcp.Description("Post ID."), mcp.Required()),
			mcp.WithString("title", mcp.Description("New title.")),
			mcp.WithString("content", mcp.Description("New content (HTML allowed).")),
			mcp.WithString("excerpt", mcp.Description("New excerpt.")),
			mcp.WithString("slug", mcp.Description("New slug.")),
			mcp.WithString("categories", mcp.Description("Comma-separated category IDs.")),
			mcp.WithString("tags", mcp.Description("Comma-separated tag IDs.")),
		),
		makeUpdateDraftHandler(c, "/posts", true),
	)

	s.AddTool(
		mcp.NewTool("create_draft_page",
			mcp.WithDescription("Create a new WordPress page as a draft. Status is hard-coded to \"draft\" — this tool cannot publish."),
			mcp.WithString("title", mcp.Description("Page title."), mcp.Required()),
			mcp.WithString("content", mcp.Description("Page content (HTML allowed)."), mcp.Required()),
			mcp.WithString("excerpt", mcp.Description("Optional excerpt.")),
			mcp.WithString("slug", mcp.Description("Optional URL slug.")),
			mcp.WithNumber("parent", mcp.Description("Parent page ID, if nested.")),
		),
		makeCreateDraftHandler(c, "/pages", false),
	)

	s.AddTool(
		mcp.NewTool("update_draft_page",
			mcp.WithDescription("Update an existing draft page. Refuses to modify pages whose current status is \"publish\" and never changes status away from draft."),
			mcp.WithNumber("id", mcp.Description("Page ID."), mcp.Required()),
			mcp.WithString("title", mcp.Description("New title.")),
			mcp.WithString("content", mcp.Description("New content (HTML allowed).")),
			mcp.WithString("excerpt", mcp.Description("New excerpt.")),
			mcp.WithString("slug", mcp.Description("New slug.")),
			mcp.WithNumber("parent", mcp.Description("Parent page ID.")),
		),
		makeUpdateDraftHandler(c, "/pages", false),
	)
}

// parseIDList converts a comma-separated string of integers to []int. Empty
// or whitespace-only entries are skipped; non-numeric entries return an error.
func parseIDList(s string) ([]int, error) {
	if strings.TrimSpace(s) == "" {
		return nil, nil
	}
	parts := strings.Split(s, ",")
	out := make([]int, 0, len(parts))
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p == "" {
			continue
		}
		n, err := strconv.Atoi(p)
		if err != nil {
			return nil, fmt.Errorf("invalid id %q: %w", p, err)
		}
		out = append(out, n)
	}
	return out, nil
}

func makeCreateDraftHandler(c *Client, path string, isPost bool) server.ToolHandlerFunc {
	return func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		args := req.GetArguments()
		title, _ := args["title"].(string)
		content, _ := args["content"].(string)
		if strings.TrimSpace(title) == "" || strings.TrimSpace(content) == "" {
			return mcp.NewToolResultError("title and content are required"), nil
		}

		payload := map[string]any{
			"title":   title,
			"content": content,
			"status":  "draft", // hard-coded; cannot be overridden by caller
		}
		if v, ok := args["excerpt"].(string); ok && v != "" {
			payload["excerpt"] = v
		}
		if v, ok := args["slug"].(string); ok && v != "" {
			payload["slug"] = v
		}

		if isPost {
			if v, ok := args["categories"].(string); ok && v != "" {
				ids, err := parseIDList(v)
				if err != nil {
					return mcp.NewToolResultErrorFromErr("invalid categories", err), nil
				}
				payload["categories"] = ids
			}
			if v, ok := args["tags"].(string); ok && v != "" {
				ids, err := parseIDList(v)
				if err != nil {
					return mcp.NewToolResultErrorFromErr("invalid tags", err), nil
				}
				payload["tags"] = ids
			}
		} else {
			if v, ok := args["parent"].(float64); ok && v > 0 {
				payload["parent"] = int(v)
			}
		}

		raw, err := c.Post(path, payload)
		if err != nil {
			return mcp.NewToolResultErrorFromErr("create draft failed", err), nil
		}
		return mcp.NewToolResultText(string(raw)), nil
	}
}

func makeUpdateDraftHandler(c *Client, path string, isPost bool) server.ToolHandlerFunc {
	return func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		args := req.GetArguments()
		idF, ok := args["id"].(float64)
		if !ok || idF <= 0 {
			return mcp.NewToolResultError("id is required and must be a positive integer"), nil
		}
		id := int(idF)
		itemPath := fmt.Sprintf("%s/%d", path, id)

		// Refuse to touch anything that is currently published. WordPress's
		// edit endpoint would otherwise happily mutate live content.
		status, err := c.GetStatus(itemPath)
		if err != nil {
			return mcp.NewToolResultErrorFromErr("could not check current status", err), nil
		}
		if status == "publish" {
			return mcp.NewToolResultError(fmt.Sprintf("refusing to modify id %d: current status is \"publish\". This tool only edits drafts.", id)), nil
		}

		payload := map[string]any{
			"status": "draft", // pin status to draft, never publish
		}
		if v, ok := args["title"].(string); ok && v != "" {
			payload["title"] = v
		}
		if v, ok := args["content"].(string); ok && v != "" {
			payload["content"] = v
		}
		if v, ok := args["excerpt"].(string); ok && v != "" {
			payload["excerpt"] = v
		}
		if v, ok := args["slug"].(string); ok && v != "" {
			payload["slug"] = v
		}

		if isPost {
			if v, ok := args["categories"].(string); ok && v != "" {
				ids, err := parseIDList(v)
				if err != nil {
					return mcp.NewToolResultErrorFromErr("invalid categories", err), nil
				}
				payload["categories"] = ids
			}
			if v, ok := args["tags"].(string); ok && v != "" {
				ids, err := parseIDList(v)
				if err != nil {
					return mcp.NewToolResultErrorFromErr("invalid tags", err), nil
				}
				payload["tags"] = ids
			}
		} else {
			if v, ok := args["parent"].(float64); ok && v >= 0 {
				payload["parent"] = int(v)
			}
		}

		raw, err := c.Post(itemPath, payload)
		if err != nil {
			return mcp.NewToolResultErrorFromErr("update draft failed", err), nil
		}
		return mcp.NewToolResultText(string(raw)), nil
	}
}
