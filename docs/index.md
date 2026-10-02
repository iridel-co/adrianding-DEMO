# Documentation index

Start with the [repository overview](../README.md) for current demo behavior and setup.

- [Website Design and Core Pages delivery plan](website-core-pages-plan.md): current milestone scope, package dependencies, acceptance, and evidence.
- [Product requirements](product/PRD.md): scope, copy, frontend behavior, and Phase 2 handoff context.
- [Phase 2 functional specification](product/FSD.md): draft backend flows and [open decisions](product/FSD.md#112-open-decisions); implementation remains with Phase 2 owners.
- [Client meeting record](meetings/MEETING-NOTES.md): dated decisions and requests, preserved as history with a current-status pointer.
- [Historical feedback passes](feedback-passes/index.md): earlier plans and test evidence, not current execution instructions.
- [Quality workflow](development/quality.md): prerequisites, stage coverage, and known gaps.
- [Asset source guidance](../assets-src/README.md): originals and derivative handling, kept beside those assets.

## Path migration and unavailable references

PR01 moves root `PRD.md` and `FSD.md` to `docs/product/`, and root
`MEETING-NOTES.md` to `docs/meetings/`. Historical records retain their original
paths and commands; use this mapping when reading them.

Earlier feedback records and source comments reference `CLAUDE.md`, `tasks/RULES.md`,
`tasks/rules/`, `tasks/lessons.md`, and `og-mockups/` scratch files. These are absent
from this checkout. Their provenance is preserved, but their contents and historical
rendering claims cannot be verified from this repository. External source PDFs and
the supplied SOW are likewise not repository files.

The absent `DESIGN_SYSTEM.md`, `docs/ui-kit.md`, and `docs/image-handling.md` pointers
in source comments now point to the existing README overview sections. Those sections
describe the current repository; they do not replace unavailable detailed guidance.

As of 2026-10-02, the 93 artwork paths in `src/lib/companies.ts` and eight portrait
paths in `src/lib/testimonials.ts` all resolve under `public/`. This verifies reference
integrity only. Identity, approved replacements, visual quality, client approval,
and photo consent remain open in the delivery plan and functional specification.
