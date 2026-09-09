# [Swobu](https://swobu.com/) — LLM Router for VS Code, Claude Code & Codex

**Use VS Code Agent with your own model providers. Keep the client. Swap the backend.**

Put OpenRouter, Ollama, Bedrock, Azure, local models or other capacity behind one stable Swobu route. Change providers or fail over without changing the model selected in VS Code.

VS Code BYOK supports Agent/chat without a GitHub Copilot plan. Inline completions and semantic-search features are separate.

## Native in VS Code

Swobu routes appear in Chat and Agent as native models. Open **Manage Language Models**, choose **Swobu**, and select a route such as `code`.

Models contributed through a `LanguageModelChatProvider` can also be consumed by other VS Code extensions through the Language Model API.

## One route, multiple clients

```text
VS Code      → Swobu route
Claude Code  → same Swobu
Codex        → same Swobu
```

## Why Swobu

Direct provider configuration couples the client to capacity. Swobu keeps the client-facing route stable and moves provider selection, balancing and fallback underneath it.

**The `code` route stays selected while Swobu recovers through another target.**

## Get started

1. Install [Swobu for VS Code](https://marketplace.visualstudio.com/items?itemName=swobu.swobu) and run **Swobu: Set Up**.
2. Create a Swobu route with your model capacity.
3. Select the route in **Manage Language Models** and give Agent a task.

## Popular setups

- [VS Code Agent with Ollama or another local model](https://swobu.com/docs/providers/ollama/?utm_source=swobu_vscode&utm_medium=referral&utm_campaign=vscode_extension)
- [VS Code Agent with OpenRouter](https://swobu.com/docs/providers/openrouter/?utm_source=swobu_vscode&utm_medium=referral&utm_campaign=vscode_extension)
- [Connect Claude Code through Swobu](https://swobu.com/docs/guides/claude-code-ollama/?utm_source=swobu_vscode&utm_medium=referral&utm_campaign=vscode_extension)
- [Connect Codex through Swobu](https://swobu.com/docs/clients/connect/?utm_source=swobu_vscode&utm_medium=referral&utm_campaign=vscode_extension)
- [Keep a route available with provider fallback](https://swobu.com/docs/routing/fallback/?utm_source=swobu_vscode&utm_medium=referral&utm_campaign=vscode_extension)

## Trust

- The [extension source is open](https://github.com/swobuforge/swobu-vscode).
- Provider credentials remain in Swobu.
- The VSIX contains no Swobu executable.
- Request content exists transiently in extension memory but is not independently persisted or logged by the extension.

See [Privacy](PRIVACY.md) and [Security](SECURITY.md).

## FAQ

### Do I need a Copilot plan?

No. VS Code supports BYOK models in Agent and chat without a GitHub Copilot plan. Inline completions and semantic-search features are separate.

### Can I use local models?

Yes. Add Ollama, LM Studio, vLLM, llama.cpp or another compatible local endpoint to a Swobu route, then select that route in VS Code.

### Does this replace Claude Code or Codex?

No. The extension can connect their official clients to the same Swobu installation and routes.

### Where are provider keys stored?

In Swobu, not this extension. The extension talks to your ordinary Swobu runtime.

### Can it work offline with local capacity?

Yes, when the selected Swobu route uses reachable local capacity. VS Code or other extensions may still use their own online services.

## For VS Code extension authors

Swobu routes are normal VS Code language models.

```ts
const models = await vscode.lm.selectChatModels({
  vendor: "swobu"
});
```

Extensions using the standard Language Model API can consume the user's Swobu routes instead of implementing another provider stack.

## Languages

[English](README.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [Português](README.pt-BR.md) · [Bahasa Indonesia](README.id.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Deutsch](README.de.md) · [Français](README.fr.md) · [Русский](README.ru.md) · [Українська](README.uk.md)

## Support and license

[Report an issue](https://github.com/swobuforge/swobu-vscode/issues) with your VS Code version, platform and error message. Omit credentials and private request content.

Extension source is [MIT licensed](LICENSE). Swobu is installed and licensed separately. Swobu is not affiliated with Microsoft, Anthropic or OpenAI.

Using Swobu successfully? A [Marketplace rating](https://marketplace.visualstudio.com/items?itemName=swobu.swobu&ssr=false#review-details) helps other developers judge it.
