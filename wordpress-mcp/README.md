# wordpress-mcp

A small [Model Context Protocol](https://modelcontextprotocol.io) server, written
in Go, that talks to the WordPress REST API.

It exposes **read** access to posts, pages, users, categories and tags, and
**draft-only write** access for posts and pages. The server is hard-wired so
that no tool can ever publish content: every write payload pins
`status: "draft"`, and updates refuse to touch any item whose current status is
`publish`.

## Build

A Windows `.exe` is the default target:

```sh
make            # produces wordpress-mcp.exe (windows/amd64)
make linux      # wordpress-mcp-linux-amd64
make mac        # wordpress-mcp-darwin-arm64
make build      # native binary for the current platform
```

Or directly:

```sh
GOOS=windows GOARCH=amd64 go build -trimpath -ldflags="-s -w" -o wordpress-mcp.exe .
```

## Configure

The binary reads three environment variables:

| Variable                  | Example                          |
| ------------------------- | -------------------------------- |
| `WORDPRESS_URL`           | `https://example.com`            |
| `WORDPRESS_USERNAME`      | `editor-bot`                     |
| `WORDPRESS_APP_PASSWORD`  | `xxxx xxxx xxxx xxxx xxxx xxxx`  |

Generate the app password from **Users → Profile → Application Passwords** in
the WordPress admin. Spaces in the displayed value are part of the password.

## Run as an MCP server

The binary speaks MCP over stdio. To use it from a client (Claude Desktop,
Claude Code, etc.), register it like this:

```json
{
  "mcpServers": {
    "wordpress": {
      "command": "C:\\path\\to\\wordpress-mcp.exe",
      "env": {
        "WORDPRESS_URL": "https://example.com",
        "WORDPRESS_USERNAME": "editor-bot",
        "WORDPRESS_APP_PASSWORD": "xxxx xxxx xxxx xxxx xxxx xxxx"
      }
    }
  }
}
```

## Tools

### Read

| Tool              | Description                                  |
| ----------------- | -------------------------------------------- |
| `list_posts`      | Filter by status/search/author/categories/tags, paginate |
| `get_post`        | Fetch a single post by id                    |
| `list_pages`      | Filter by status/search/author, paginate     |
| `get_page`        | Fetch a single page by id                    |
| `list_users`      | Search/paginate users                        |
| `get_user`        | Fetch a single user by id                    |
| `list_categories` | Search/paginate categories                   |
| `get_category`    | Fetch a single category by id                |
| `list_tags`       | Search/paginate tags                         |
| `get_tag`         | Fetch a single tag by id                     |

All read tools return the raw WordPress REST JSON.

### Write (draft only)

| Tool                 | Description                                   |
| -------------------- | --------------------------------------------- |
| `create_draft_post`  | Create a post with `status=draft`             |
| `update_draft_post`  | Update an existing draft post                 |
| `create_draft_page`  | Create a page with `status=draft`             |
| `update_draft_page`  | Update an existing draft page                 |

Update tools first GET the resource and refuse to proceed if its current
status is `publish`. They also pin `status: "draft"` in the update payload.
