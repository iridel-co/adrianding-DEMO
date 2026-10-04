# Website Design and Core Pages Delivery Plan

This is the shared checklist for completing the Website Design and Core Pages
milestone across reviewable PRs. Start with the portable quality harness and
repository documentation cleanup. Finish with the user's design and nitpick pass.

Created: 2026-10-02. Planning baseline: `main` at `f1408f4`.
PR01 is merged. PR02's expanded verification is blocked on local Firefox launch.
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

Each package has its own branch and Conventional Commit PR title. Atomic commits
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
PR: [#2](https://github.com/iridel-co/adrianding-DEMO/pull/2), opened for review;
rebased onto integrated `origin/main` at `5c86906`, target `main`.
Evidence: original 22-test Chromium handoff passed locally on 2026-10-04,
Node 25.7.0; expanded Chromium/WebKit selection passed 52 tests. Firefox launch
is blocked on Windows; full handoff is not passing. Merge status: not merged.

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
uncommitted. PR03 is the next package after PR02 acceptance.

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
PR: pending. Evidence: pending. Merge status: not started.

- [ ] Reproduce current defects before editing, including the previously reported
      hero wordmark issue at widths of 402px and below.
- [ ] Correct shared navigation/layout, then Home and About wrapping, spacing,
      imagery, and CTA visibility using existing `src/app/_components` patterns.
- [ ] Separate shared fixes and page corrections into coherent commits; split the
      PR if both groups become substantial.
- [ ] Acceptance: no unintended horizontal overflow or clipped actions; mobile menu,
      focus handling, touch interactions, and reduced motion remain usable.

## PR04 Workshop responsiveness

Branch: `fix/workshop-responsiveness`
PR title: `fix: workshop responsiveness`
Dependencies: PR03 shared layout changes. Owner: scoped workshop implementer.
PR: pending. Evidence: pending. Merge status: not started.

- [ ] Audit and correct the listing's filters/calendar and workshop detail layouts.
- [ ] Check registration dialogs, form validation, sticky CTAs, and confirmation
      layout; group commits by interaction and preserve demo behavior.
- [ ] Acceptance: keyboard/touch journeys and representative open/past workshop
      states work at the agreed widths; sticky controls do not obscure content.

## PR05 Corporate page responsiveness

Branch: `fix/corporate-page-responsiveness`
PR title: `fix: corporate page responsiveness`
Dependencies: PR03 shared layout changes. Owner: scoped corporate-page implementer.
PR: pending. Evidence: pending. Merge status: not started.

- [ ] Audit and correct programme carousel, inquiry form, and confirmation layouts.
- [ ] Preserve programme prefill, multi-select behavior, and validation; separate
      carousel and form corrections into commits where independently reviewable.
- [ ] Acceptance: long content, touch/keyboard controls, invalid form states, and
      confirmation fallbacks remain usable without clipping or overflow.

## PR06 Marquee accessibility

Branch: `fix/marquee-accessibility`
PR title: `fix: marquee accessibility`
Dependencies: PR02 and any shared UI changes touching these components.
Owner: main executor for testimonial/company shared components.
PR: pending. Evidence: pending. Merge status: not started.

- [ ] Remove hidden duplicate testimonial cards from keyboard navigation.
- [ ] Provide persistent, accessible pause/resume controls for moving testimonials
      and company content, preserving reduced-motion and touch behavior.
- [ ] Keep clone-focus correction and motion-control behavior identifiable in commits.
- [ ] Acceptance: focus cannot enter hidden duplicates; controls expose their names
      and state; user-requested pause is not undone by hover/focus transitions.

## PR07 Company logo presentation

Branch: `fix/company-logo-presentation`
PR title: `fix: company logo presentation`
Dependencies: team-approved logo mapping/files and relevant shared UI fixes.
Owner: scoped asset implementer; shared component edits coordinated centrally.
PR: pending. Evidence: pending. Merge status: not started.

- [ ] Audit existing artwork against the supplied mapping; replace only identified
      files and normalize presentation where necessary.
- [ ] Keep asset replacement and component sizing changes separately reviewable.
- [ ] Acceptance: correct identity, aspect ratio, legibility, contrast, and working
      references across relevant backgrounds and mobile/desktop consumers.

## PR08 Testimonial portraits

Branch: `fix/testimonial-portraits`
PR title: `fix: testimonial portraits`
Dependencies: client-approved portraits/consent and relevant shared UI fixes.
Owner: scoped asset implementer; shared component edits coordinated centrally.
PR: pending. Evidence: pending. Merge status: not started.

- [ ] Map approved portraits to the eight testimonials and apply consistent crops
      and appropriate image descriptions; preserve testimonial wording.
- [ ] Preserve existing assets until approved replacements are available.
- [ ] Acceptance: verify identity/approval, reference integrity, image sizing, and
      mobile/desktop crops; existing files alone do not prove approval.

## PR09 Frontend integration contracts

Branch: `docs/frontend-integration-contracts`
PR title: `docs: frontend integration contracts`
Dependencies: PR01 document organization; counterpart input for agreed contracts.
Owner: main executor coordinates frontend and receiving-project boundaries.
PR: pending. Evidence: pending. Merge status: not started.

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

## PR10 Demo submission boundaries

Branch: `refactor/demo-submission-boundaries`
PR title: `refactor: demo submission boundaries`
Dependencies: PR02, PR09's necessary data decisions, and relevant form layout work.
Owner: main executor owns shared types/adapters; forms follow settled interfaces.
PR: pending. Evidence: pending. Merge status: not started.

- [ ] Separate complete validated form payloads from confirmation-display data.
- [ ] Isolate small demo-local submission boundaries and validate stored confirmation
      data at runtime, with explicit submitting/result/error states.
- [ ] Preserve demo behavior without network writes or claims that real leads exist.
- [ ] Add focused behavior tests for invalid payloads, failures, and fallback states.
- [ ] Split workshop/corporate migration into separate branches and PRs if the diff
      grows; shared contracts must land first. Record any split here.
- [ ] Introduce CMS/content adapters only where an agreed boundary justifies them.
- [ ] Acceptance: both form journeys still work; confirmation data is not reused as
      an incomplete API payload; real integrations remain with their owning projects.

## PR11 Public page loading optional

Branch: `perf/public-page-loading`
PR title: `perf: public page loading`
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
