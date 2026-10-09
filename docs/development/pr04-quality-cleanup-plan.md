# PR04 quality fixes and scoped cleanup plan

Status: locally implemented and handoff-verified 2026-10-07; publication through PR #4 authorized.
Baseline: `fix/public-form-layouts` at `a64e77c`, PR #4 targeting `main`.
Read with `docs/website-core-pages-plan.md` and `docs/development/quality.md`.

## Scope decision

The label and step-navigation fixes belong in PR04/PR05: those packages explicitly
own form validation, keyboard interaction, preserved values and shared controls.
Small extractions needed to fix these defects belong with them. Broader structural
cleanup is related work but should be a dependent package, `PR04-CLEANUP`, rather
than silently enlarging the already published PR. The canonical plan requires
reviewing splits around 500-600 authored lines and naming substantial cleanup.
The user requested this plan; implementation and publication are separate steps.

No redesign, copy changes, live booking/seat enforcement, receiving API,
validation-policy changes, gallery removal, new dependencies or site-wide rewrite.
Preserve demo fill, approved headings/timer/filter/sticky designs, availability
states, all existing handoff payloads and query-prefill behavior. Preserve local
designer notes, the harness ZIP and historical meeting documents.

## Evidence and priorities

- Confirmed: Corporate full-name input has no ID, associated label or accessible
  naming attributes. Its local `Field` does not connect labels to controls.
- Confirmed: two immediate activations of Corporate Continue advance step 1 to
  step 3. Both forms await `trigger` then increment current state without a lock.
  Workshop reproduction is a required first implementation check, not assumed proof.
- Source-observed: neither local Field helper associates field error text;
  Workshop clones children, which may be wrappers rather than actual controls.
- Maintainability opportunities: duplicated rail measurement/listener lifecycles,
  programme-event constants, form rendering/date logic and lengthy history comments.
  These are not additional demonstrated runtime defects.
- Existing size: Corporate form 812 -> 838 lines, registration 352 -> 405,
  EventCards 439 -> 454, paths 527 -> 543, calendar 391 -> 325.
  Size alone is not a defect or acceptance target.
- Snapshot diff: application +806/-489, tests/tooling +747/-1, docs/config +545/-13.
  These counts include moves and formatting; they are not logic-line measurements.

## Conventions for this work

1. One owner per concern: forms own RHF state/submission; shared controls own
   semantics; page containers own layout; hooks own subscriptions and cleanup.
2. Keep page-specific components beside their route. Shared public-site components
   live in `src/app/_components`; browser hooks/helpers in `src/app/_lib`; pure
   domain/data functions in `src/lib`. Retain existing kebab-case filenames and
   PascalCase exports. Name hooks `use-*`. Do not create barrel exports for this work.
3. Extract a component for a cohesive responsibility and compact typed props,
   not to reach a line limit. No generic form engine, whole-RHF-object prop bags,
   opaque configuration-driven JSX or context added merely to avoid props.
4. Pure schemas/date formatting must not import browser/UI code. Browser modules
   must not read window during module initialization or change SSR-first output.
5. Every input has a stable ID, connected label, invalid state and described error.
   Composite controls use group/fieldset semantics and expose the real control's
   attributes explicitly. Do not assume cloning an outer wrapper labels its input.
6. Async navigation uses a synchronous lock plus visible pending state. Every
   effect/timer/observer owns teardown; callbacks cannot commit stale navigation.
7. Preserve exceptions intentionally: rail movement distance, hover suppression,
   normal versus overlay arrows, and page-specific focus/scroll remain caller-owned.
8. Comments explain current non-obvious invariants. Move historical narrative to
   docs without deleting evidence. Avoid unrelated import/formatting churn.
9. One behavior/refactor plus its necessary tests per Conventional Commit. Report
   generated/binary changes separately; do not rewrite the existing PR history.

## A. Fixes in PR #4

Single executor; shared contracts first, Corporate then Workshop integration.
Reserve plan, shared modules and quality configuration to the coordinator.

### A1 — serialize step navigation

Files: both form owners; proposed `src/app/_lib/use-step-navigation.ts`;
`tests/browser/corporate-form-layouts.spec.ts` and `workshop-layouts.spec.ts`.

