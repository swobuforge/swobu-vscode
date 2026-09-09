# Turnkey public release

Owner: extension distribution; coordinating scope includes the independently
installed Swobu runtime and public distribution.

Authority: `docs/00-inbox/RFC_ Swobu VS Code — Turnkey Release.md`, developer
workflow, and release law.

## Outcome

Release `swobu.swobu` from the public `swobuforge/swobu-vscode` repository as
one platform-independent VSIX. The
extension attaches to or explicitly installs ordinary Swobu, exposes routes as
native VS Code models, and completes the installed Agent tool loop. The same
qualified VSIX bytes flow to GitHub Release, Visual Studio Marketplace, and
Open VSX when credentialed.

Product screenshots are deferred by the image-free release amendment. They are
not package or publication gates. Installed and post-publish Agent execution
remain release gates.

## Current implementation

- Thin Responses adapter covering text, images, tools, required/automatic
  policy, parallel calls, ordered results, UTF-8 streaming, cancellation, and
  explicit unsupported-semantics failures.
- Native route advertisement and machine-scoped QuickPick/InputBox overrides.
- Attach-first ordinary Swobu resolution, explicit canonical installer use,
  protocol compatibility checks, and no private bundled runtime.
- Claude Code and Codex commands delegate exact workspace/address state to the
  ordinary `swobu connect` seam.
- English plus ten locale bundles and Marketplace READMEs.
- Canonical required Marketplace icon and licenses; no product screenshots.
- One portable VSIX path with archive inspection, Linux attach/start installed
  smoke, Windows same-byte qualification, OIDC Marketplace publication, GitHub
  Release, optional Open VSX, and public-ID smoke encoded in automation.
- Make owns project build/check/package/qualification commands. GitHub Actions
  owns triggers, runners, permissions/OIDC, job dependencies, and artifact
  transport, and invokes named Make targets.

## Current proof

- `make verify`: 50 deterministic tests plus typecheck, lint, boundary scan,
  and build.
- Minimum-supported real VS Code 1.135.0 → ordinary Swobu 2.0.0 → deterministic
  upstream journey: route discovery, parallel tools, ordered image results,
  second inference, UTF-8 streaming, primary 503/fallback recovery, canonical
  usage, raw `swobu-vscode/0.1.0` identity, and cancellation.
- Public Unix and PowerShell installers resolve and preserve ordinary Swobu
  installation ownership.
- Publisher authority was previously verified as `swobu`; the frozen extension
  ID is `swobu.swobu`.
- OIDC tooling recognizes Marketplace trusted publishing and rejects
  simultaneous PAT authentication.

The public Marketplace exposes validated `0.1.3`. Its immutable artifact has an
unnecessarily high VS Code 1.136 engine floor. Corrected `0.1.4` source proves
the same native model journey on VS Code 1.135.0 and requires a separately
qualified artifact and publication.

## Remaining release transaction

1. Commit, push, and tag corrected `v0.1.4` source.
2. Build one VSIX from that exact tree and bind its checksum to the release
   transaction.
3. Pass archive inspection plus Linux `attach` and `extension-start` installed
   journeys on those bytes.
4. Pass Windows checksum verification and the same installed journeys on those
   bytes using the public PowerShell installer.
5. Configure and execute Marketplace OIDC trusted publication; create the
   GitHub Release and publish to Open VSX when credentialed without rebuilding.
6. Run the public-ID smoke: fresh-profile install, public copy/icon/metadata,
   route selection, Agent tool action, second inference, cancellation,
   fallback, and independently usable ordinary Swobu.

## Blockers

- Corrected `0.1.4` requires the authorized immutable git/tag/release
  transaction before artifact qualification.
- Open VSX publication stopped: code-server installs and activates the exact
  VSIX but does not expose Swobu in its Agent model picker. Compatibility
  engineering is outside this RFC.

## Next bounded step

Execute the corrected immutable release transaction without changing qualified
VSIX bytes between testing and publication.
