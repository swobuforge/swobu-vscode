# Contributing

Use Node.js 22 and VS Code 1.136 or newer.

```sh
npm ci
make check
make verify
```

Run `make integration` when a compatible ordinary Swobu installation is available. Set `SWOBU_TEST_BINARY` to that executable; use `xvfb-run -a` on headless Linux.

Release packaging and publication use the Make targets documented in [Release operations](docs/release.md). Do not rebuild an artifact after qualification.
