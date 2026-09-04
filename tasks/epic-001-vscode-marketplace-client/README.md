# VS Code Marketplace Client

## Outcome

Ship one thin, native Swobu language-model provider as `swobuforge.swobu`, with bundled runtime artifacts and Claude Code/Codex activation through public Swobu seams.

## Governing authority

The accepted implementation choice is this independently versioned repository mounted as the monorepo `/swobu-vscode` submodule. Models are routes; providers and targets stay hidden. Unknown optional capability is disabled. Product Report V2 remains immutable.

## Sequence

| Task | State |
|---|---|
| 000 authority and repository baseline | active |
| 010 provider vertical slice | active |
| 020 platform runtime qualification | blocked on source-bound release binaries |
| 030 installed host/client matrix | blocked on host runners and pinned official client versions |
| 040 Preview publication | blocked on qualified artifacts and explicit publication approval |

## Proof

`make verify` owns deterministic source proof. Installed VSIX, host matrix, and public distribution proofs are separate release gates and may not be represented as green when unavailable.
