# VS Code Marketplace Client

## Outcome

Ship one thin, native Swobu language-model provider as `swobu.swobu`, with one platform-independent VSIX, explicit canonical Swobu installation, and Claude Code/Codex activation through public Swobu seams.

## Governing authority

The superseding authority is `docs/00-inbox/RFC_ Swobu VS Code — Turnkey Release.md`. This independently versioned repository is mounted as the monorepo `/swobu-vscode` submodule. Models are routes; providers and targets stay hidden. The extension never bundles or privately owns Swobu. Tool calling defaults on for Agent visibility; images default off and remain user-overridable.

## Sequence

| Task | State |
|---|---|
| 000 authority and repository baseline | active |
| [010 provider vertical slice](_done/010-provider-vertical-slice.md) | complete — source-level contract proof; installed journey belongs to 020 |
| [020 turnkey release](020-turnkey-release.md) | complete — 0.1.4 qualified on Linux/Windows and published from immutable bytes |
| [030 distribution maximization](030-distribution-maximization.md) | active — image-free 0.1.4 is public; +7/+14 measurement remains |
| 040 public publication | complete — Marketplace and GitHub Release public; public-ID smoke passed; Open VSX stopped after unchanged-artifact functional smoke failed |

## Proof

`make verify` owns deterministic source proof. Installed VSIX, host matrix, authenticated native Agent UI, and public distribution proofs are separate release gates and may not be represented as green when unavailable.
