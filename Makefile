.DEFAULT_GOAL := help
.PHONY: help build check verify package integration release-prepare release-package release-smoke publish-marketplace publish-openvsx
help:
	@printf 'swobu-vscode entrypoints:\n  build\n  check\n  verify\n  package\n  integration\n  release-prepare\n  release-package\n  release-smoke VSIX=<path|marketplace>\n  publish-marketplace VSIX=<path>\n  publish-openvsx VSIX=<path>\n'
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
release-prepare:
	@npm run release:prepare
release-package:
	@npm run release:package
release-smoke:
	@test -n "$(VSIX)" || { echo 'VSIX is required'; exit 2; }
	@npm run release:smoke -- "$(VSIX)"
publish-marketplace:
	@test -n "$(VSIX)" || { echo 'VSIX is required'; exit 2; }
	@npm run publish:marketplace -- "$(VSIX)"
publish-openvsx:
	@test -n "$(VSIX)" || { echo 'VSIX is required'; exit 2; }
	@npm run publish:openvsx -- "$(VSIX)"