Use a synchronous pending ref before validation begins, snapshot the validated
step and only advance from that step after successful validation. Release in
`finally`, including rejection. Prevent Continue/Back overlap and navigation
while submitting; reflect pending state on controls. An unmounted/stale operation
must not update navigation. Keep each form's existing field lists, focus/scroll,
consent and availability guards. Reuse a small shared hook if both fit this
contract; do not build schema or submission ownership into it.

Acceptance: duplicate activation advances exactly one step; delayed validation
cannot skip or override a newer step; invalid data stays on the same step;
Back/Continue retain values; rejection releases the lock. Validate a real rapid
click and a deterministic overlapping activation. Keep submit distinct from
Continue so DOM reuse cannot accidentally submit. No booking success when unavailable.

### A2 — shared accessible form fields

Depends on A1. Proposed `src/app/_components/form-field.tsx` replaces the two
local Field helpers. Explicit render/control props carry `id`, `aria-invalid`
and merged `aria-describedby`; Label uses `htmlFor`; error has a stable ID.
Forward ref/register handlers unchanged, including native-select wrappers.

Apply to all text/email/tel/select/textarea fields. Date range and programme
multi-select groups retain fieldset/legend or equivalent group labels; connect
individual date input names and their shared error. Preserve existing helpful
ARIA descriptions and checkbox consent labels. No label/validation wording changes.

Acceptance: every input has the expected accessible name; errors are described
and invalid state clears after correction; clicking labels focuses controls;
keyboard validation focuses the first invalid actual control; no duplicate IDs
when both forms exist in a test fixture. Verify both workflows and wrapped selects.

### A3 — focused adjacent cleanup and evidence

Centralize the repeated programme inquiry event name/type in a small helper
(proposed `src/app/_lib/program-inquiry.ts`) used by `program-carousel.tsx` and
Corporate prefill. Preserve URL and event semantics; unknown keys remain ignored.
Correct stale comments about programme counts, grid scrolling and sticky visibility
in affected files only. Keep availability policy/text components as they are.

Commit A1 and A2 separately with regressions, then A3 if independently reviewable.
Run scoped quality checkpoint and the affected form/navigation suites after each
behavior package; run the full handoff gate once after integration. Update PR04
and PR05 evidence. Earlier "no remaining actionable regressions" is historical,
not a current assertion after this audit.

## B. Dependent structural cleanup: PR04-CLEANUP

Starts only after A passes. If PR4 remains open, branch from its latest head and
initially target it; after merge, retarget main and verify only remaining changes.
Proposed branch `refactor/public-journey-structure`. No branch/PR created by this plan.
One sequential implementation stream avoids overlapping form/shared-control edits.

| ID / files                                                                                     | Concrete responsibility and boundary                                                                                                                                                                                                                                                                                                                                                                                             |
| ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1 Corporate `inquiry-form.tsx`                                                                | Extract schema/options/typed step metadata to a route-local model; extract a date-range picker and pure date formatter. Keep one RHF owner and the existing string handoff value. Picker receives explicit value/change/error/control semantics; preserve pick/free-text mode switching, sample fill, minimum dates and date-range order. Extract the substantial programme/review steps only if their props stay small.         |
| B1 Workshop `registration-form.tsx`                                                            | Move schema/options/step metadata to a route-local model; extract confirmation summary only if it simplifies orchestration. Reuse A1/A2. Do not create one component per trivial input or duplicate RHF ownership.                                                                                                                                                                                                               |
| B2 `event-cards.tsx`, `program-carousel.tsx`, `workshop-tag-filter.tsx`, `specializations.tsx` | Introduce a shared measured-overflow hook in `_lib`. Own RAF, listeners, ResizeObserver and teardown. Expose list/reset identity and explicit measurement suppression/invalidation. Observe relevant width-changing children/transitions. Preserve EventCards hover freeze, resize/filter resets, visible desktop grids, and each consumer's nudge distance. Pass an explicit rail ref rather than relying on firstElementChild. |
| B2 `scroll-arrows.tsx`                                                                         | Keep as the visual/semantic primitive. Document normal/overlay edge behavior; no generic carousel engine or calendar-arrow merger.                                                                                                                                                                                                                                                                                               |
| B3 `event-cards.tsx`                                                                           | Separate card markup from rail/layout coordination only with compact workshop/presentation props. Preserve row/grid variants, image priority, motion, focus and Coming Soon behavior.                                                                                                                                                                                                                                            |
| B3 `workshops-calendar.tsx`                                                                    | Extract day-preview content if it clarifies cursor/grid ownership. Keep month/open-day state together and preserve Radix focus/collision behavior. Pure date-grid helpers stay local unless an independently tested module makes them easier to reason about; no extraction just for line count.                                                                                                                                 |
| B4 `paths.tsx`, Corporate prefill effects, `same-page-anchors.tsx`, `smooth-scroll-to.ts`      | Extract page-local hash-landing lifecycle only where it clarifies teardown. Retain different landing timing/settle rules instead of inventing one global scheduler. Use shared interaction-event constants. Keep repeat-fragment interception and query preservation independent from layout/motion. Shorten historical headers, preserve current motion invariants.                                                             |
| B5 Home `specializations.tsx`, `testimonials.tsx`                                              | Retain approved full-width typography and line breaks. Remove obsolete sticky/side-rail comments; do not change the design during cleanup.                                                                                                                                                                                                                                                                                       |

