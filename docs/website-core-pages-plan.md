# Website Design and Core Pages Delivery Plan

This is the shared checklist for completing the Website Design and Core Pages
milestone across reviewable PRs. Start with the portable quality harness and
repository documentation cleanup. Finish with the user's design and nitpick pass.

Created: 2026-10-02. Planning baseline: `main` at `f1408f4`.
PR01, PR02, and PR03 are merged. The local Firefox launch blocker was resolved with a
project-local browser installation during PR03 validation on 2026-10-05.
An unchecked item is pending unless its evidence explicitly records a failed check.

## Scope and decisions

- [x] Include Home, About, and Individual Workshop pages from Phase 1 of
      `Maximum Impact - SOW-2026-0006-v5 (1).pdf`, pages 1-3 (supplied separately).
- [x] Include the existing Workshops listing and Corporate Training page.
- [x] Include responsive layouts, navigation, calls to action, accessibility,
      approved logos and portraits, and frontend integration preparation.
- [x] Team supplies company logos; client supplies testimonial portraits.
- [x] User supplies final nitpicks and design references after the other work
      checks out. That polish is the final step.
- [x] Keep Lighthouse improvements optional.
- [x] Target `main`, except when a dependent PR temporarily targets its predecessor.
- [x] Keep CMS, CRM, Google authentication, real submissions, and automated emails
      with the projects responsible for Phase 2. API preparation does not implement
      those systems.
- [x] User confirmed on 2026-10-05: remove all Gallery pages and public mentions,
      including listing/detail routes, navigation links, and preview sections.
      This supersedes the FSD wording that retained gallery code in the demo.
- [ ] Obtain receiving-project API specifications and confirm integration owners.
- [ ] Receive the approved logo mapping and replacement files.
- [ ] Receive client-approved portraits and resolve the existing photo-consent item.
- [ ] Receive final design references and nitpicks before the last package.

Existing files are context, not approval of their contents. At the planning
baseline, all 93 company artwork references and all eight testimonial portrait
references resolve. Older missing-asset counts are stale. Identity, approval,
image quality, and current rendered behavior still need verification.

## How to use this checklist across PRs

- Use the package IDs below in PR descriptions; link to the relevant section.
- Fill in each package's PR and evidence fields when work starts. Update this same
  file rather than creating competing copies of the plan.
- Check an implementation item only after it is implemented; check acceptance only
  after its stated verification. Record blocked, skipped, or unavailable evidence.
- Mark a package complete only after its acceptance is met. Record merge status
  separately; local validation does not mean merged or deployed.
- For optional work, record an explicit decision to skip rather than a false pass.
- Preserve unrelated working-tree changes and stage explicit files or hunks.
- Pushes, PR creation, merges, deployments, and Production changes need the user's
  authorization; this document alone does not authorize them.

## Branches and review size

Each delivery group below has its own branch and Conventional Commit PR title. Atomic commits
use the same convention, with a scope where useful, such as `fix(workshops): ...`.
Prefer one coherent behavior plus its tests per commit.

Branch from the latest integrated `main`. When stacking, branch from the prerequisite
branch and target that branch temporarily. After it merges, update the dependent
branch, retarget `main`, and verify that the diff contains only the remaining work.

Aim for 200-400 authored lines per PR; review splitting around 500-600. This is a
reviewability guideline, not a reason to separate a change from its necessary tests.
Report lockfiles, binary assets, generated files, and detected renames separately.
Avoid whole-repository formatting. The first PR can be larger for the cohesive
harness import and mechanical documentation moves, but should not absorb unrelated
rewrites. Split substantial discovered cleanup into a named follow-up package if
necessary and record its dependency here.

## Consolidated delivery groups — 2026-10-05

The user requested fewer PRs to reduce review and workflow friction. Keep the old
package IDs as work-item references; they no longer each require a separate PR.
PR01/PR02 stay merged and PR03 stays on its existing separate branch.

| Delivery PR | Includes                                                                           | Branch and title                                                                                            |
| ----------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| PR03        | Current core/shared responsiveness and browser repairs                             | Existing branch/title below                                                                                 |
| PR04        | PR04 + PR05: Workshop and Corporate layouts and registration availability          | `fix/public-form-layouts`; `fix: public form layouts and workshop availability`                             |
| PR06        | PR06 + PR07 + PR08 + approved gallery removal: shared motion, presentation, assets | `fix/shared-public-presentation`; `fix: shared public presentation`                                         |
| PR09        | PR09 + PR10: typed content adapters, contracts, demo submission boundaries         | `refactor/frontend-integration-preparation`; `refactor: prepare frontend content and submission boundaries` |
| PR12        | Final polish; PR11 performance work only if measurements justify it                | Existing PR12 branch/title below                                                                            |

Use coherent commits within these groups. Pending portrait/logo approvals do not
block ready accessibility or gallery work: defer those asset commits if approval
is still missing. Split only when the actual diff or dependencies justify it;
avoid opening a separate PR solely for documentation or a small asset correction.
Physical-phone QA and agreed receiving API contracts remain separate acceptance
requirements. No new PR, push, or merge is authorized by this grouping.

## PR01 Quality harness and repository cleanup

