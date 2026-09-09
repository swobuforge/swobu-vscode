.DEFAULT_GOAL := help
.PHONY: help build check verify package integration e2e-agent release-prepare release-package release-smoke publish-marketplace publish-openvsx
help:
	@printf 'swobu-vscode entrypoints:\n  build\n  check\n  verify\n  package\n  integration\n  e2e-agent VSIX=<path>\n  release-prepare\n  release-package\n  release-smoke VSIX=<path|marketplace>\n  publish-marketplace VSIX=<path>\n  publish-openvsx VSIX=<path>\n'
build:
	@npm run build
check:
	@npm run check
verify:
	@npm run verify
package:
	@npm run package
integration:
	@npm run test:integration
e2e-agent:
	@test -n "$(VSIX)" || { echo 'VSIX is required'; exit 2; }
	@npm run test:e2e:agent -- "$(VSIX)"
release-prepare:
	@npm run release:prepare
release-package:
	@npm run release:package
release-smoke:
	@test -n "$(VSIX)" || { echo 'VSIX is required'; exit 2; }
	@npm run release:smoke -- "$(VSIX)"
publish-marketplace:
	@test -n "$(VSIX)" || { echo 'VSIX is required'; exit 2; }
	@if [ "$${GITHUB_ACTIONS:-}" = true ]; then npm run publish:marketplace -- "$(VSIX)"; else ../scripts/repo-credentials.sh run vscode/marketplace -- npm run publish:marketplace -- "$(VSIX)"; fi
publish-openvsx:
	@test -n "$(VSIX)" || { echo 'VSIX is required'; exit 2; }
	@if [ "$${GITHUB_ACTIONS:-}" = true ]; then npm run publish:openvsx -- "$(VSIX)"; else ../scripts/repo-credentials.sh run vscode/openvsx -- npm run publish:openvsx -- "$(VSIX)"; fi
