# Turnkey public release

Owner: extension distribution; coordinating scope includes the independently
installed Swobu runtime and public distribution.

Authority: `../../README.md`, `../../docs/release.md`, developer workflow, and
release law. The original inbox RFC is historical input only.

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

The public Marketplace exposes `0.1.4` with engine `^1.135.0`. Immutable GitHub
Release bytes passed Linux and Windows installation plus Language Model API
integration checks. Those checks did not enter the real Chat/Agent surface and
must not be described as a native Agent journey. Real Agent use subsequently
failed on embedded continuation state and legitimate reasoning output.

## Remaining release transaction

- `0.1.5` passed the real VS Code Chat/Agent UI journey with an installed Swobu
  model, reasoning, tool execution, continuation, file edit, and test result.
- Publish that qualified patch as an immutable release and verify both public
  registry versions.
- Marketplace OIDC still returns 404; the registered repository-vaulted PAT is
  the proven fallback.

## Distribution boundary

- A prior code-server smoke installed and activated the exact VSIX but did not
  expose Swobu in its Agent model picker. The user subsequently authorized
  publishing the qualified artifact to Open VSX as a distribution surface.
  Publication does not claim code-server Agent compatibility, and no
  compatibility engineering is part of this release.

## Next bounded step

Verify the published `0.1.5` version on both registries before distribution
measurement continues.
