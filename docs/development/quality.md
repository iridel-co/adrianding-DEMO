# Quality workflow

Use Node 22 or newer and npm. `.nvmrc` selects the Node 22 line used by CI;
`npm ci` installs the tracked lockfile without updating dependency versions.
The portable harness runs existing repository checks sequentially and stops at
the first failure. It does not fix files or perform Git or external writes.

## Stages and coverage

| Stage      | Eligible checks                                                 |
| ---------- | --------------------------------------------------------------- |
| edit       | Prettier, source ESLint, CSS Stylelint                          |
| checkpoint | edit checks, generated Next types and TypeScript, harness tests |
| handoff    | checkpoint checks, fresh Next build followed by built OG checks |

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

Application unit/browser coverage is pending [PR02](../website-core-pages-plan.md#pr02-public-site-regression-coverage).
The inspector reports that gap rather than requiring a dummy `test:unit` command.
Runner tests cover scope selection, argument/config rejection, Git changes, and
failure propagation; they do not exercise the frontend. OG checks inspect built
image dimensions, encoding, and size, not visual appearance.

Keep baseline failures visible. Record browser/device and remote CI evidence
separately from local checks. Run focused checks while editing and the full gate
at package handoff. Avoid editing during validation or overlapping heavy runs.
CI runs all handoff checks on PRs, including stacked PRs, without Production secrets.
Required branch protection remains a separate GitHub configuration decision.
