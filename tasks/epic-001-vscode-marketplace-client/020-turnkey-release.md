# Turnkey public release

Owner: extension distribution; coordinating scope includes the independently
installed Swobu runtime and public distribution.

Authority: `docs/00-inbox/RFC_ Swobu VS Code — Turnkey Release.md`, developer
workflow, and release law.

## Outcome

Release `swobu.swobu` 0.1.2 Preview from the public
`swobuforge/swobu-vscode` repository as one platform-independent VSIX. The
extension attaches to or explicitly installs ordinary Swobu, exposes routes as
native VS Code models, and completes the installed Agent tool loop. The same
qualified VSIX bytes flow to GitHub Release, Visual Studio Marketplace, and
Open VSX when credentialed.

The genuine native Agent Marketplace screenshot is post-0.1.0 work owned by
`tasks/backlog.md`. It is not a package or publication gate. Installed and
post-publish Agent execution remain release gates.

## Current implementation

- Thin Responses adapter covering text, images, tools, required/automatic
  policy, parallel calls, ordered results, UTF-8 streaming, cancellation, and
  explicit unsupported-semantics failures.
- Native route advertisement and machine-scoped QuickPick/InputBox overrides.
- Attach-first ordinary Swobu resolution, explicit canonical installer use,
  compatible-version checks, and no private bundled runtime.
- Claude Code and Codex commands delegate exact workspace/address state to the
  ordinary `swobu connect` seam.
- English plus ten locale bundles and Marketplace READMEs.
- Genuine model-picker and fallback screenshots; canonical icon and licenses.
- One portable VSIX path with archive inspection, Linux attach/start installed
  smoke, Windows same-byte qualification, OIDC Marketplace publication, GitHub
  Release, optional Open VSX, and public-ID smoke encoded in automation.
- Make owns project build/check/package/qualification commands. GitHub Actions
  owns triggers, runners, permissions/OIDC, job dependencies, and artifact
  transport, and invokes named Make targets.

## Current proof

- `make check`: 41 deterministic tests plus typecheck, lint, and boundary scan.
- Current-source real VS Code 1.136.1 → ordinary Swobu 2.0.0 → deterministic
  upstream journey: route discovery, parallel tools, ordered image results,
  second inference, UTF-8 streaming, primary 503/fallback recovery, canonical
  usage, raw `swobu-vscode/0.1.0` identity, and cancellation.
- Public Unix and PowerShell installers resolve and preserve ordinary Swobu
  installation ownership.
- Publisher authority was previously verified as `swobu`; the frozen extension
  ID is `swobu.swobu`.
- OIDC tooling recognizes Marketplace trusted publishing and rejects
  simultaneous PAT authentication.

These source and development-host proofs do not qualify current VSIX bytes or
prove Windows/public installation. No current-source release-qualified VSIX
exists yet.

The unpublished `v0.1.0` and `v0.1.1` transactions passed Linux qualification
and completed the Windows routed/cancellation journey, then failed while
deleting a harness-owned runtime home before its daemon exited and released
`swobu.yaml.lock`. No destination published. The 0.1.2 harness awaits that
known child process before deleting its home; the failed tags remain immutable
evidence.

## Remaining release transaction

1. Create/populate the public repository, commit the release source, update the
   platform gitlink, push, and tag `v0.1.2`.
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

- Marketplace OIDC exchange currently returns 404 for `/_apis/gallery/token`.
  Two PAT submissions of the exact qualified 0.1.2 asset reached the gallery
  request and timed out; public and authenticated catalog reads did not confirm
  creation. Do not claim Marketplace deployment until the catalog exposes
  `swobu.swobu` and the public-ID smoke passes.
- Open VSX publication requires its account/token; absence does not block the
  Visual Studio Marketplace launch.

## Next bounded step

Run current source and portable-package proof, then execute the authorized
public repository and release transaction without changing qualified VSIX
bytes between testing and publication.
