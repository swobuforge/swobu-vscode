[English](README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [Português](README.pt-BR.md) | [Bahasa Indonesia](README.id.md) | [한국어](README.ko.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Русский](README.ru.md) | [Українська](README.uk.md)

# [Swobu](https://swobu.com/) — VS Code 的 LLM 路由器与模型提供程序

保留熟悉的编程流程，自主选择背后的模型资源。

将 Swobu 路由用作 VS Code 原生模型，或连接 Claude Code 和 Codex，同时保留它们的官方界面。在 Swobu 中配置一次提供商和备用方案；底层模型变化时，仍可选择同一条路由。

从 [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=swobu.swobu) 安装扩展，或在 VS Code 中搜索 `swobu.swobu`。同一个平台无关软件包支持本地、WSL、Remote SSH 和开发容器扩展主机。

## 在 VS Code 中使用模型

打开 **Manage Language Models**，选择 **Swobu**，然后选择路由。Swobu 负责提供商选择和故障转移。默认启用工具调用，让路由可用于 VS Code Agent。

## 保留 Claude Code 和 Codex

运行 **Swobu: Connect Claude Code** 或 **Swobu: Connect Codex**，选择工作区，随后继续使用官方界面。Swobu 现有的连接命令负责配置和安全替换。

## 为什么使用路由？

提供商切换器改变编辑器中的模型。路由则让你在一个稳定的模型选项背后更换资源、设置备用方案。保留客户端，将提供商决策交给 Swobu。

## 开始使用

1. 打开 **Swobu: Set Up**，配置模型访问。
2. 为编程任务创建路由。
3. 在 **Manage Language Models** 中选择它，然后让 Agent 读取一个文件。
4. 打开 **Swobu: Open**，查看路由后的请求流量。

## 模型设置

运行 **Swobu: Configure Model** 并选择路由。图像和工具调用支持 **Default**、**On**、**Off**。上下文和输出限制提供预设值，也可输入自定义正整数。**Reset overrides** 立即恢复默认值，无需重启。

默认值：工具开启、图像关闭，输入 32,768 tokens，输出 4,096 tokens。这是你控制的客户端能力声明，不是对底层模型的自动检测。仅对支持图像的路由启用图像。

## 提供商与工作方式

在 Swobu 中配置可用资源，例如 OpenRouter、Ollama、Bedrock、Azure 和兼容 OpenAI 的端点。凭据保留在 Swobu 中。VS Code 将请求发送到本地 Swobu 进程，由其管理连接、重试、故障转移和用量。扩展将路由显示为模型，并流式返回响应。

## 隐私与安全

请求、响应和工具内容会暂时经过扩展内存。扩展不会保存或记录这些内容，也没有独立的遥测上传程序。Swobu 运行时遵循自身的隐私设置。详见 [PRIVACY.md](PRIVACY.md) 和 [SECURITY.md](SECURITY.md)。

## 远程、WSL 和容器

扩展运行于工作区扩展宿主。回环端点指向该宿主：远程工作区应在远程端配置 Swobu。平台软件包资格验证和安装测试是发布前提。

## 故障排查

更改路由后运行 **Swobu: Refresh Models**。若 Swobu 不可用，请检查机器级端点设置。允许替换配置前，先查看连接命令的输出。

[报告问题](https://github.com/swobuforge/swobu-vscode/issues)时，请提供 VS Code 版本、平台和错误信息，不要附带凭据或私密请求内容。

## 开发与许可

需要 Node 22 和 VS Code 1.135 或更新版本。运行 `npm ci`、`npm test`、`npm run build`、`npm run package`。有兼容的普通 Swobu 安装时还应运行 `npm run test:integration`；Linux 无显示环境下使用 `xvfb-run -a`。

扩展源码：[MIT](LICENSE)。Swobu 单独安装并适用其自身许可；VSIX 不包含 Swobu 可执行文件。Swobu 与 Microsoft、Anthropic 或 OpenAI 无关联。
