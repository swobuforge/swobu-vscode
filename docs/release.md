# Release operations

Identity: `swobu.swobu`, publisher `swobu`, public source target `swobuforge/swobu-vscode`. The supplied Marketplace credential successfully verified this publisher; `swobuforge` did not have authority. Do not change the publisher to match the GitHub owner.

## Qualification

Run the same repository scripts locally and in CI. Qualification produces one platform-independent VSIX and package inspection rejects target metadata, private runtime binaries, development sources and secret-like files. Swobu itself remains an independently installed product.

`make verify` runs source proof. `make integration` runs real VS Code API proof. For development-only real Swobu proof, set `SWOBU_TEST_BINARY` to an explicitly built local executable. This is not runtime release qualification.

`make release-prepare` rejects dirty/tag/version/provenance drift. `make release-package` creates and inspects the sole VSIX. Run `make release-smoke VSIX=./swobu-<version>.vsix` to install that manifest-versioned artifact into a clean profile. Full installed native Agent and canonical evidence proof is mandatory before release and must not be replaced by development-host smoke. npm scripts remain package-private mechanics behind these Make targets.

Publishing consumes the exact qualified VSIX files listed in `.out/release/SHA256SUMS.txt`. Do not regenerate artifacts between qualification and upload.

The tag transaction fans out from the same named qualification artifact into
independent GitHub Release, Marketplace, and Open VSX jobs. A failed destination
can be retried without recreating or overwriting another immutable publication.
Marketplace public smoke begins after GitHub Release and Marketplace succeed;
it does not wait on optional Open VSX credentials. Marketplace publication is
also gated by the Windows installed-VSIX journey against stable Swobu installed
through the public PowerShell installer; that job downloads the Linux-built
artifact and never rebuilds it.

## Trusted publishing

One-time Marketplace policy values:

- Publisher: `swobu`
- GitHub owner: `swobuforge`
- Repository: `swobu-vscode`
- Workflow: `release.yml`

The GitHub job uses OIDC (`id-token: write`, `vsce publish --oidc`) and no long-lived Marketplace PAT. Policy setup and an actual OIDC publication must be proven before declaring automation complete.

Trusted publishing currently requires the exact `@vscode/vsce@3.9.3-12`
prerelease because stable 3.9.2 predates the Marketplace `--oidc` command. Keep
the exact pin until a stable `vsce` release exposes the same fail-closed OIDC
exchange, then replace it only after the executable publisher proof passes.

The initial local publication may receive the operator's supplied credential through `VSCE_PAT`. Never print it, pass its literal value in arguments, commit it, or include it in an artifact.

First-version Marketplace validation may remain silent in `vsce publish` for
several minutes. While the publisher portal reports verification, keep the
single submission running or inspect portal state; do not interrupt it merely
because the CLI has emitted no progress, and never start a parallel submission.

## Open VSX

Local publication uses the repository vault's destination-specific
`vscode/marketplace` and `vscode/openvsx` credential scopes. The Make targets
invoke the supported repository credential seam; do not export tokens manually
or read the encrypted vault directly. CI supplies Marketplace OIDC and the Open
VSX secret through its own ephemeral environment.

If no credential is available: sign into Eclipse, accept the Open VSX Publisher
Agreement, establish namespace `swobu`, and provision the token through the
registered vault credential or the CI secret. Missing account paperwork does not block
Visual Studio Marketplace publication.

## Recovery

An accepted version is immutable. On a release defect, retain the exact artifact/proof record and publish a corrected version; do not overwrite a released tag or replace published asset bytes. Restore a prior installed version only through documented editor version selection. Re-run public-ID installation and the routed tool loop after a corrected release.
