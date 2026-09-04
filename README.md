# Swobu for VS Code

Use Swobu routes as native VS Code language models and connect the official Claude Code and Codex extensions without replacing their interfaces.

## Development

Requires Node 20 or newer and VS Code 1.136 or newer. Run `make verify`. Production code has no runtime npm dependencies.

This extension is intentionally thin: it owns VS Code conversion and temporary onboarding only. Swobu owns credentials, routing, retries, failover, usage, and client configuration.

## Privacy

Request content passes through extension memory while being converted and streamed to the local Swobu daemon. The extension does not persist or log prompts, responses, tool arguments, or provider credentials. See [PRIVACY.md](PRIVACY.md).

Swobu is not affiliated with Microsoft, Anthropic, or OpenAI.
