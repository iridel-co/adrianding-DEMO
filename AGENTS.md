# Working preferences

- Treat concise action requests as authorization to complete the local task.
- Prefer `gh` for GitHub metadata and `git` for local branches and commits.
- Preserve unrelated changes and stage explicit files or hunks.
- Keep commits atomic and use Conventional Commits. Use a separate `type/description`
  branch per PR and a corresponding `type: description` title.
- Target `main` unless a dependent PR temporarily targets its predecessor.
- Do not push, open PRs, merge, deploy, or mutate Production without authorization.

## Quality workflow

- Read `docs/website-core-pages-plan.md` and update its package evidence as work lands.
- Use `npm run quality -- --file=<path> --stage=edit|checkpoint|handoff --plan`
  to inspect scope; repeat `--file=` for task files, then run without `--plan`.
- Stages are cumulative. Run `npm run quality:ci` for the full automated gate.
- Checks inspect working-tree content; staged scope does not certify partial staging.
- Never edit during validation or overlap heavy runs. Failures block a passing claim.
- Maintain `quality.config.json` when adding checks or changing ownership boundaries.
- Public-site Chromium regressions run at handoff. Runner tests prove tooling behavior only.
- Automated checks do not replace code review, browser, device, CI, or provider proof.
- See `docs/development/quality.md` for prerequisites and coverage limits.
