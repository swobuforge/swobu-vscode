# Provider vertical slice

## Bounded outcome

A VS Code Agent can select a Swobu route by default, run a two-turn interaction with parallel tools through the existing Responses facade, preserve adversarially chunked UTF-8, cancel in flight, and produce truthful `vscode` client evidence while Swobu retains fallback ownership.

## Governing authority

- VS Code Marketplace Acquisition and First-Class Swobu Client RFC
- Swobu protocol wire/canonical adapter pipeline
- Product telemetry immutable contract evolution
- Fault-plane ownership and completion law

## Failure witnesses retained

- Missing message `type`, assistant `input_text`, and nested function items diverged from the exact Responses history grammar.
- A decoder per network chunk corrupted split UTF-8; selecting the last inserted call cross-wired interleaved tool deltas.
- Byte-array JSON made image estimates scale with image size.
- Omitted `--addr` could inspect one daemon and configure another.
- `toolCalling=false` hid every default route from VS Code Agent model selection.
- Mapping `vscode` to `other` erased the acquisition channel.

## Acceptance and proof

- Deterministic request fixture proves exact two-turn, two-call top-level history.
- One-byte SSE chunks prove UTF-8 and output-index correlation.
- Model projection proves tool support defaults true and image support false.
- Token fixture proves image accounting is size-independent and bounded.
- Endpoint fixture proves loopback-only origins and exact daemon address.
- ProductReportV3 ingest fixture admits `vscode`; frozen V2 rejects it; OpenCore emits V3 with the same family.
- Extension `make verify`, ingest API tests, and focused OpenCore tests pass.

## Not done

Runtime binaries, VSIX isolation, installed host/client journeys, acquisition copy, and publication remain later gates.

## Closure — 2026-09-05

Ordered tool output now retains adjacent text boundaries and text/image/text parts using the existing Responses grammar. Shared initialization has its own lifetime; cancellation rejects only that caller's wait, including already-cancelled callers. Both new repros failed before the changes and passed afterward.

Proof: extension `npm run verify` passes 15 tests, strict types, lint, ownership checks and build. Ingest typecheck and 37 tests pass. The historical Go tests now live in the private swobucli tree: `SWOBU_TEST_PACKAGES='./internal/domain/trafficevidence ./internal/producttelemetry' make -C swobucli test` passes both full package suites, including the producer golden and family projection.

`node scripts/checkpoint.mjs` creates a private, self-contained cross-repo checkpoint under `checkpoint/010`: base commits, dirty paths, selected patches, source/test copies, SHA-256 hashes and proof commands. These private platform files are excluded from Git and VSIX; the handover archive must explicitly include them. Nothing here asserts that V3 is deployed; ingest must ship before a V3-emitting runtime is released.

Retrospective: exact ordered-part fixtures and concurrent waiter cancellation caught both defects without expanding protocol architecture. Source proof is complete; a stub-based provider test is not an installed VS Code journey. Next: 020 pinned runtime, isolated VSIX, AGPL source/license conveyance, clean installation and a real routed request.
