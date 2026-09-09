# Changelog

## 0.1.5

- Accept VS Code Agent continuation state in its actual embedded assistant-response shape.
- Accept VS Code Agent's empty-name sentinel on tool-result messages without erasing real named-participant identity.
- Accept standard Responses API reasoning lifecycle items while continuing to stream visible answer text and tool calls.
- Preserve Swobu's structured error explanation in the error shown by VS Code instead of reducing it to an HTTP status.
- Correctly classify the test-extension Language Model API lane as integration testing, not Agent E2E.

## 0.1.4

- Support VS Code and compatible Open VSX clients from version 1.135 onward.

No extension runtime behavior changed from 0.1.3.

## 0.1.3

Marketplace and documentation refresh:

- clearer VS Code BYOK positioning
- improved discovery metadata
- refreshed icon presentation
- improved setup and provider documentation
- protocol-based Swobu compatibility and actionable recovery prompts
- VS Code Agent system-message and multi-turn response-continuation support

No Swobu core behavior changed.

## 0.1.2

- Preview implementation of the native Swobu language-model provider and Claude Code/Codex connection commands.
- Wait for the harness-owned Swobu process to exit before deleting its Windows runtime home.

## 0.1.1

- Unpublished candidate; its retry applied to the outer extension-start home,
  while Windows exposed the lock in the harness-owned attach daemon.

## 0.1.0

- Unpublished candidate; Windows qualification exposed runtime-lock teardown latency.