Suggested atomic groups: Corporate decomposition; Workshop decomposition; rail
measurement; card/calendar presentation; navigation lifecycle and targeted comments.
After each group, validate its consumers before expanding. Stop extracting once
responsibilities are clear: no promised final line counts or minimum file count.

## Remaining touched files: inspect, preserve, avoid artificial refactors

- `countdown.tsx`: retain equal-width units, colon centering, reduced motion and
  large-day behavior; only clarify invariants/imports if needed.
- `workshop-availability.ts`, `workshop-availability-text.tsx`, `workshops.ts`:
  retain centralized policy/wording and catalogue shape; data volume is not complexity.
- Workshop `hero.tsx`, `overview.tsx`, `register-cta.tsx`,
  `registration-dialog.tsx`, `sticky-register-bar.tsx`: preserve policy usage,
  client trigger ownership, semantic IDs and observer teardown. Small leaf components
  should stay together; no consolidation that removes page-specific layout.
- Workshop registered `page.tsx`, `_sections/payment.tsx` and list section:
  preserve direct-route guards, confirmation fallback and past/open discovery.
- Corporate received `received.tsx`/`summary.tsx`: preserve wrapping/handoff fallback;
  use shared primitives only for actual duplication, not similar appearance.
- `layout.tsx`, `cta-banner.tsx`: already small integration points; leave APIs stable.
- Regression specs and `render-workshop-fixtures.cjs`: keep scenario ownership;
  extract repeated setup only when meaningful. Fixtures remain explicitly separate
  from hydrated/live-capacity proof. Do not weaken assertions to accommodate refactors.
- README, PRD, quality docs/config and milestone plan: document conventions and
  current contracts once, link history/evidence. Move detailed archived follow-up
  evidence to a review-history document if it improves navigation; preserve links,
  dates and provenance. Do not compress pending device/provider acceptance into done.
- Untouched large gallery, timeline, quote animations, globals and generic carousel
  primitives are backlog candidates for a separate audit, not this cleanup scope.

## Validation and completion gates

Existing UI foundations are evidenced: Button/Input/Label/Tabs/Dialog/Popover,
ScrollArrows, availability policy/text and reduced-motion hooks. Missing shared
patterns are serialized navigation, connected Field semantics and measured overflow.
No new UI library/showcase route is needed; exercise real page consumers.

Use Node 22+ and project-local Playwright cache (`PLAYWRIGHT_BROWSERS_PATH=0`).
For each task, run `npm run quality -- --file=<path> --stage=checkpoint --plan`,
then the selected checks without `--plan`; include each edited/new path. Update
`quality.config.json` only if new paths/checks escape existing ownership patterns.
Do not edit during checks or overlap heavy runs. Preserve unrelated working changes.

Behavior regression mapping: A1/A2 -> Corporate/Workshop layout suites; prefill and
navigation -> anchor-navigation; B2/B3 -> workshop-layouts/phone-feedback/public-site;
capacity/calendar -> workshop-availability; heading consumers -> core-pages-responsive.
At integrated handoff run `npm run quality:ci`, once per delivery package.

Render at 360/390/440/768/857/1024/1440px where relevant, with long values,
validation errors, touch/keyboard, reduced and normal motion, terminal rail edges,
same-count filter replacement, resize, unavailable capacity and storage fallback.
Representative screenshots must use actual production components. Compare with
approved visuals; investigate changed baselines rather than auto-accepting them.

