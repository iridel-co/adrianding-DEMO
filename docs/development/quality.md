# Quality workflow

Use Node 22 or newer and npm. `.nvmrc` selects the Node 22 line used by CI;
`npm ci` installs the tracked lockfile without updating dependency versions.
The portable harness runs existing repository checks sequentially and stops at
the first failure. It does not fix files or perform Git or external writes.

## Stages and coverage

| Stage      | Eligible checks                                                           |
| ---------- | ------------------------------------------------------------------------- |
| edit       | Prettier, source ESLint, CSS Stylelint                                    |
| checkpoint | edit checks, generated Next types and TypeScript, harness tests           |
| handoff    | checkpoint checks, fresh Next build, built OG checks, browser regressions |

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
the browsers after `npm ci` using `npx playwright install chromium firefox webkit`;
on Linux CI add `--with-deps` for system dependencies too.
Run `npm run test:browser` to build and test a fresh production server on port 3100. The port must be free; the runner never reuses another server. The handoff
gate includes this command for application, browser setup, and dependency changes.
1440px desktop projects cover Chromium, Firefox, and WebKit; 390px mobile projects
cover Chromium and WebKit. They use reduced motion, an explicit Asia/Manila
timezone, one worker, isolated contexts, and fixed demo data. These are engine
tests and viewport emulations, not real-device or every-operating-system evidence.
WebKit is Playwright's patched engine, not installed Safari. Windows local and
Linux CI runs do not establish macOS/iOS behavior; native Safari/device QA remains
part of milestone acceptance. Browser tests and configuration are linted and typed.
Tests cover Tab traversal in Chromium/Firefox and focus/Enter activation in WebKit
(its Windows default excludes links from sequential Tab traversal), listing filters, both multistep demo forms,
personalized confirmations, and missing, invalid-JSON, or blocked storage.
Both form submissions also run with storage blocked and reach generic confirmations.
Runtime validation of structurally invalid stored payloads remains PR10 work.
On the 2026-10-04 Windows review, Firefox's downloaded binary failed before launch
with a `mozglue` side-by-side assembly error. All 52 Chromium/WebKit cases passed;
Firefox remains a required project and blocks a full local handoff claim until its
browser prerequisite is repaired. To diagnose the available engines separately,
run `npm run test:browser -- --project=desktop --project=mobile --project=webkit-desktop --project=webkit-mobile`.
That selection does not replace the full quality gate.
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
