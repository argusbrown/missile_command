package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

// Client is a thin wrapper around the WordPress REST API.
//
// Authentication uses an Application Password (Users → Profile →
// Application Passwords) sent over HTTP Basic Auth. The site URL must point
// at the WordPress root, e.g. "https://example.com" — the client appends
// "/wp-json/wp/v2/...".
type Client struct {
	BaseURL  string
	Username string
	AppPass  string
	HTTP     *http.Client
}

// NewClientFromEnv builds a Client from environment variables.
func NewClientFromEnv(getenv func(string) string) (*Client, error) {
	base := strings.TrimRight(getenv("WORDPRESS_URL"), "/")
	user := getenv("WORDPRESS_USERNAME")
	pass := getenv("WORDPRESS_APP_PASSWORD")
	if base == "" || user == "" || pass == "" {
		return nil, errors.New("WORDPRESS_URL, WORDPRESS_USERNAME and WORDPRESS_APP_PASSWORD must all be set")
	}
	if _, err := url.Parse(base); err != nil {
		return nil, fmt.Errorf("WORDPRESS_URL is not a valid URL: %w", err)
	}
	return &Client{
		BaseURL:  base,
		Username: user,
		AppPass:  pass,
		HTTP:     &http.Client{Timeout: 30 * time.Second},
	}, nil
}

// apiError is returned for non-2xx HTTP responses.
type apiError struct {
	Status int
	Body   string
}

func (e *apiError) Error() string {
	return fmt.Sprintf("wordpress api error: HTTP %d: %s", e.Status, e.Body)
}

func (c *Client) do(method, path string, query url.Values, body any) ([]byte, http.Header, error) {
	u := c.BaseURL + "/wp-json/wp/v2" + path
	if len(query) > 0 {
		u += "?" + query.Encode()
	}

	var reqBody io.Reader
	if body != nil {
		buf, err := json.Marshal(body)
		if err != nil {
			return nil, nil, fmt.Errorf("marshal body: %w", err)
		}
		reqBody = bytes.NewReader(buf)
	}

	req, err := http.NewRequest(method, u, reqBody)
	if err != nil {
		return nil, nil, err
	}
	req.SetBasicAuth(c.Username, c.AppPass)
	req.Header.Set("Accept", "application/json")
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	resp, err := c.HTTP.Do(req)
	if err != nil {
		return nil, nil, err
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, nil, err
	}
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, nil, &apiError{Status: resp.StatusCode, Body: string(respBody)}
	}
	return respBody, resp.Header, nil
}

// Get performs a GET against /wp-json/wp/v2{path} and returns the raw JSON.
func (c *Client) Get(path string, query url.Values) ([]byte, error) {
	body, _, err := c.do(http.MethodGet, path, query, nil)
	return body, err
}

// Post performs a POST and returns the response JSON.
func (c *Client) Post(path string, payload any) ([]byte, error) {
	body, _, err := c.do(http.MethodPost, path, nil, payload)
	return body, err
}

// GetStatus fetches the "status" field of a single resource. Used to gate
// updates so we never accidentally modify a published item.
func (c *Client) GetStatus(path string) (string, error) {
	raw, err := c.Get(path, nil)
	if err != nil {
		return "", err
	}
	var probe struct {
		Status string `json:"status"`
	}
	if err := json.Unmarshal(raw, &probe); err != nil {
		return "", fmt.Errorf("decode status: %w", err)
	}
	return probe.Status, nil
}
