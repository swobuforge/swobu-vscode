[English](README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [Português](README.pt-BR.md) | [Bahasa Indonesia](README.id.md) | [한국어](README.ko.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Русский](README.ru.md) | [Українська](README.uk.md)

# [Swobu](https://swobu.com/) — LLM Router & Model Provider for VS Code

Keep your coding workflow. Choose the model capacity behind it.

Use a Swobu route as a native VS Code model, or connect Claude Code and Codex while keeping their official interfaces. Configure providers and fallback once in Swobu; keep selecting the same route when the model underneath changes.

Install the Preview from the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=swobu.swobu), or search for `swobu.swobu` in VS Code. One platform-independent package supports local, WSL, Remote SSH, and dev-container extension hosts.

## Use your Swobu routes as VS Code models

Open **Manage Language Models**, choose **Swobu**, and select a route. Your route name stays stable while Swobu handles provider selection and fallback. Tool calling is enabled by default for VS Code Agent.

![Select the Swobu route named code in VS Code.](assets/screenshots/model-picker.png)

## Keep Claude Code, change capacity underneath

Run **Swobu: Connect Claude Code**, choose a route workspace, and continue in the official Claude Code interface. Swobu's existing connection command handles configuration and replacement safety.

## Keep Codex, change capacity underneath

Run **Swobu: Connect Codex** and choose a workspace. Continue using Codex with requests routed through the same local Swobu endpoint.

## Why routes instead of another provider switcher?

A provider switcher changes the model in your editor. A route lets you change capacity or configure fallback behind one model selection. Keep the client and move the provider decision into Swobu.

![A planned primary failure completes through an OpenAI fallback target.](assets/screenshots/fallback-proof.png)

## Get started

1. Open **Swobu: Set Up**. If Swobu is absent, the extension offers the official installer; otherwise it opens the ordinary shared Swobu installation.
2. Create a route for your coding workflow.
3. Select it in **Manage Language Models**, then ask the Agent to read a file.
4. Open **Swobu: Open** to inspect the resulting routed traffic.

## Model settings

Run **Swobu: Configure Model** and choose your route. Images and tool calling have **Default**, **On**, and **Off** choices. Context and output limits offer presets and a custom positive integer. **Reset overrides** restores defaults immediately, without reloading VS Code.

Defaults: tools on, images off, 32,768 input tokens, 4,096 output tokens. These are client-facing advertisements you control—not automatic detection of the model under a route. Enable images only for a route with image-capable capacity.

## Supported providers / examples

Configure available capacity in Swobu, including OpenRouter, Ollama, Bedrock, Azure, and OpenAI-compatible endpoints. Keep provider credentials in Swobu rather than in the extension.

## How it works

VS Code sends requests to the local Swobu runtime. Swobu owns provider connections, retries, fallback and usage. The extension projects routes as models and streams the result back into VS Code.

## Privacy & security

Prompts, responses and tool content pass through extension memory during requests. The extension does not persist or log that content and has no separate telemetry uploader. Swobu's own privacy and telemetry settings apply to its runtime. See [PRIVACY.md](PRIVACY.md) and [SECURITY.md](SECURITY.md).

## Remote / WSL / container behavior

The extension runs on the workspace extension host. Its loopback endpoint refers to that host: in a remote workspace, configure Swobu on the remote side. Installation is always explicit on that host. The same platform-independent extension package is used locally, in WSL, over Remote SSH, and in dev containers.

## Troubleshooting

Use **Swobu: Refresh Models** after changing routes. Check the machine-scoped endpoint if the runtime is unavailable. For connection errors, inspect the Swobu connection output before allowing replacement.

[Report an issue](https://github.com/swobuforge/swobu-vscode/issues) with your VS Code version, platform and the error message; omit credentials and private request content.

## Development

Use Node 22 and VS Code 1.136 or newer. Run `npm ci`, `npm test`, `npm run build`, and `npm run package`. Run `npm run test:integration` too (under `xvfb-run -a` on headless Linux) when a compatible ordinary Swobu installation is available.

## License

Extension source: [MIT](LICENSE). Swobu is installed and licensed separately; the VSIX contains no Swobu executable.

Swobu is not affiliated with Microsoft, Anthropic or OpenAI.
