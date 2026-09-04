.DEFAULT_GOAL := help
.PHONY: help build check verify package
help:
	@printf 'swobu-vscode entrypoints:\n  build\n  check\n  verify\n  package\n'
build:
	@npm run build
check:
	@npm run check
verify:
	@npm run verify
package:
	@npm run package
