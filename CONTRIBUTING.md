# Contributing

Thanks for your interest in contributing to this project!

Here are a couple of guidelines to keep in mind before opening a Pull Request:

- Please open a GitHub issue for discussion _before_ submitting any significant changes to this API (including new features or functionality).
- Please don't submit code that has been written by code-generation tools such as Copilot or Claude without first reviewing and testing the changeset.

## Local development

To get started:
```sh
pnpm install
```

### Running the documentation site locally

The documentation site is a great place to test pending changes. It runs on localhost port 3000 and can be started by running:
```sh
pnpm dev 
```

### Running tests locally

To run unit tests locally:
```sh
pnpm test
```

Unit tests run in Node by default, which is faster to set up. Tests that need a DOM (e.g. to render components) opt into jsdom by starting with a `// @vitest-environment jsdom` comment; without it, they fail with errors like `document is not defined`.

To run end to end tests locally:
```sh
pnpm prerelease
pnpm e2e:install
pnpm dev:integrations & pnpm e2e:test
```

Set `E2E_LOG_URLS=1` to log the URL of each test's page (e.g. to open a failing test in a browser). Set `E2E_APPS` to a comma-separated list of integration apps (e.g. `E2E_APPS=vite`) to only start those apps; tests that need the other apps are skipped.

### Updating assets

Before submitting, also make sure to update generated docs/examples:
```
pnpm compile
pnpm prettier
pnpm lint
```

> [!NOTE]
> If you forget this step, CI will remind you!
