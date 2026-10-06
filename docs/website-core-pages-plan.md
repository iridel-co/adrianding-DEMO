# Website Design and Core Pages Delivery Plan

This is the shared checklist for completing the Website Design and Core Pages
milestone across reviewable PRs. Start with the portable quality harness and
repository documentation cleanup. Finish with the user's design and nitpick pass.

Created: 2026-10-02. Planning baseline: `main` at `f1408f4`.
PR01 and PR02 are merged. The local Firefox launch blocker was resolved with a
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
- [x] Exclude new Gallery features; check incidental shared-component regressions.
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
165 browser cases across all five Chromium/Firefox/WebKit projects. Merge status: not merged.

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
PR: pending. Evidence: pending. Merge status: not started.

- [ ] Audit and correct the listing's filters/calendar and workshop detail layouts.
- [ ] Cover no registrations yet (all seats available), partially filled, last seat,
      fully booked (zero seats), closed/past, and unknown/unavailable capacity.
      Also cover an empty catalogue, no filter matches, and a month without events;
      distinguish these from loading and fetch failure once an API is connected.
- [ ] Use consistent availability in cards, calendar, hero, overview, closing CTA,
      sticky bar, and direct registration entry. Fully booked must not open normal
      registration; past/closed must not advertise remaining seats. Keep useful
      workshop details and an accessible state message visible.
- [ ] Resolve the current zero-seat mismatch: closing CTA says Fully booked but
      still opens registration. Recheck confirmation/payment capacity messaging.
      Do not invent waitlist behaviour before the receiving-project contract agrees it.
- [ ] Test transitions from available to full, full to reopened, and availability
      changing during a form: preserve entered fields, explain rejection, and do
      not show a successful booking when the receiving service rejects capacity.
      Server enforcement and seat-holding transitions remain backend-owned.
- [ ] Check registration dialogs, form validation, sticky CTAs, and confirmation
      layout; group commits by interaction and preserve demo behavior.
- [ ] Acceptance: keyboard/touch journeys and representative open/past workshop
      states work at the agreed widths; sticky controls do not obscure content.

## PR05 Corporate page responsiveness (included in PR04)

Delivery: PR04 branch/title; keep these tasks as a separate commit group.
Dependencies: PR03 shared layout changes. Owner: scoped corporate-page implementer.
PR: pending. Evidence: pending. Merge status: not started.

- [ ] Audit and correct programme carousel, inquiry form, and confirmation layouts.
- [ ] Preserve programme prefill, multi-select behavior, and validation; separate
      carousel and form corrections into commits where independently reviewable.
- [ ] Acceptance: long content, touch/keyboard controls, invalid form states, and
      confirmation fallbacks remain usable without clipping or overflow.

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
