# Quality workflow

Use Node 22 or newer and npm. `.nvmrc` selects the Node 22 line used by CI;
`npm ci` installs the tracked lockfile without updating dependency versions.
The portable harness runs existing repository checks sequentially and stops at
the first failure. It does not fix files or perform Git or external writes.

## Stages and coverage

| Stage      | Eligible checks                                                            |
| ---------- | -------------------------------------------------------------------------- |
| edit       | Prettier, source ESLint, CSS Stylelint                                     |
| checkpoint | edit checks, generated Next types and TypeScript, harness tests            |
| handoff    | checkpoint checks, fresh Next build, built OG checks, Chromium regressions |

Scopes select which checks run, not which files those npm commands inspect.
Package, lockfile, harness, and CI changes select every eligible check. Docs
normally select formatting only. Build and OG validation share one script so an
OG check cannot silently reuse stale output. Typechecking generates Next route
types first, allowing it to run before a build on a clean checkout.

```sh
npm ci
npm run quality:inspect
npm run test:quality
npm run quality -- --all --stage=handoff --plan
npm run quality -- --file=src/app/page.tsx --stage=edit
npm run quality -- --staged --stage=checkpoint
npm run quality -- --base=main --stage=handoff --plan
npm run quality:ci
```

Repeat `--file=` for multiple paths; quote each complete argument containing
spaces. Choose one scope. Without a scope, the runner unions staged, unstaged,
and untracked paths. Base comparison uses merge-base through HEAD and excludes
dirty files. Fetch a base separately when current remote evidence is needed.
Staged scope selects index paths, but commands still inspect the working tree:
it does not certify partially staged contents. No selected checks exits 2.

## Evidence and known gaps

Application browser coverage lives in `tests/browser/` with Playwright. Install
Chromium after `npm ci` using `npx playwright install chromium`; on Linux CI use
`npx playwright install --with-deps chromium` for system dependencies too.
Run `npm run test:browser` to build and test a fresh production server on port 3100. The port must be free; the runner never reuses another server. The handoff
gate includes this command for application, browser setup, and dependency changes.
Both 1440px desktop and 390px mobile Chromium projects run with reduced motion,
one worker, isolated browser contexts, and fixed demo data. These are browser
emulations, not real-device evidence or cross-browser coverage.
Tests cover keyboard navigation, listing filters, both multistep demo forms,
personalized confirmations, and missing, invalid-JSON, or blocked storage.
Runtime validation of structurally invalid stored payloads remains PR10 work.
Failures retain screenshots and traces under `test-results/` and an HTML report
under `playwright-report/`; CI uploads them for seven days. Inspect locally with
`npx playwright show-report` or `npx playwright show-trace <trace.zip>`.
Runner tests cover scope selection, argument/config rejection, Git changes, and
failure propagation; they do not exercise the frontend. OG checks inspect built
image dimensions, encoding, and size, not visual appearance.

Keep baseline failures visible. Record browser/device and remote CI evidence
separately from local checks. Run focused checks while editing and the full gate
at package handoff. Avoid editing during validation or overlapping heavy runs.
CI runs all handoff checks on PRs, including stacked PRs, without Production secrets.
Required branch protection remains a separate GitHub configuration decision.