Complete only when confirmed defects have focused regressions, shared contracts
have no duplicated implementations, workflows retain field values/prefill/submit
payloads, no stale timers/observers survive unmount, and final checks pass. Record
implemented, browser-verified, real-device, hosted and remote-CI evidence separately.
Independent review is appropriate after form/rail integration. This plan does not
claim physical-device or live-provider proof and does not authorize publishing.

## Implementation steering — 2026-10-07

The user authorized implementing the entire file inventory and adding adjustable
line checks. A and B are being integrated locally; the proposed dependent PR is
still a delivery boundary, not a created branch or publication claim.

New edit-stage source-size coverage scans source text only, counts nonempty and
physical lines, and supports reviewable warning/hard maxima plus exact-path
reasoned exceptions. [Code conventions](code-conventions.md) documents the
implemented contract. No arbitrary final file-size reduction is promised.

## Local implementation record — 2026-10-07

- A1/A2: implemented shared serialized navigation and explicit field-control
  semantics in both forms. Added DOM label/error, overlapping activation and
  date-range blur regressions. The first checkpoint exposed extra JSX whitespace
  children; repaired before the passing checkpoint.
- A3: programme-event contract centralized; page-specific wording and guards retained.
- B1: schemas/options/reviews extracted locally; Corporate date picker/date-only
  formatting and AlsoInterested have compact contracts, with one RHF owner.
- B2/B3: four consumers share measured overflow; Reveal exposes an explicit rail
  ref; EventCard and WorkshopDayPreview separate presentation from state ownership.
  Calendar date-grid helpers remain local because further extraction adds no benefit.
- B4/B5: Home and Corporate landing lifecycles extracted with interruption/teardown
  guards. Tracked prefill focus frames; current layout/motion preserved. Archived
  historical source headers in `docs/reviews/pr04/`. Existing testimonial heading
  comments are already current and were retained.
- Remaining inventory: small availability/leaf/confirmation/layout components,
  catalogue data and existing regression ownership retained after source review.
  Unrelated gallery/timeline/quote/global-style refactors remain deferred as planned.
- Configurable source-size edit check implemented and documented; no size exceptions
  remain. 300-line warnings and 600-line hard maximum count nonempty source lines,
  including comments; exceptions require an exact path, reason and bounded maximum.
- Physical source sizes: Corporate form 838 -> 570; registration 405 -> 364;
  EventCards 454 -> 325; calendar 325 -> 296; Home paths 543 -> 403.
  Extracted modules retain their code; these are orchestration-size improvements,
  not a claim that moving code removes system complexity.

Checkpoint passed formatting, size, lint/CSS, types and 19 tooling/isolated lifecycle
checks. Six focused form cases passed Chromium desktop/mobile and WebKit mobile.
Isolated hook tests inject a minimal hook adapter: lifecycle/control proof is separate
from React rendering, which the browser journeys exercise. Full gate and rendered
review results are recorded below. No commits or publication performed for this cleanup.

### Final local acceptance

`npm run quality:ci` passed formatting, configurable source size, lint/CSS,
typecheck, 19 tooling/isolated lifecycle tests, production build, nine OG checks
and 365 Playwright cases across all five projects (345 browser journeys plus 20
policy/server-markup fixtures). Independent final source review found no remaining
actionable regressions. Existing lint/CSS/environment warnings and intentional
source-size review warnings remain; there are no hard-limit failures or overrides.

Actual Chromium page renders were inspected at 431px for registration card,
filter overlays and Corporate validation errors, and at 857px for programme
heading wrapping. Captures are ignored local artifacts under `test-results/`.
The localhost/Wi-Fi preview is restored on port 3000. A metadata-only encoding
repair restored the unchanged package description after the full gate; final edit
checks covered it and the evidence updates. No functional source changed after
handoff validation. Physical-device, hosted and remote-CI proof remain separate.

### Publication delivery — 2026-10-07

The user requested commit and push of the verified local work. Delivery uses the
existing `fix/public-form-layouts` branch and PR #4, in atomic form, rail,
presentation/navigation, quality-tooling and documentation commits. This replaces
the proposed separate cleanup-PR delivery boundary; source scope is unchanged.
Remote CI and hosted acceptance must be checked independently after publication.
