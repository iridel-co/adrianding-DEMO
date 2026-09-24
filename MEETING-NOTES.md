# Client meeting — open items

> For the session with Adrian on **Saturday 2026-09-20**. Everything here is a
> decision or an asset the demo needs from him; nothing on this list is blocked
> on us. Ordered by what costs the most if it stays unanswered.

---

## 1. Pricing — currently invented

Every course page now shows a price, because a page an ad points at cannot say
"price on inquiry" and still convert. The figures are **ours, not his**:

| Course                           | Shown     | Basis                                                |
| -------------------------------- | --------- | ---------------------------------------------------- |
| Exceptional Salesmanship         | ₱6,500\*  | one day, venue + manual + certificate + plated lunch |
| Exceptional Leadership           | ₱6,500\*  | same                                                 |
| Train the Trainers Certification | ₱18,500\* | three days, includes certification                   |
| The four representative courses  | ₱6,500\*  | placeholders on placeholder courses                  |

The trailing `*` is the page's own "indicative" marker. **Ask for his real
numbers.** If he wants early-bird or group pricing, that is a structure change,
not a number change — flag it now rather than after the ads run.

## 2. Fonts — two of the three are unlicensed

The installed `The Seasons` and `Abramo` files are web-download copies, fine for
a demo and **not fine once this is live on his domain**. `Red Hat Display` is
open-source (SIL OFL) and needs no action.

Two paths:

- **License them.** One-off desktop + web licences from the foundries. This is
  the recommendation — the whole visual argument against his competitors is that
  his site looks more expensive than theirs, and the display face is most of it.
- **Substitute, at zero cost.** Free faces that hold the same editorial feel:
  - _The Seasons_ → **Prata** (closest), else **Bodoni Moda** or **Playfair Display**
  - _Abramo_ → **Italiana** (serif accent) / **Parisienne** (script accent)

Either way the decision has to be his, because it is his legal exposure.

## 3. Copy he should read back

- **"equip further top producers"** in the Exceptional Salesmanship intro is his
  own wording, kept verbatim rather than quietly rewritten. It reads like a typo.
  Ask whether he meant "equip top producers further" or something else.
- **Train the Trainers title** is shortened to _Train the Trainers Certification
  Program_ so it fits a card; his full _…for Exceptional Presentations_ is kept
  in the course summary. Confirm he is happy with that.
- Each course page opens on a **problem line** ("You know your subject cold…").
  Those are written by us, not him. They are the first thing cold ad traffic
  reads, so they matter more than anything else on the page — get his sign-off.
- The **headline figures** (20+ years, 20,000+ trained, Top 500 companies) come
  from the PRD, not from a verified source. Confirm before any of it goes live.

## 4. Assets still outstanding

- **47 of 91 company logos have no artwork** and render as name chips. Kept
  deliberately, so the gaps are visible and he can see exactly what is missing.
  Priority is the categories where _every_ logo is missing: Finance, Real Estate,
  Hotels, Food & Retail, SMEs.
- **Accreditation marks** — Genos and the Peak Potentials trainer cert are a badge
  graphic and a certificate scan, and silhouette as white blobs. CPD is patchy.
  These appear on three pages and carry real credibility weight. Proceed only if
  the engagement continues — noted as a paid follow-on, not a blocker now.
- **Primer / teaser videos** are placeholder slots on every course page and both
  confirmation pages. His competitors who convert best (Burchard, Ryan Leak) are
  video-first. If he has _any_ event footage, one 45–90s cut would do more for
  "create a buzz" than anything else on this list. Worth asking directly.
- **Gallery** is deferred to a later phase at his request. The page is already
  built and stays live in the demo; no further work.

## 5. Decisions we need from him in the room

1. **Which "know more about Coach Adrian" treatment.** Three are built and
   switchable live from the bar at the top of every course and corporate page:
   - _Inline only_ — the button alone, inside the section that tells his story.
   - _Slide-in card_ — **our recommendation.** Quiet maroon card, bottom-left,
     desktop only, dismissible.
   - _Pop-up_ — his literal request. Show him this one on a phone: it lands on
     top of the Register bar, which is the only always-reachable CTA on mobile.
     That is the argument, and it makes itself.
2. **Ad → course page flow.** Confirm each ad points at its own course URL, not
   the homepage. Every course page now has its own social preview card, so
   forwarded links no longer all look identical.
3. **Corporate off-ramp placement.** "Train your team" now sits on each course
   page _after_ the register CTA. Deliberate: above it, it would cannibalise the
   seat the ad paid for. Confirm he is happy with that order.

## 6. If he proceeds — what Phase 2 inherits

The per-course social preview cards are **generated from the course record**, not
drawn by hand: photo, title, date and venue come straight off the workshop data.
So once the catalogue is CMS-managed, publishing a workshop mints its own preview
card automatically — no design step, no upload, no stale image. Worth saying out
loud in the meeting, because it is a concrete thing the CMS buys him rather than
an abstraction.

One editorial caveat to raise with him: the card crops the course photo
full-bleed, so a shot that looks fine as a small card on the list page can put a
third-party banner into his ad preview (the current salesmanship photo does
exactly that). Whoever publishes a course should see the generated card before it
goes out.

Full handoff notes for the build team — format constraints, the Next 15 `params`
trap, regenerate-on-republish, and why the card must stay derived rather than
become an upload field — are in `PRD.md` under _Phase 2 handoff — the social
cards belong in the CMS_.

---

_Demo scaffolding to strip before handoff: the variant switcher at the top of the
course and corporate pages, and the "fill sample data" button on both forms._

Sept 19 Meeting Notes:

- workshops needs to be more explicit in the curriculum that oyu offer. possibly we could have filters or tags or badges to what it targets. Programs We Run.
- INLINE WINS
- marine corp, 2go, opascor
- every inquiry filled should notify email and pop as new in CRM
- how low can we go for a PARTNERSHIP