Branch: `chore/quality-harness-and-repo-cleanup`
PR title: `chore: quality harness and repo cleanup`
Dependencies: none. Owner: main executor, including shared configuration and CI.
PR: [#1](https://github.com/iridel-co/adrianding-DEMO/pull/1). Evidence: full handoff
passed locally on Node 25.7.0 and in a clean clone on Node 22.23.3; GitHub's
`Lint, Format, Typecheck` check succeeded. Merge status: merged into `main` on
2026-10-04 at `5c86906`, verified through GitHub and fetched history.

- [x] Inventory root files, documentation, local/generated artifacts, existing
      tooling, and references before moving or removing anything.
- [x] Keep the root `README.md` as the entry point. Keep framework/package/tool
      configuration and any root `AGENTS.md` where their tools expect them.
- [x] Move `PRD.md` and `FSD.md` into `docs/product/`, preserving their filenames.
- [x] Move `MEETING-NOTES.md` into `docs/meetings/`, preserving its contents and
      filename. Preserve its original contents exactly and any concurrent author edits.
- [x] Add a concise `docs/index.md` linking this plan, current specifications,
      meeting records, and historical feedback passes. Keep scoped asset guidance
      such as `assets-src/README.md` beside the assets it explains.
- [x] Review `docs/feedback-passes/` for current versus historical status. Preserve
      decision and test evidence; clearly label historical material. Move to an
      archive only when superseded status is established, and document the mapping.
- [x] Repair relative links, anchors, source comments, and path references affected
      by moves, including links back to the root README. Check dangling references
      to documents that do not exist; correct or explain them without inventing evidence.
- [x] Reconcile verified stale status claims, such as missing-asset counts, in
      current documentation. Preserve dated meeting records unchanged; put current-status pointers in the documentation
      index instead of adding to those records.
- [x] Classify other apparently unused files before changing them. Remove only
      confirmed obsolete files; do not turn cleanup into a source-tree refactor.
- [x] Adapt the ZIP's runner, configuration, and self-tests under `scripts/quality/`.
      Import only needed files; leave `portable-quality-harness.zip` uncommitted.
- [x] Reuse existing lint, formatting, typecheck, CSS lint, build, and OG tools.
      Do not overwrite their configurations with the kit's templates.
- [x] Map checks to actual scripts and owning paths. Remove the sample's nonexistent
      `test:unit` reference and explicitly record application tests as pending PR02.
- [x] Verify a compatible Node 22+ version and align local guidance, package runtime
      expectations, lockfile metadata where needed, and CI. Use `npm ci`.
- [x] Adapt `.github/workflows/lint.yml` rather than run duplicate workflows. Review
      action references before enabling changes; do not change branch protection here.
- [x] Ensure generated Next types are available for clean-checkout typechecking.
      Ensure OG checks always follow a fresh build, including scoped harness runs.
- [x] Document edit/checkpoint/handoff stages and merge the quality guidance into
      applicable repository instructions without replacing existing user rules.

Suggested atomic commits: documentation moves and reference repairs;
`chore(quality): add portable runner and repository checks`;
`ci(quality): run the handoff gate on a consistent runtime`;
`docs(quality): document stages and coverage limits`. Keep content corrections
separate from mechanical moves when that makes rename review clearer.

Acceptance:

- [x] Review moves with rename detection and verify moved document contents.
- [x] Check local Markdown links/anchors and search for obsolete path references.
- [x] Verify install and checks from a clean checkout, not only a warm build cache.
- [x] Pass harness self-tests and exercise cumulative stage selection, explicit
      files, staged/base scopes, missing scripts, and deliberate failure propagation.
- [x] Verify Windows execution and the complete handoff gate; record CI evidence
      once publication is authorized (remote CI remains unverified). Harness tests are tooling coverage only.
- [x] Keep baseline failures visible; do not suppress them solely to get a green gate.

PR01 validation on 2026-10-02: locked clean installation succeeded; all six
handoff checks passed, including eight harness tests and nine OG cards. Inspector
exit 2 records the known application-test gap for PR02. Three ESLint warnings in
OG routes, one CSS named-color warning, and an outdated Browserslist data notice
remain visible. CSS notation changes were checked against the original parsed
rules, declarations, values, and breakpoints and found equivalent. Remote CI and
browser/device evidence remain unverified. The source ZIP remains uncommitted. Meeting notes are byte-identical to the original
record after their file move. CI retains the prior job display name for existing
required-check settings. Logo file presence is not artwork approval.

The first package includes the saved 331-line milestone checklist and imported
runner/tests, so its combined diff exceeds the usual size guideline. Review the
atomic documentation, harness, and CI/baseline commits separately; subsequent
feature packages retain the smaller scope targets.

## PR02 Public site regression coverage

Branch: `test/public-site-regressions`
PR title: `test: public site regressions`
Dependencies: PR01. Owner: main executor or a scoped test implementer.
PR: [#2](https://github.com/iridel-co/adrianding-DEMO/pull/2), approved and merged
into `main` on 2026-10-05 at `ee0f0a5`, verified through GitHub and fetched history.
Evidence: original 22-test Chromium handoff passed locally on 2026-10-04,
Node 25.7.0; expanded Chromium/WebKit selection passed 52 tests. Firefox launch
was blocked at the original review; successful local handoff is recorded under
PR03. Merge status: merged.

- [x] Add a small browser-test setup and register its real checks with the harness.
- [x] Cover navigation, representative workshop interactions, both demo forms, and
      confirmation fallbacks, including malformed or unavailable session storage.
- [x] Exercise keyboard navigation and a narrow viewport with deterministic data.
- [x] Keep setup and behavior coverage in coherent commits. Add regression cases
      alongside subsequent bug fixes rather than committing a failing baseline.
- [ ] Acceptance: tests demonstrate observable behavior, run without watch mode,
      and produce useful failure evidence. Record browser/install prerequisites.

PR02 uses a fresh production build and its own server on port 3100. Tests cover
keyboard navigation, filter reset, calendar month/date navigation, required-field
validation, step preservation, both personalized demo confirmations, and generic
fallbacks after client storage reads with missing, invalid-JSON, or blocked storage.
Fixed browser time is 2026-10-04; reduced motion avoids animation-dependent waits.
Failure screenshots/traces and HTML reports are ignored locally and uploaded by CI.
Browser prerequisites and report commands are in `docs/development/quality.md`.
Original seven-check handoff passed, including eight harness tests and nine OG cards.
The existing three ESLint warnings, CSS named-color warning, and Browserslist notice
remain visible. PR02 remote CI, real-device, and visual design acceptance
remain unverified; viewport emulation does not complete later UI packages.
Re-review on 2026-10-04 expanded the matrix to desktop Chromium/Firefox/WebKit
and mobile Chromium/WebKit, added lint ownership, fixed the browser timezone to
Asia/Manila, and tested both form submissions with blocked storage. Chromium/Firefox
assert Tab traversal; Windows WebKit tests focus and Enter activation because its
default mode excludes links from sequential Tab traversal. Failure screenshots and
traces were confirmed during the review's selector failures.
Checkpoint checks passed (including eight harness tests). Build and nine OG checks
passed. The complete 65-case run failed: Firefox's 13 cases could not launch the
downloaded binary (`spawn UNKNOWN`); Windows Application/SideBySide logs identify
an unresolved `mozglue` assembly despite the bundled DLL being present. After fixing
WebKit's test assumptions, all 52 Chromium/WebKit cases passed against a fresh build.
Firefox remains configured in CI and the full local handoff; it is not silently
skipped. Resolve its binary prerequisite or obtain successful CI evidence before
checking expanded acceptance. This is an environment failure before application
execution, not evidence of a Firefox site regression. No macOS/iOS proof is claimed.
Structurally invalid stored payload validation remains PR10. The source ZIP remains
uncommitted. PR03 proceeds from merged PR02; its local Firefox/device evidence gaps remain recorded.

Review follow-up on 2026-10-04: hotspot-origin development JavaScript requests
returned HTTP 403, preventing client hydration. Added an explicit, environment-fed
`allowedDevOrigins` list and documented LAN startup. The same asset request then
returned HTTP 200. In-app desktop browser checks over the hotspot address confirmed
FAQ hover expansion, Sales filtering (2 of 7), calendar month advancement,
inquiry sample filling and step advancement, workshop scroll controls, and seven
spread gallery cards. Real iPhone navigation still needs retesting after refresh.
The Building Winning Cultures event contains one reflection followed by photos;
additional event copy is not present in its current demo data. The public domain
currently uses coming-soon/interest links, while the Vercel demo uses workshop and
inquiry journeys. This development fix is included in PR02's review follow-up;
formatting and type checks passed. Real-device acceptance remains pending.

## PR03 Core page responsiveness

Branch: `fix/core-page-responsiveness`
PR title: `fix: core page responsiveness`
Dependencies: PR02. Owner: main executor for shared UI and Home/About consumers.
PR: [#3](https://github.com/iridel-co/adrianding-DEMO/pull/3), target `main`.
Branch based on integrated `origin/main` at `ee0f0a5`.
Evidence: locally implemented on 2026-10-05; full `quality:ci` passed, including
165 browser cases across all five Chromium/Firefox/WebKit projects. Merge status:
merged into `main` at `dc00ab849f2b387e419d82513a77adcecb9761ae`, verified through
GitHub and fetched history on 2026-10-06. GitHub's `Lint, Format, Typecheck` and
Vercel checks succeeded; physical-phone acceptance remains pending.

- [x] Reproduce current defects before editing, including the previously reported
      hero wordmark issue at widths of 402px and below.
- [x] Correct shared navigation/layout, then Home and About wrapping, spacing,
      imagery, and CTA visibility using existing `src/app/_components` patterns.
- [x] Separate shared fixes and page corrections into coherent commits; split the
      PR if both groups become substantial.
- [ ] Acceptance: no unintended horizontal overflow or clipped actions; mobile menu,
      focus handling, touch interactions, and reduced motion remain usable.

PR03 local evidence, 2026-10-05: reproduced footer wordmark overflow at 360px
(Adrian width 371.5px; Ding width 394.9px with its descender below the wrapper),
tablet path CTA wrapping and excessive timeline date-column width. Home's existing
hero wordmark and centered portrait already fit at 360/390/402px and were preserved.
Implemented small-mobile-only footer sizing (the intentional g crop was restored
per the latest user direction), removal of the public
staff-login footer link, menu focus restoration without scrolling, hidden marquee
scrollbars with scrolling retained, Home workshop/programme arrows, tablet hero
contrast, path spacing/alignment, and tablet-only timeline columns. Desktop footer
wordmark styles remain unchanged. Open About wordmark/carousel design decisions
remain deferred; gallery removal remains its separate package.

Formatting, source/CSS lint, types, eight harness tests, production build, and nine
OG checks passed (existing lint/CSS/Browserslist warnings remain). The initial full gate
failed: 107 browser cases passed, 27 Firefox cases failed before launch with
spawn UNKNOWN, and one WebKit desktop inquiry case failed to reach step 4.
Three focused inquiry repetitions yielded five passes and one recurrence across
six blocked/unblocked-storage cases, confirming an intermittent issue.
After restricting timeline rules to tablet, focused checkpoint/build/OG passed
again and all 56 PR03 responsive cases passed. These initial attempts did not
establish a passing full handoff.

Follow-up resolution: the same official Firefox build launches from Playwright's
supported project-local cache (`PLAYWRIGHT_BROWSERS_PATH=0`); the AppData launch
failure's precise Windows loader cause remains unverified. Setup and per-shell
environment requirements are documented in `docs/development/quality.md`.
WebKit traces exposed competing landing scrolls and early form interaction:
landing now reads the live motion preference, cancels its pending correction on
interaction/cleanup, and keeps the form inert until hydration. Reduced motion
overrides the root smooth-scroll utility; ScrollTrigger refresh waits for scrolling
to settle. Tests use an advancing demo clock and wait for client-side prefill.
A 40-case WebKit stress run passed before the final hydration guard; the final
source passed 18 repeated Firefox/WebKit inquiry and keyboard-interruption cases.
The subsequent full `quality:ci` passed all checks, including 145 browser cases
with every configured engine enabled. The final footer refinement adds 319px
coverage, tighter fluid mobile sizing and optical centering while retaining the
g tail crop. Final PR03 `quality:ci` passed all checks, including 150 browser
cases across every configured engine. Existing warnings remain. Real-phone and
remote CI acceptance remain pending.

Rendered Chromium checks also exercised normal-motion programme arrows, desktop
path hover, About at 768/1024/1440px without page overflow, and shared footers on
About/Workshops/Corporate at 360px. Screenshots and the first failed handoff report
are retained locally under ignored test-results/pr03/. Automated footer coverage
includes 319/360/390/402/639/640/768/1024/1440px, keyboard menu closing/focus, and mobile
and tablet carousel advancement/reversal. Workshop and programme arrows now use
the same shared control, including icons, hover, and disabled styling. The final
follow-up full gate passed all 150 browser cases. Source changes are committed
and PR03 is published; merge and remote CI status remain separate. Preserve the
pre-existing annotation intake and temporary designer notes outside the PR.

Mobile hero follow-up, 2026-10-05: normal-motion viewport resizing exposed a
portrait offset that earlier reduced-motion checks did not catch. Responsive
positioning now sits outside the GSAP transform target; mobile pointer movement
keeps the portrait centered. The rotating role line is centered below the name
below 640px, retaining the desktop cover alignment. Local Chromium rendering
confirmed portrait and role-line centering at 360/390/402px. Added motion-enabled
resize regressions at those widths; full `quality:ci` passed all checks and 165
browser cases across all configured projects. Device and remote CI proof remain
separate.

## PR04 Workshop responsiveness

Branch: `fix/public-form-layouts`
PR title: `fix: public form layouts and workshop availability`
Dependencies: PR03 shared layout changes. Owner: scoped workshop implementer.
PR: [#4](https://github.com/iridel-co/adrianding-DEMO/pull/4). Evidence: implemented locally from verified integrated `main` at
`dc00ab8`; final full gate passed on 2026-10-07. Merge status: open; remote CI pending.

### PR04 execution contract — 2026-10-06

Documentation reconciliation is required before application implementation. PR04
and PR05 are one delivery group: shared scrolling controls, Workshop registration
availability and responsive layouts, and Corporate inquiry/confirmation layouts.
Use sequential shared-component integration, followed by disjoint page fixes.
Preserve existing carousel presentation and designer-intent questions for PR12.
Calendar dates open an accessible preview with explicit workshop links; navigation
must not depend on hover. Mobile form actions fill the available width, with equal
Back/forward areas; preserve the existing larger-screen action arrangement.

Availability uses the demo catalogue, consistently distinguishing available,
fully booked, past/closed, and unknown capacity. Block normal registration when
unavailable and remove unsupported waitlist promises. Backend seat enforcement,
live rejection, and receiving API contracts remain PR09/PR10 dependencies; no
booking service or new integration is claimed. Gallery removal stays in PR06.
Primer content and optional layout redesigns remain deferred.

Before handoff, update current README/product behavior descriptions as needed,
record focused and full quality results here, and keep device/hosted/CI evidence
separate. Preserve historical meetings, local designer notes, and the harness ZIP.

- [x] Audit and correct the listing's filters/calendar and workshop detail layouts.
- [x] Required before the next PR04 push: sweep shared horizontal lists and their
      consumers on Home, Workshops, and Corporate Training. Centralize controls
      in `src/app/_components/scroll-arrows.tsx`; reuse icons, sizes, borders,
      hover/focus and disabled states, accessible names, and reduced-motion rules.
      Preserve page-specific labels and behaviour rather than copying controls.
- [x] Fix the annotated Workshops listing at 440×824: its filtered
      `EventCards` uses `variant="grid"`, which still scrolls horizontally on
      mobile, but arrows are gated by `!isGrid`. Show shared arrows whenever the
      active layout actually overflows; retain the desktop grid without redundant
      controls. Reset/re-measure edges after filtering and breakpoint changes.
- [x] Inventory other arrow/carousel implementations and filter-chip overflow;
      consolidate equivalent controls, remove stale layout comments, and record
      justified differences. Do not require arrows on non-scrollable content or
      confuse carousel navigation with form Back/Continue actions.
- [ ] Verify first/last-item disabled states, keyboard and touch use, filter changes,
      no-results/single-item lists, mobile-to-desktop resizing, reduced motion,
      and no page overflow across the affected consumers before publication.

- [x] Cover no registrations yet (all seats available), partially filled, last seat,
      fully booked (zero seats), closed/past, and unknown/unavailable capacity.
      Also cover an empty catalogue, no filter matches, and a month without events;
      distinguish these from loading and fetch failure once an API is connected.
- [x] Use consistent availability in cards, calendar, hero, overview, closing CTA,
      sticky bar, and direct registration entry. Fully booked must not open normal
      registration; past/closed must not advertise remaining seats. Keep useful
      workshop details and an accessible state message visible.
- [x] Resolve the current zero-seat mismatch: closing CTA says Fully booked but
      still opens registration. Recheck confirmation/payment capacity messaging.
      Do not invent waitlist behaviour before the receiving-project contract agrees it.
- [ ] Test transitions from available to full, full to reopened, and availability
      changing during a form: preserve entered fields, explain rejection, and do
      not show a successful booking when the receiving service rejects capacity.
      Server enforcement and seat-holding transitions remain backend-owned.
- [x] Check registration dialogs, form validation, sticky CTAs, and confirmation
      layout; group commits by interaction and preserve demo behavior.
- [ ] Acceptance: keyboard/touch journeys and representative open/past workshop
      states work at the agreed widths; sticky controls do not obscure content.

## PR05 Corporate page responsiveness (included in PR04)

Delivery: PR04 branch/title; keep these tasks as a separate commit group.
Dependencies: PR03 shared layout changes. Owner: scoped corporate-page implementer.
PR: [#4](https://github.com/iridel-co/adrianding-DEMO/pull/4). Evidence: local implementation verified with PR04. Merge status: open; remote CI pending.

- [x] Audit and correct programme carousel, inquiry form, and confirmation layouts.
- [x] Preserve programme prefill, multi-select behavior, and validation; separate
      carousel and form corrections into commits where independently reviewable.
- [ ] Acceptance: long content, touch/keyboard controls, invalid form states, and
      confirmation fallbacks remain usable without clipping or overflow.

### Implemented and locally verified — 2026-10-07

README and PRD describe the frontend availability and form behavior. The full
quality gate passed formatting, lint, CSS, typecheck, eight harness tests,
production build, nine OG checks, and 305 cases in all five Playwright projects.
This comprises 285 live browser journeys and 20 policy/server-markup fixtures;
full/unknown-capacity fixtures do not certify hydrated or live backend behavior.
Independent review found no remaining actionable regressions.

The final filter fade alignment adjustment then passed formatting/lint, a fresh
production build/typecheck, 16 affected Chromium desktop cases and six Chromium/
WebKit mobile cases. Native Safari/physical phone, hosted preview, and new-PR CI
acceptance remain open. Server seat enforcement, seat holds and live rejection
remain PR09/PR10 work. The unchecked mixed verification bullets above preserve
these pending acceptance boundaries rather than indicating unimplemented layout.

## PR06 Marquee accessibility

Branch: `fix/shared-public-presentation`
PR title: `fix: shared public presentation`
Dependencies: PR02 and any shared UI changes touching these components.
Owner: main executor for testimonial/company shared components.
PR: pending. Evidence: pending. Merge status: not started.

- [ ] Remove hidden duplicate testimonial cards from keyboard navigation.
- [ ] Provide persistent, accessible pause/resume controls for moving testimonials
      and company content, preserving reduced-motion and touch behavior.
- [ ] Keep clone-focus correction and motion-control behavior identifiable in commits.
- [ ] Acceptance: focus cannot enter hidden duplicates; controls expose their names
      and state; user-requested pause is not undone by hover/focus transitions.

## PR07 Company logo presentation (included in PR06)

Delivery: PR06 branch/title; asset approval remains required.
Dependencies: team-approved logo mapping/files and relevant shared UI fixes.
Owner: scoped asset implementer; shared component edits coordinated centrally.
PR: pending. Evidence: pending. Merge status: not started.

- [ ] Audit existing artwork against the supplied mapping; replace only identified
      files and normalize presentation where necessary.
- [ ] Keep asset replacement and component sizing changes separately reviewable.
- [ ] Acceptance: correct identity, aspect ratio, legibility, contrast, and working
      references across relevant backgrounds and mobile/desktop consumers.

## PR08 Testimonial portraits (included in PR06)

Delivery: PR06 branch/title; identity and consent approval remain required.
Dependencies: client-approved portraits/consent and relevant shared UI fixes.
Owner: scoped asset implementer; shared component edits coordinated centrally.
PR: pending. Evidence: pending. Merge status: not started.

- [ ] Map approved portraits to the eight testimonials and apply consistent crops
      and appropriate image descriptions; preserve testimonial wording.
- [ ] Preserve existing assets until approved replacements are available.
- [ ] Acceptance: verify identity/approval, reference integrity, image sizing, and
      mobile/desktop crops; existing files alone do not prove approval.

## PR09 Frontend integration contracts

Branch: `refactor/frontend-integration-preparation`
PR title: `refactor: prepare frontend content and submission boundaries`
Dependencies: PR01 document organization; counterpart input for agreed contracts.
Owner: main executor coordinates frontend and receiving-project boundaries.
PR: pending. Evidence: pending. Merge status: not started.

- [x] Retain the workshop catalogue in `src/lib/workshops.ts`. The user reversed
      the JSON migration on 2026-10-05; JSON fixtures and migration-only tooling
      changes were removed. Keep TypeScript authoring checks and provenance comments.
- [ ] Inventory programme, FAQ, testimonial, and company data consumers. Prepare
      typed data adapters and runtime API-response validation where the agreed
      receiving contract requires them; JSON extraction is no longer planned.
- [ ] Define proposed availability and empty/loading/error contracts separately
      from lifecycle and reservation status. Agree count validity, unknown counts,
      authoritative capacity refresh/rejection, and any waitlist with API owners.
      No registrations yet means available capacity, not a fully booked workshop.
- [ ] Inventory content and form fields, stable workshop/programme identifiers,
      media/OG requirements, frontend states, and receiving-project ownership.
- [ ] Account for every collected submission field, including corporate phone,
      role, context, and consent; distinguish payloads from confirmation-display data.
- [ ] Record proposed versus agreed contracts and unresolved decisions. Do not
      invent API endpoints, providers, authentication, or response guarantees.
- [ ] Document the existing Phase 2 requirement: a failed CRM write cannot show real
      success; email failure must not erase a successfully recorded lead.
- [ ] Acceptance: owners can identify inputs, outputs, validation/error needs, and
      responsibilities. Inventory can proceed now; agreement needs counterpart input.

## PR10 Demo submission boundaries (included in PR09)

Delivery: PR09 branch/title; shared adapters and each form get coherent commits.
Dependencies: PR02, PR09's necessary data decisions, and relevant form layout work.
Owner: main executor owns shared types/adapters; forms follow settled interfaces.
PR: pending. Evidence: pending. Merge status: not started.

- [ ] Separate complete validated form payloads from confirmation-display data.
- [ ] Isolate small demo-local submission boundaries and validate stored confirmation
      data at runtime, with explicit submitting/result/error states.
- [ ] Preserve demo behavior without network writes or claims that real leads exist.
- [ ] Add focused behavior tests for invalid payloads, failures, and fallback states.
- [ ] Keep workshop/corporate migration in PR09 by default; split only if the
      actual diff warrants it. Shared contracts precede form adapters within the PR.
- [ ] Introduce CMS/content adapters only where an agreed boundary justifies them.
- [ ] Acceptance: both form journeys still work; confirmation data is not reused as
      an incomplete API payload; real integrations remain with their owning projects.

## PR11 Public page loading optional (included in PR12 if useful)

Delivery: PR12; no standalone performance PR by default.
Dependencies: stable UI/assets and completed relevant integration preparation.
Owner: main executor or scoped performance implementer.
PR: pending. Evidence: pending. Merge status: not started. Decision: pending.

- [ ] Record whether to perform or skip this optional package.
- [ ] Measure production-build Lighthouse baselines with route, environment, and
      device profile recorded. Do not treat development-server results as the baseline.
- [ ] Address demonstrated bottlenecks in separate behavior-focused commits.
- [ ] Acceptance: comparable before/after evidence and no functional/visual
      regressions; no arbitrary score target. Skip the PR if no useful changes emerge.

## PR12 Final design polish

Branch: `fix/final-design-polish`
PR title: `fix: final design polish`
Dependencies: required preceding packages accepted, PR11 completed or explicitly
skipped, and the user's final references supplied. Owner: main executor.
PR: pending. Evidence: pending. Merge status: not started.

- [ ] Capture the supplied nitpicks as concrete checklist items before editing.
- [ ] Apply related corrections by component/page family, splitting unrelated or
      substantial batches into separate named branches and PRs.
- [ ] Match the supplied references without expanding into an unrequested redesign.
- [ ] Acceptance: compare affected mobile/desktop views and rerun affected browser
      checks and performance measurements. This remains the final polish package.

## Milestone verification and handoff

### Desktop annotation intake — 2026-10-05

Scope correction after the supplied FSD cross-check: gallery-specific comments
in all intakes below are superseded and excluded from current implementation.
Their historical wording is retained for traceability, not as active work.

User review at 1440 × 900 on the local development app. These are pending
findings, not implementation or acceptance evidence. Apply behavioral fixes at
all supported widths and verify again on mobile emulation and the real phone.

- [ ] Comment 1, PR04: keep Complete registration visible but disabled until
      information-collection consent is checked; retain submission validation.
- [ ] Comment 2, PR05: use consistent, actionable validation language across both
      forms, such as “Please enter your company name” and “Please enter your role
      or title,” rather than mixed questions and fragments.
- [ ] Comments 3 and 6, PR05: after successful Continue or Back transitions, bring
      the inquiry form's step heading into view below the sticky navigation.
      Handle long-to-short transitions, keyboard focus, and reduced motion.
- [ ] Comment 4, PR04/PR05: use a consistent required/optional label convention
      across both forms. Recommended direction: retain explicit “(optional)”
      labels and explain that other fields are required; verify labels against
      actual validation, including conditional date fields.
- [ ] Comment 5, PR05: keep Send inquiry visible but disabled until
      information-collection consent is checked; retain submission validation.
- [ ] Comments 1 and 5, PR10: preserve consent enforcement when forms move to
      submission adapters; unchecked consent must not submit through another path.
- Superseded/out of scope — desktop comment 7, former PR09/PR12 content follow-up:
  gallery detail pages should use the
  same structural format. Audit and list missing text per event for the
  future CMS/CRM content handoff; do not invent replacement copy or mark
  backend population complete. Gallery feature expansion remains excluded.

### Mobile viewport annotation intake — 2026-10-05

General requests carry across relevant pages, shared components, and responsive
widths, even when first reported at a mobile viewport. Apply consent gating,
step scroll/focus handling, reachable filters, non-hover interaction, discoverable
carousel controls, and overflow containment wherever the same behavior exists.
Viewport-specific spacing, image composition, and button/layout proposals still
need contextual review; do not copy a mobile arrangement indiscriminately to
desktop. Repeated reports reinforce one requirement rather than separate fixes.

User review at 390 × 844 in the desktop browser's mobile viewport. These are
pending findings and design questions; touch behavior has not been established
on a real phone. Comment numbers below belong to this mobile intake only.

- [ ] Comment 1, PR03/PR06: remove the visible horizontal scrollbar from the Home
      hero's descriptive text treatment. Preserve readable content and verify
      overflow, animation, and reduced-motion behavior rather than just hiding
      the page's overflow.
- [ ] Comment 2, PR03/PR12, open design question: improve distinction between
      Home's vertically stacked individual/corporate paths; consider a separator
      or spacing treatment during the nitpick pass.
- [ ] Comments 3, 4, and 14, PR03/PR05: verify Home workshop/programme and Corporate
      programme carousels work with touch, keyboard, and desktop pointer input at
      mobile widths. User could not move them in desktop viewport emulation.
      Provide discoverable previous/next controls and an indication of more cards.
      Edge fade/blur styling remains an open design question for PR12.
- Superseded/out of scope — mobile comments 5 and 9, former shared gallery check:
  Home's Inside the
  room and Workshops' Past events previews feel cramped. Verify touch access
  and usable event links without hover; retain All events. Whether to use a
  scrollable preview or another mobile layout remains open for PR12, without
  adding Gallery features.
- [ ] Comment 6, PR04: provide tap/click access to calendar event information
      instead of relying on hover. Proposed interaction: a horizontally centered,
      viewport-contained popover with an explicit event link; settle navigation
      behavior and verify dismissal, focus, and touch use before implementation.
- [ ] Comment 7, PR04: verify every workshop filter can be reached and activated
      in the horizontal mobile filter strip, including touch and keyboard access.
- [ ] Comments 8 and 15, PR03/PR05/PR07, open design question: decide whether
      industry filters should keep their full wrapped layout or share the workshop
      filter's horizontal pattern. Consistency must preserve discoverability;
      do not change both styles before discussing the tradeoff in the nitpick pass.
- [ ] Comment 10, PR04: verify many/long workshop focus-area labels wrap into
      readable rows over the hero image. Wrapping is the proposed direction;
      avoid requiring horizontal scrolling for static metadata.
- [ ] Comment 11, PR04/PR12, open design question: consider separate date/time rows
      on mobile to prevent awkward line breaks; compare information density before
      choosing the final layout.
- [ ] Comment 12, PR04/PR12, open content/layout question: reconsider the small
      primer-video container after its intended content is settled. The current
      placeholder is not evidence of a finalized player or approved recording.
- [ ] Comments 13 and 16, PR04/PR05/PR12, open contextual layout question: consider
      centering or full-width treatment for the workshop's Coach Adrian CTA;
      corporate's left-aligned CTA reads better after its paragraph. Do not force
      identical alignment without comparing the surrounding content.
- [ ] Comment 17, PR05: inquiry step controls should fill the mobile width; use one
      full-width forward action initially and equal-width Back/forward actions on
      subsequent steps. Keep the contact alternative readable and separate.
- [ ] Comments 18 and 19, PR05/PR10: repeat the desktop requirements for scrolling
      to the form heading on Continue/Back and disabling submission without consent.
      Verify these behaviors at mobile widths and on the real phone.

### Tablet viewport annotation intake — 2026-10-05

User review at 768 × 1024 in desktop browser viewport emulation. Comment numbers
below belong to this tablet intake only; findings remain pending reproduction,
implementation, and verification.

- [ ] Comment 1, PR03/PR06/PR12: improve contrast for the Home hero name and
      descriptive text over the portrait. Proposed treatment: a localized dark
      gradient with soft faded edges, avoiding a hard overlay boundary. Record
      observed image pixelation for asset-quality review; do not assume its cause
      or replace imagery without inspecting source and delivered image dimensions.
- [ ] Comments 2 and 3, PR03: correct overflow and uneven alignment in both
      individual/corporate path panels, including text and CTA wrapping. Preserve
      visual balance at the tablet breakpoint. Record pixelated path imagery for
      asset-quality follow-up; approved higher-resolution sources may be needed.
- [ ] Comments 4, 5, 9, and 14, PR03/PR04/PR05: extend the mobile carousel control
      requirement to tablet Home workshop/programme cards, Workshops listing,
      and Corporate programmes. Preserve the useful partial-next-card hint and
      add discoverable navigation controls with keyboard/touch access.
- [ ] Comment 6, PR03/PR12: bring About timeline achievement/certificate content
      closer to its year at tablet widths; compare a tighter column layout so
      the date and corresponding content are visually connected.
- [ ] Comment 7, PR04: extend the calendar tap/click event-preview proposal to
      tablet; settle the preview-then-explicit-navigation behavior and verify
      viewport containment, dismissal, and keyboard focus.
- [ ] Comment 8, PR04: verify all filters are reachable and usable at tablet
      widths, matching the smaller mobile filter accessibility requirement.
- Superseded/out of scope — tablet comment 10, former gallery check/PR12: provide a clear
  navigation affordance for tablet Past events previews and usable event
  access without hover; final preview treatment remains an open design choice.
- [ ] Comments 11 and 12, PR04/PR12, open layout question: improve the overly wide
      tablet countdown/reservation block. Compare workshop date/location/price
      and reservation controls in two columns, retaining readable timer units,
      seat information, CTA, and explanatory text without crowding.
- [ ] Comments 13 and 18, PR04/PR05/PR12, open layout question: improve the workshop
      registered page's narrow left-heavy information layout. Use the Corporate
      inquiry confirmation's structured card grid as a comparison/reference;
      assess reflow and useful content rather than inventing filler on the right.
- [ ] Comment 15, PR05, open breakpoint question: consider extending full-width
      inquiry controls and equal-width Back/forward buttons to tablet, with the
      contact alternative separate. Compare against the current inline layout.
- [ ] Comments 16 and 17, PR05/PR10: verify step navigation returns to the form
      heading and final submission stays disabled without consent at tablet
      widths, as already required in the desktop/mobile intakes.

### Narrow mobile viewport annotation intake — 2026-10-05

User review at 360 × 800 in desktop viewport emulation. Comment numbers below
belong to this intake only. Annotated screenshots are attached to the user's
360 × 800 review message in this chat as temporary visual references; no local
screenshot copies have been exported. Preserve that distinction when handing off
these notes. Designer-intent questions await the user's discussion with the
original designer and must not be treated as approved corrections.

The “is this intentional?” items are also collected in the
[temporary designer-question document](feedback-passes/designer-intent-questions-temp.md)
for the user's discussion. It is local review material, excluded from PR/commit
scope unless requested; screenshot references point to this chat's attachments.

- [ ] Comments 1 and 2, PR03/PR06: remove the Home descriptive-text scrollbar as
      already reported; center the hero portrait at narrow widths so Adrian is
      not mostly cropped off the right while the text sits above him.
- [ ] Comment 3, PR03/PR12, open design question: center the selected About timeline
      slide without a partial next-slide leak when arrows and pagination already
      show navigation. Discuss whether this should also guide workshop/programme
      carousel presentation; do not override earlier overflow-hint proposals
      before choosing the shared interaction direction.
- [ ] Comment 4, PR03/PR12, designer-intent question: the oversized Adrian Ding
      wordmark on About extends beyond its container. Keep the annotated screenshot
      for the user's designer discussion before deciding whether to change it.
- [ ] Comment 5, PR04/PR12: refine the earlier date/time layout proposal. At narrow
      widths the date already wraps, so do not force an additional separate time
      row indiscriminately. Compare wrapping that preserves readable time ranges.
- [ ] Comment 6, PR04/PR12: repeat the primer-video sizing concern at 360px;
      consider a larger/full-available-width container once content is settled.
- [ ] Comment 7, PR04/PR12: review credential images and labels for adequate size
      and readability on narrow screens; compare spacing and column count.
- [ ] Comment 8, PR04/PR12: break the closing registration CTA's date/time, venue,
      and seat information into readable mobile groups; avoid awkwardly split
      time ranges and venue text.
- [ ] Comment 9, PR04/PR12, open shared-button design question: choose either a
      content-sized Explore corporate training CTA or full-width content with
      its arrow aligned to the far edge; apply the settled rule to comparable CTAs.
- [ ] Comments 10 and 11, PR04/PR10: registration controls should occupy the mobile
      width with equal Back/forward portions. Correct dialog horizontal overflow
      and scrollbar-related spacing while retaining usable vertical scrolling,
      reachable close/action controls, and consent-gated final submission.
- [ ] Comment 12, PR05: stretch the Pick dates/Not fixed yet control across the
      available mobile form width, with readable equal option areas.
- [ ] Comment 13, PR05: repeat equal-width Back/forward controls and scroll/focus
      return to the form heading after step changes at 360px.
- [ ] Comment 14, PR04/PR05: use the self-contained Corporate confirmation-step
      layout as a reference for workshop dialog containment and wrapping; preserve
      dialog-specific scrolling/focus behavior rather than copying it blindly.
- Superseded/out of scope — narrow mobile comments 15, 16, and 17, former gallery check/PR12,
  designer-intent questions: gallery detail images extend rightward or appear
  heavily offset/cropped to the left. User will ask the original designer
  whether these compositions are intentional. Keep each annotated image as
  temporary reference; do not normalize crops/offsets before that discussion.
  Separately reproduce whether there is unintended page horizontal overflow.

Real-phone review remains pending. Place fixes in their owning packages above;
PR12 remains the final visual polish and regression pass. Open design questions
are not approved implementation choices, and no app fixes are claimed by intake.

### Supplied FSD cross-check — 2026-10-05

### Shared footer mobile wordmark refinement — 2026-10-05

User supplied two visual adjustments at 360 × 800, then explicitly requested
plan-only capture for later PR implementation. This is shared-footer work in
`src/app/_components/site-footer.tsx`, applicable to all consuming pages rather
than gallery-specific work. Owner: PR03 shared responsiveness, with PR12 polish.

- [ ] Fit the stacked Adrian/Ding wordmark within the available mobile width,
      keeping both words centered and fully readable with comfortable edge space.
      Reduce their relative sizes using fluid/container-aware typography and
      relative spacing; do not hardcode the preview's pixel sizes or margins.
- Superseded by the user's latest PR03 direction: retain the intentional crop of
  Ding's g descender. Restored the mobile negative bottom margin while preserving
  fitted width and the existing desktop crop. The footer regression assertion
  now distinguishes this intentional crop from horizontal overflow.
- [ ] Start with the existing mobile-only `sm:hidden` branch; preserve the desktop
      `sm:block` wordmark treatment. The user explicitly restricts this refinement
      to small mobile screens: do not change tablet, desktop, larger-screen font
      sizes, margins, layout, or shared tokens that alter those views. Verify the
      existing `sm` breakpoint and keep this adjustment below it; do not widen the
      mobile treatment. Do not copy browser preview attributes.
- [ ] Verify 360px and 390px widths, the mobile range approaching the breakpoint,
      font-loaded rendering, and no horizontal overflow or glyph clipping across
      representative public pages. Check desktop/tablet wordmarks for regressions.
      Compare just below and at the `sm` breakpoint and at 768px/1440px to confirm
      the existing larger-screen presentation is preserved.

Reference only: Adrian preview changed 122.4px to 109.4px; Ding changed 183.6px
to 156.6px, right margin to 4px, and bottom margin from -34.452px to 16px.
Adrian's padding-right edit supplied no value, so it defines no numeric change.
The screenshots remain attached to this chat. Source inspection confirms the
current crop is intentional in comments, but the user's latest refinement gives
the worker a new mobile target; no app implementation was made during intake.

This supersedes the narrow-mobile About/footer wordmark question for the mobile
treatment. Gallery image-intent questions remain inactive and out of scope.

### FSD cross-check findings

Later user confirmation on 2026-10-05 supersedes the gallery-retention conclusion
below: all gallery pages and public mentions are to be removed. Other findings
remain applicable; the original FSD content is preserved as historical evidence.

Reviewed `C:/Users/Mat/Downloads/Adrian Ding _ Functional Specifications Document
(FSD).docx`, including Core Website Features, Categorized Project Scope,
Out-of-Scope, Functional Flows, and Open Decisions, against `docs/product/FSD.md`
and the current package plan. Text was extracted from the DOCX; document layout
and page numbering were not verified. The original supplied document is unchanged.

- Gallery: both sources exclude gallery delivery and say static demo code stays
  for possible future expansion. Supersede desktop comment 7; mobile 390px comments
  5 and 9; tablet comment 10; narrow 360px comments 15–17. Remove them from current
  polish/content/CMS handoff work, including the earlier proposed gallery content
  audit. This does not establish removal of visible demo pages, sections, or links.
- Designer questions: gallery crop/offset questions in the temporary document are
  inactive/out of scope. The mobile footer wordmark question is now superseded by
  the user's responsive refinement above.
- Core frontend scope: responsive Home, About, workshop browsing/detail,
  registration, and Corporate inquiry still align. General annotation requirements
  continue across relevant pages and widths; no gallery work is required for them.
- Consent: both forms must collect explicit consent before submission. Keep the
  recorded UI gating and validation requirements in PR04/PR05/PR10; consent wording,
  demographics/analytics purposes, retention, and optional marketing consent remain
  decisions for the responsible owners, not resolved by disabling a button.
- Public staff link: supplied OPEN-13 has an Oct 2 update to remove the public
  footer staff-login link. The local FSD still calls this open; the current footer
  still links to `/staff-login`. Add this frontend follow-up to PR03/PR12 without
  removing the staff route or changing staff authentication scope.
- Primer video: supplied OPEN-12 and the explicit teaser-video question remain
  unresolved. Review responsive container usability in PR04, but defer content,
  player assumptions, and email reuse until confirmed.
- Assets/copy: supplied OPEN-27 records client logos added, consistent with the
  plan's resolved file references. This does not verify asset approval, identity,
  image quality, or photo consent. Stats, credentials, programme copy, and consent
  approvals remain separate open inputs; avoid inventing replacement content.
- Phase 2 boundaries: CRM/CMS, Google staff sign-in, real records, payment
  verification, transactional email, waitlists, and seat holds remain backend
  delivery work. PR09/PR10 prepare agreed frontend boundaries; they do not claim
  those integrations or backend status based on the supplied document.

Resolve these source inconsistencies with the document owners before treating
them as implementation contracts:

- The supplied stack table specifies TanStack Start, BetterAuth, and VPS Postgres,
  while its system tables and this repository use Next.js. No framework migration
  is included in this milestone or authorized by this cross-check.
- Its in-scope summary mentions PayMongo invoice generation, while repeated
  exclusions prohibit PayMongo integration and online gateways. Manual payment
  instructions/verification remain the current boundary pending clarification.
- Its E9 table describes a waitlist-seat email but later says E9 is unused and the
  offer uses E1. Its internal N-series table lists public recipients and external
  email content, unlike the local FSD's staff notifications. Clarify recipients
  and triggers before wiring emails; note the supplied requirement to notify both
  primary and secondary owner addresses.
- Its systems table uses future Dec 9, 2026 decision dates for Resend/manual
  payment, unlike the local Sep 30 dates; gallery scope dates also differ between
  Sep 30 and Oct 1. Record as document discrepancies, not verified decision dates.
- Supplied state tables contain mismatched transition-trigger wording and
  cancellation seat-release wording that omits PROOF_RECEIVED, despite defining
  it as seat-holding. Backend owners must reconcile these with the local state
  model before implementing capacity changes.

Physical phone QA remains explicitly required (supplied OPEN-31). Viewport
annotations and automated tests do not satisfy it. No gallery removal or app
implementation was performed during this cross-check.

### Confirmed gallery removal — 2026-10-05

The user reports confirmation to remove all gallery mentions and pages. Record
this as approved implementation scope for the PR worker, not a pending designer
question. This intake edits the plan only; removal is not yet implemented.

- [ ] Deliver gallery removal as a coherent commit in consolidated PR06 before
      final PR12 polish; coordinate with PR03 navigation and PR04 workshop media.
      A separate removal PR is only needed if the actual scope warrants a split.
- [ ] Remove `/gallery` and `/gallery/[slug]` pages and gallery-specific metadata.
      Remove links from desktop/mobile navigation, footer, CTAs, and other public
      consumers; remove Home's Inside the room and Workshops' Past events previews
      and any other gallery sections or mentions discovered during the source audit.
- [ ] Remove exclusively gallery-owned components, data, and assets only after
      checking their consumers. Preserve shared workshop, corporate, portrait,
      testimonial, and footer assets/behavior. Do not delete media just because
      it also appears in the gallery.
- [ ] Update active repository scope documentation, route maps, sitemap entries,
      and tests as applicable so they do not advertise gallery delivery or routes.
      Historical review notes/screenshots may remain explicitly superseded; the
      source DOCX is not to be silently rewritten.
- [ ] Verify removed routes produce the expected not-found response, no public
      gallery links/sections remain, adjacent layouts close cleanly at all reviewed
      widths, and existing workshop/inquiry journeys still work. Run scoped quality
      checks and required public-site browser regressions at package handoff.

Gallery-specific annotation and designer questions remain superseded. Shared
footer/mobile refinements remain active across the surviving pages, including
the small-mobile-only wordmark treatment that preserves larger-screen styling.

Prefer one sequential execution stream for overlapping UI work. PR04 and PR05 can
proceed independently after shared interfaces settle; logo and portrait preparation
can proceed independently in disjoint asset files. Shared component/configuration
edits remain centrally owned. No fixed agent count is required.

- [ ] Verify representative widths of 360, 390, 768, 1024, and 1440 pixels, plus
      affected breakpoints, zoom behavior, long content, and real-device mobile QA.
- [ ] Check navigation, keyboard focus, touch interaction, reduced motion, readable
      content, and unobstructed calls to action across all scoped pages.
- [ ] Check form validation, submission states, and confirmation fallbacks.
- [ ] Capture current before/after UI evidence; historical screenshots and source
      inspection are not current rendered proof.
- [ ] Run focused checks per package. Run broader required gates at harness
      acceptance, completed UI/test integration, and final milestone acceptance.
- [ ] Keep automated, browser, real-device, CI, and external-system evidence distinct.
- [ ] Record unresolved content approvals, API dependencies, blocked checks, and
      optional work explicitly before handoff.
- [ ] Confirm each completed package's PR, evidence, and merge status above.

## Repository references

These paths include the PR01 documentation moves.

- [Repository overview](../README.md)
- [Product requirements](product/PRD.md)
- [Phase 2 functional specification and open decisions](product/FSD.md)
- [Client meeting notes](meetings/MEETING-NOTES.md)
- [Historical feedback passes](feedback-passes/)
- [Current quality workflow](../.github/workflows/lint.yml)
- [Package scripts](../package.json)

The supplied SOW is an external reference, not copied into this repository. This
plan does not treat document contents as authorization to implement Phase 2.

### PR04 phone review follow-up — 2026-10-07

Inline fading filter chevrons disappear at terminal edges; center the countdown,
hide sticky registration at the closing CTA, reduce consent/action spacing, and
use a short finish label/icon. Repair repeated section links and cancel landing
corrections on visitor input. Corporate choice opens the page overview; programme
links retain inquiry prefill. Include past workshops in the calendar and a separate
closed-registration listing. Follow-up full gate: 305 passed across all five projects; final fade alignment
passed 22 affected desktop/mobile checks. Visual captures at 454px were inspected
under ignored `test-results/phone-review/`. User phone re-review remains pending.

### PR04 countdown refinement — 2026-10-07

Phone review requests removing the filling-up sentence and replacing the small
centered timer with a responsive full-width layout. Keep colons centered vertically beside the digits per the follow-up request.
Council review considers four
equal unit columns versus stacked tiles, preserving narrow desktop-rail fit,
readable large day counts, reduced motion, and stable hydration. Implementation
and focused browser/visual evidence follow this documentation update.

Implemented: four equal full-width columns, card-relative digit sizing, centered
colons per the final user preference, and no filling-up suffix. Council reviewers
agreed on equal columns; the user chose to retain separators. Formatting, lint,
typecheck, fresh production build and 30 focused cases passed in all five browser
projects, covering 360/431/454/768/1440px, 99/100/1000-day values, hydration errors
and the started state. The 431px visual render was inspected; all three colon
centers matched their digit-row centers. Wi-Fi preview returned HTTP 200. The
earlier full 305-case gate remains separate evidence; it was not repeated for
this narrow timer refinement. Physical-phone re-review remains pending.

### PR04 registration card hierarchy — 2026-10-07

Phone feedback requests the sticky register bar only after the primary overview
registration card has passed out of view, retaining closing-CTA/footer suppression.
Reconcile the availability line with the centered timer and full-width button.
Both council reviewers recommend centered availability above the action and a
complete-card boundary for the sticky bar. Implemented with a stable card marker,
missing/hidden-target guard, upward-scroll reversal, main resize observation, and
closing-CTA/footer suppression. Formatting, lint, typecheck, fresh production
build and 35 focused checks passed across all five browser projects. The 431px
render was visually inspected with the sticky bar hidden; Wi-Fi returned HTTP 200. Physical-phone re-review remains pending.

### PR04 capacity-bar refinement — 2026-10-07

Use the requested thin burgundy occupancy bar above registration, with seats-left
text and an emphasized remaining number. The fill represents taken seats from the
same demo catalogue snapshot, not a live booking feed. Full/unknown states retain
plain status messaging. Tighten spacing and payment wording; focused validation
passed: formatting/lint/typecheck, fresh production build, and 35 focused cases
in all five browser projects. Tests verify the 29/40 taken-seat semantics and
72.5% fill alongside sticky-card boundaries. The 431px render was inspected and
the refreshed Wi-Fi preview returned HTTP 200. Physical-phone re-review remains
pending.

Capacity-bar visual trial: center matching taken/remaining text and inset the
bar by 1.25rem at each end, preserving the solid action button. User-approved
on 2026-10-07. Formatting/lint, fresh build/typecheck, and 14 Chromium/WebKit
mobile checks passed. The 431px render was inspected and Wi-Fi returned HTTP 200.
Physical-phone review remains pending.

Final capacity presentation (2026-10-07): remove the trial occupancy bar; show
centered “11 seats left” with the remaining number emphasized and a smaller gap
above registration. Full/unknown status handling is preserved.

### PR04 shared availability typography — 2026-10-07

Centralize concise “N seats left” wording (singular for one) and number emphasis
across workshop cards, calendar previews, hero, registration card, sticky bar,
closing CTA and confirmation. Preserve readable contrast on dark surfaces and
explicit unavailable-state labels. Shared rendering lives in `src/app/_components/workshop-availability-text.tsx`;
policy wording remains in `src/lib/workshop-availability.ts`. Formatting, lint,
typecheck, fresh build and 46 focused desktop/mobile WebKit cases passed. Sticky,
card and calendar concise labels were checked in the running preview; 431px
sticky typography was visually inspected. Wi-Fi returned HTTP 200. Native-phone
re-review and hosted checks remain open.

### PR04 final publication gate — 2026-10-07

The final `npm run quality:ci` passed formatting, lint/CSS, typecheck, eight
harness tests, production build, nine OG checks, and 355 cases across all five
browser projects: 335 browser journeys and 20 policy/server-markup fixtures.
An initial run had two exact-zero scroll assertions fail at two compositor
pixels; the interruption assertions now allow the helper's two-pixel tolerance.
Ten repeated affected Chromium checks and the fresh full gate passed.

Three compact 431px Chromium screenshots cover the final registration card,
sticky registration and inline filter controls in `docs/reviews/pr04/`.
Native-device, hosted and new-PR CI acceptance remain separate open boundaries.

### Home heading follow-up — 2026-10-07

Phone-to-tablet review found Corporate and testimonial headings compressed into
narrow desktop side rails. Place both introductions above their cards at full
section width; match programme heading sizing to “Join Our Workshops” and limit
the testimonial heading to a readable two-line measure where space permits.

### PR04 quality audit and cleanup plan — 2026-10-07

Follow-up source/browser audit found unassociated Corporate field labels and
rapid duplicate Continue activations skipping a Corporate step. The same
navigation pattern exists in Workshop registration and requires focused coverage.
These findings supersede the earlier no-actionable-regressions claim for current
acceptance; previous passing gates remain historical evidence.

[Quality fixes and cleanup plan](development/pr04-quality-cleanup-plan.md)
defines small corrective work in PR #4 and the dependent `PR04-CLEANUP` structural
package, complete affected-file inventory, shared conventions and acceptance gates.
Status: local implementation and integrated handoff validation completed; commit/push through existing PR #4 authorized.

PR04-CLEANUP implementation, 2026-10-07: shared accessible fields, serialized step
navigation, route-local form/date/review sections, shared overflow measurement and
presentation/landing extraction are implemented. Source-size checks are configurable
and part of the edit gate; no size overrides remain. See the linked cleanup plan
for retained/deferred inventory and validation evidence. Native/hosted/remote-CI
acceptance and cleanup publication remain separate from local checks.

PR04-CLEANUP final local evidence: full `quality:ci` passed 365 Playwright cases,
19 tooling/lifecycle checks, source-size enforcement, formatting/lint/CSS/types,
production build and nine OG checks. Four actual-page phone/tablet captures were
visually inspected. The linked plan records corrected audit findings, retained
boundaries and counts. Local preview restored; no cleanup commit/push/PR performed.

PR04-CLEANUP delivery steering, 2026-10-07: user authorized commit/push on the
existing PR branch. The previously proposed separate cleanup PR is superseded by
atomic commits on `fix/public-form-layouts` / PR #4. Local validation evidence
above applies; post-publication remote CI and hosted proof remain separate.

### PR04 remote CI scroll assertion follow-up — 2026-10-07

GitHub run `37642829255` tested cleanup revision `8265452`: formatting,
source-size, lint/CSS, types, tooling, build and OG checks passed; 364 browser
cases passed and the desktop Chromium touch interruption case failed twice.
Linux native cancellation retained 7–19 pixels, exceeding the test's two-pixel
assumption. The regression now observes the anchor helper's options-object
scroll commands after interruption, exercises its full correction deadline,
and confirms the inquiry section remains outside the viewport. GSAP numeric
position restoration is excluded. Application behavior is unchanged.

Focused validation: all 40 anchor-navigation cases passed (two repetitions
across five browser projects); formatting, lint and types passed. A fresh full
remote gate remains pending after publication of this test correction.

### PR04 browser-suite maintenance — 2026-10-07

Approved follow-up: reduce repeated viewport/engine matrices and assertions tied
to visual nits. Preserve all-engine core journeys, meaningful overflow/resize
coverage and full PR quality validation. Layout matrices use Chromium and mobile
WebKit; pure policy/server-markup fixtures run once. Use user-visible navigation
outcomes rather than spying on internal scroll commands. Validation: full `quality:ci` passed formatting, source-size, lint/CSS, types,
19 tooling/lifecycle checks, production build, nine OG checks and 176 Playwright
cases (172 browser journeys and four policy/markup cases). Browser execution
took 4.5 minutes locally. The prior suite had 365 cases; the revised suite removes
189 repetitions/visual cases (52%) and 134 net test-source lines. Core journeys
remain in all five projects; layout cases run in two and policy cases in one.
GitHub run `37645634176` passed for the preceding scroll-test fix `3f48b65`;
remote CI for this suite revision remains separate pending publication.

### PR04 desktop screenshot evidence — 2026-10-09

Added three visually inspected 1440px Chromium captures in `docs/reviews/pr04/`:
registration card/countdown, sticky registration after the primary card passes,
and workshop filters. At desktop width all filters fit and chevrons are absent.
Captures use the local production preview, reduced motion and the demo clock
set to 7 October 2026. These supplement the existing 431px PR screenshots; no
application code changed. Native-device and hosted evidence remain separate.
