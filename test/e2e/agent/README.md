# VS Code Agent journey

## Intent

Prove the installed Swobu VSIX through the shipped VS Code Chat/Agent UI. The
journey protects the request grammar that only VS Code's Agent orchestration
creates, including tool calls, tool results, and continuation state.

## Actor

The actor is a stock VS Code desktop process driven through its rendered UI.
The harness installs the supplied VSIX into a dedicated profile. A test
extension is not installed and the Language Model API is not called directly.
The selected route may use any backend model; model identity is not an
acceptance requirement.

The journey is unattended. It uses VS Code 1.135's shipped smoke-test driver
and unsafe test-token seam to satisfy Agent Host protected-resource setup while
remaining signed out. GitHub and Copilot endpoints are redirected to a hostile
loopback server; any inference request reaching that server fails the test.
This test-only setup bypasses account enrollment, not Agent orchestration, the
BYOK bridge, or the installed Swobu provider.

The harness defaults to the `local/local` Swobu route. A machine with another
known-healthy route may select it without changing the scenario:

```sh
make e2e-agent VSIX=./swobu.vsix \
  SWOBU_VSCODE_E2E_WORKSPACE=personal \
  SWOBU_VSCODE_E2E_ROUTE=code
```

The workspace and route are readiness inputs, not model-behavior branches. The
same rendered Agent journey and assertions run for every selected route.

## Required proof surfaces

- Chat is visibly in Agent mode with the requested route selected. Stock RPC
  tracing must correlate that selection with an acknowledged
  `ExtHostChatProvider.$startChatRequest` for the exact
  `swobu/<workspace>/<route>` identifier.
- Agent repairs `calculator.js` by using workspace tools.
- Agent visibly runs `node calculator.test.js`, completes its verification
  step, and renders `SWOBU_VSCODE_AGENT_E2E_PASS` as command output.
- The repaired file and successful test are independently checked after the UI
  journey.
- At least two Agent-sized provider requests have matching RPC acknowledgments,
  response parts, and terminal completion, proving tool-result continuation.
- The hostile CAPI server receives bootstrap traffic but no inference request.

## Forbidden shortcuts

- `vscode.lm.selectChatModels()` or `model.sendRequest()` from test code.
- A hand-authored request to Swobu.
- silently accepting VS Code's default/Copilot model.
- pre-editing the fixture or treating source/unit checks as this journey.

## Scenario inventory

- `repair-and-verify`: failing arithmetic implementation, Agent edit, terminal
  test execution, successful continuation.

## Out of scope

Provider-specific model identity and Swobu routing internals. The selected
Swobu route is the client contract; the route may change capacity underneath.
