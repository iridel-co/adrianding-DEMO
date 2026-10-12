# Corporate inquiry implementation history

Archived from the pre-cleanup source header. This is historical rationale, not current behavior or acceptance evidence.

```text
/**
 * Corporate training inquiry — multi-step, progressive disclosure. Frontend
 * only: nothing is sent anywhere; submitting routes to
 * `/corporate-training/inquiry-received`.
 *
 * Step 3 (programme / headcount / date / venue) is the client's own ask — a
 * name and a free-text message was not enough to quote against, so those four
 * are now captured explicitly.
 *
 * Prefill (2026-09-19): the corporate carousel's Inquire button hands off a
 * programme two ways — a `?program=<key>` URL (read on mount, deep-link /
 * reload safe) and a `PROGRAM_INQUIRE_EVENT` window event (re-applies a
 * programme even if the URL didn't change, e.g. a second click after the
 * visitor picked something else by hand). Also new: an optional
 * "Also interested in" group of selectable tiles (real checkboxes, visually
 * hidden, inside a fieldset — changed from plain checkboxes 2026-09-24), so
 * one inquiry can cover more than one programme.
 *
 * Programme list (2026-09-24): reads `CORPORATE_PROGRAMMES` — Adrian's six
 * real programmes plus four demo-only placeholders — so the corporate page's
 * select and tiles show all ten. The landing page still reads the real six
 * only.
 *
 * Deep-link landing (2026-09-24): a cold load of
 * `/corporate-training?program=<key>#inquiry` prefills correctly above but
 * used to strand the visitor at scrollY ~100-650 instead of at this section
 * (4000+px down). The browser's *native* fragment jump fires immediately on
 * load — well before webfonts swap, the Programs carousel's images decode,
 * and hydration settle — and nothing re-corrects it afterward, so it lands
 * against a page that is still shifting under it. Fixed by landing ourselves,
 * once, after the same settle signals `ScrollRefresh` uses (fonts ready +
 * window load), via the existing `smoothScrollToElement` helper — and only if
 * the visitor hasn't already started scrolling by hand.
 */
```
