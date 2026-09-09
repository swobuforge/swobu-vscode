# Maximize VS Code distribution

## Outcome

- Problem and affected actor: developers looking for VS Code Agent BYOK and
  provider fallback cannot recover Swobu's value quickly from Marketplace or
  adjacent Swobu surfaces.
- User-requested end state: publish acquisition-focused `0.1.3`, correct its
  unjustified VS Code engine floor in immutable follow-up `0.1.4`, then measure
  distribution at baseline, +7 days, and +14 days.
- Non-goals: Swobu core, provider/request behavior, commands, UI, onboarding,
  telemetry, or routing. Authorized exception: protocol-only compatibility
  gating and owned mismatch presentation replace the incorrect version gate;
  dogfooding also authorizes exact projection of VS Code Agent's runtime System
  role to the Responses system-message role and its `stateful_marker` to/from
  Swobu `previous_response_id` continuation.

## Authority

- Target package and owning fault plane: `swobu-vscode`; public distribution,
  documentation, and release.
- Package doc plus governing leaves: `docs/release.md`, root Developer Workflow,
  documentation-layer law, and universal completion criteria.
- Applicable skills: `swobu-public-copy-council`, `swobu-web-authoring`, and
  `swobu-execute-loop`.
- Contradictions: the original engineering freeze excluded runtime and
  compatibility changes; the user's explicit protocol-authority correction
  authorizes that narrow exception. The installed Agent journey then exposed
  the Agent host's runtime-only System role, admitting the RFC's generic
  Responses-semantics exception. Make retains project-action ownership; hooks
  remain trigger, environment, credential, and artifact-transport surfaces.
- Ambiguity requiring human decision: none.

## Plan

- Smallest coherent implementation: refresh manifest/locales, canonical icon,
  image-free README, contributor docs, Swobu-owned contextual links, GitHub
  metadata, exact-source release, Marketplace/Open VSX qualification, and
  measurement snapshots.
- Deletions: Preview status, first-line language selector, Marketplace
  maintainer commands, test-harness screenshot captions, and redundant feature
  inventory.
- Required code-local docs: release operations must explain slow first-version
  Marketplace validation and Make-owned commands.

## Proof

- Claim and falsifying check: metadata/locales and VSIX contents pass package
  tests; no deferred screenshots ship or leave broken README links; links
  resolve; installed exact VSIX and public-ID smoke pass.
- Language Model API integration: a clean-profile installed VSIX discovers the
  native Swobu model through `vscode.lm`, sends synthetic tool history, consumes
  streamed tool calls plus `stateful_marker`, and sends continuation state as
  `previous_response_id`. This is not Agent E2E because a test extension creates
  the history and calls `model.sendRequest()` directly.
- Real Agent E2E: the package now owns `make e2e-agent`, which installs the VSIX
  into a dedicated VS Code 1.135 profile and drives the shipped Chat/Agent UI.
  The unattended journey passed with the installed `0.1.5` VSIX: the selected
  Swobu route received two provider turns, Agent edited the fixture, ran its
  test, and rendered the success marker. VS Code's shipped smoke-driver and
  unsafe-test-token seams keep qualification signed out with no GitHub
  inference dependency.
- Exact-artifact state: immutable `v0.1.4` passed archive inspection and
  Linux/Windows Language Model API integration checks, but real VS Code Agent
  use failed. The prior task text incorrectly promoted a test-extension call to
  an Agent journey; that claim is withdrawn.
  The extension-start journey reaches the native **Start Swobu** notification,
  whose action has no supported headless extension-test API; it remains a
  manual UI smoke instead of a misleading automated artifact gate.
- Public path: clean-profile Marketplace installation of `0.1.4` discovers the
  route through the Language Model API and exercises synthetic tool history,
  fallback, and cancellation. It does not prove Chat/Agent behavior. Actual
  Agent dogfooding exposed failures on its embedded `stateful_marker` grammar
  and Responses reasoning lifecycle.
- Remaining work: +7/+14-day snapshots remain scheduled continuation after
  publication.
- Deferred screenshot backlog: add a genuine Agent-success hero, a tightly
  cropped native Swobu model picker, a legible fallback proof, and an
  Agent-derived GitHub social preview after 0.1.4. These assets are explicitly
  outside the image-free release and must not be fabricated.

## Continuation

- Last settled decision: `0.1.3` remains acquisition-focused; immutable `0.1.4`
  corrects the unsupported VS Code engine floor, with one explicit
  runtime exception: protocol 9 alone establishes compatibility; version is
  diagnostic metadata.
- Next bounded step: qualify a corrected patch through a request originating in
  the real VS Code Chat/Agent UI against any route visibly sourced from Swobu,
  including tool calls, continuation, file edit, and test execution. Backend
  model identity is not an acceptance requirement. Screenshots remain deferred
  by the user's release amendment.
- Proof pointers: `test/packaging.test.ts`, `scripts/check-vsix.mjs`, Marketplace
  publisher Acquisition Trend, GitHub traffic APIs.
- Open risks: manual/UI proof of the **Start Swobu** notification action.
- Open VSX decision: publish the same qualified artifact, as subsequently
  authorized by the user. Code-server 4.136.2 / Code 1.136.1 previously
  installed and activated the VSIX but did not expose Swobu in its Agent model
  picker; publication therefore does not claim code-server Agent compatibility
  and does not authorize compatibility engineering.

## Credential ownership

- Local Visual Studio Marketplace publication uses the registered
  `vscode/marketplace` vault scope and projects only `VSCE_PAT`.
- Local Open VSX publication uses the registered `vscode/openvsx` vault scope
  and projects only `OVSX_PAT`.
- GitHub repository and release operations use the authenticated GitHub CLI
  credential store; do not duplicate that credential into the repository
  vault. GitHub Actions uses ephemeral `github.token` and Marketplace OIDC.
- The former plaintext source files under `~/.config` were moved to desktop
  trash after both vault projections passed publisher-authority checks.

## Measurement

Baseline captured 2026-09-09 before `0.1.3` publication:

- Marketplace public API: `0.1.2` published at `2026-09-09T11:53:42.22Z`;
  public statistics were absent.
- Marketplace publisher portal: total acquisitions, acquisition trend, and
  ratings/reviews require an authenticated portal view and remain unavailable
  in the repository-owned seam.
- GitHub traffic API: 0 views, 0 clones, and no popular referrers in the
  available 14-day window.
- swobu.com extension referrals: unavailable before the tracked links ship.
- native VS Code activations: unavailable as a distinct existing metric; report
  existing `vscode` usage separately if the product telemetry surface exposes
  it without new instrumentation.

Post-publication public snapshot on 2026-09-09:

- Marketplace: validated `0.1.4`, engine `^1.135.0`, 2 installs, 19 downloads,
  and no public rating statistic exposed. Public-ID installation passed; the
  native Agent journey did not pass and remains the active qualification gate.
- GitHub traffic: 0 views, 0 clones, and no popular referrers in the available
  14-day window.
- Open VSX: no public `swobu.swobu` listing; unchanged-artifact functional
  smoke failed as recorded above, so publication stopped by policy.

Capture the same fields at +7 days (2026-09-16) and +14 days (2026-09-23).
Do not compute activation-per-acquisition unless both values have a defensible
shared attribution window.
