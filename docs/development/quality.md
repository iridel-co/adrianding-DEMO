# Quality workflow

Use Node 22 or newer and npm. `.nvmrc` selects the Node 22 line used by CI;
`npm ci` installs the tracked lockfile without updating dependency versions.
The portable harness runs existing repository checks sequentially and stops at
the first failure. It does not fix files or perform Git or external writes.

## Stages and coverage

| Stage      | Eligible checks                                                           |
| ---------- | ------------------------------------------------------------------------- |
| edit       | Prettier, source size, source ESLint, CSS Stylelint                       |
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
with a `mozglue` side-by-side assembly error. On 2026-10-05, a clean install of the
same official build launched from Playwright's project-local cache, while the
AppData cache still failed. The precise Windows loader cause remains unverified;
no browser binary patches, engine substitution, or project skips are required.
Use Playwright's [hermetic install](https://playwright.dev/docs/browsers#hermetic-install)
on this Windows machine, setting the variable for both installation and execution:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = '0'
npx playwright install chromium firefox webkit
npm run quality:ci
```

The setting applies to the current shell; set it again in a new shell. Browsers
live under `node_modules/playwright-core/.local-browsers`, which is ignored and
removed by a clean dependency installation. Reinstall them after `npm ci`.
Other environments can retain the normal cache and existing CI setup.
To diagnose available engines separately,
run `npm run test:browser -- --project=desktop --project=mobile --project=webkit-desktop --project=webkit-mobile`.
That selection does not replace the full quality gate.
Regression tests use an advancing clock initialized to the demo date: freezing
`Date.now()` while timers run interferes with GSAP's scroll-settling logic.
The root reduced-motion utility disables smooth scrolling, and layout-driven
ScrollTrigger refreshes wait for scrolling to settle before recalculating.
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

Workshop availability fixtures use `scripts/quality/render-workshop-fixtures.cjs`
to render actual server markup in a disposable TypeScript subprocess with
in-memory catalogue changes. They verify disabled triggers and confirmation
guards, not hydrated full-capacity journeys or a live receiving service. The
2026-10-07 final gate passed 355 cases: 335 browser journeys and 20 policy/markup cases.
Phone feedback coverage includes terminal filter overlays, sticky CTA visibility,
historical dates, repeated fragment links and visitor scroll interruption.

## Source size and conventions

The edit gate includes `check:source-size`; thresholds and exact-file exceptions
live in `source-size.config.json`. It reports nonempty/total physical source lines,
not logic complexity. Warnings prompt review and hard maxima require an explicit
reasoned exception. See [code conventions](code-conventions.md) for the contract.

## Browser test scope

Protect visitor behavior: navigation and interruption, accessible controls, form
validation and retained answers, consent, availability and confirmation fallbacks.
Core journeys run in all five engine/viewport projects. Mark responsive matrices
`@layout`; run them in desktop Chromium and mobile WebKit only, using representative
widths and boundaries where the layout actually changes. Mark pure policy and
server-markup fixtures `@policy`; run these once in Chromium, since repeating the
same domain calculation or static markup across engines adds no evidence.

Use containment and usable controls for layout assertions. Exact padding, equal
button widths, decorative clipping, font emphasis and editorial wording belong
in visual review. Add a regression for a meaningful failure, not every annotation.
Avoid repeating full form submissions at nearby widths; the cross-engine journey
already covers them. Resize/motion and overflow regressions remain when they
protect interactions. Tags select projects, not optional/skipped acceptance work.

During edits use the scoped edit/checkpoint gate and a focused Playwright file or
`--grep` selection. At integrated handoff and on PRs, `quality:ci` still runs the
entire maintained suite, production build and OG validation. No path-based CI
exemptions are introduced. Device and hosted review remain separate evidence.
