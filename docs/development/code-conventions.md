# Public-site code conventions

Use this alongside the repository AGENTS and [quality workflow](quality.md).

## Ownership and boundaries

- A form owns one React Hook Form instance, its submission and handoff. Keep local
  schemas/options, date-only helpers and substantial review sections beside the route.
  Do not introduce a generic form engine or split individual inputs into files.
- Shared `FormField` exposes control props to the actual input/select/textarea.
  Labels, invalid state and error descriptions must remain connected; group controls
  use fieldset/legend and independently named child controls.
- `useStepNavigation` owns serialized validation transitions. Page owners retain
  step field lists, submission/availability guards and focus/scroll behavior.
- `useHorizontalOverflow` owns edge measurement and observer/listener cleanup.
  Consumers own movement distance, visual layout, content identity and hover policy.
  Normal and overlay `ScrollArrows` share semantics but preserve their presentation.
- Browser hooks/helpers belong in `src/app/_lib`; shared public UI in
  `src/app/_components`; pure domain/data functions in `src/lib`. Page-specific
  components stay beside their route. Use kebab-case files and PascalCase components.
- Keep current non-obvious invariants in comments. Archive historical rationale in
  docs with provenance instead of carrying long chronological headers in source.
- No module-scope browser reads. Every listener, observer, timer and async transition
  needs lifecycle cleanup. Preserve SSR-first state and reduced-motion behavior.

## Source-size review

`npm run check:source-size` runs through the edit-stage quality gate. It scans all
`src` `.ts`, `.tsx` and `.css` files, excluding images, fonts and generated output
outside `src`. It counts **nonempty physical lines including comments**, and also
reports total physical lines. It does not claim to measure executable logic or
complexity, and does not parse away JSX strings or comments to hide growth.

`source-size.config.json` sets `warnLines` and `maxLines`. Current defaults warn
above 300 nonempty lines and fail above 600. Warning means review responsibilities;
it does not demand a file split. Cohesive data, styles or components may remain long.

An intentional exception uses an exact source path under `overrides`, an explicit
higher `maxLines`, a nonempty `reason`, and optionally `expires` (`YYYY-MM-DD`).
Threshold changes and exceptions must be reviewable with their rationale. Missing,
malformed, expired and unnecessary exceptions fail rather than silently exempting
files. Remove an override when its file is within the ordinary maximum.

Do not create wrappers or move coherent code merely to satisfy a counter. Split
when the resulting components/helpers have clear ownership, compact typed
interfaces and useful independent responsibilities. Preserve behavior and validate
all consumers of shared changes. Source-size checks supplement review and tests.

## Validation and delivery

Inspect selection with `npm run quality -- --file=<path> --stage=checkpoint --plan`,
then run it without `--plan`. Repeat `--file` for new/edited paths. Only the main
integration stream runs build/browser/full gates; stop editing while they run.
The full `npm run quality:ci` is required at integrated handoff.

Keep atomic Conventional Commits by behavior or coherent refactor with required
regressions. Preserve unrelated local files. Record implementation, browser,
physical-device, hosted, remote-CI and live-provider proof separately.
