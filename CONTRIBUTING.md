# Contributing

Use Node.js 22 and VS Code 1.135 or newer.

```sh
npm ci
make check
make verify
```

Run `make integration` when a compatible ordinary Swobu installation is available. Set `SWOBU_TEST_BINARY` to that executable; use `xvfb-run -a` on headless Linux. This lane calls the Language Model API from a test extension. It is integration proof, not a VS Code Chat/Agent end-to-end test.

An Agent E2E must originate in the shipped VS Code Chat/Agent surface, use the
installed Swobu model, and complete a real tool turn and follow-up inference.
Calling `vscode.lm.selectChatModels()` and `model.sendRequest()` from a test
extension cannot satisfy that claim because it bypasses Agent's message-history
construction.

The real UI journey uses a dedicated VS Code profile and an installed VSIX. It
runs unattended through VS Code's stock smoke-test driver and test-token seam;
it does not require or persist a GitHub sign-in:

```sh
make e2e-agent VSIX=./swobu-<version>.vsix
```

`e2e-agent` drives the real Chat view, fails unless its selected model is
sourced from Swobu, requires an Agent tool loop to repair and execute the
fixture, and writes evidence under `test/e2e/agent/_artifacts/`.

Release packaging and publication use the Make targets documented in [Release operations](docs/release.md). Do not rebuild an artifact after qualification.
