/**
 * Public workshop catalogue — powers the workshops list, each workshop detail
 * page (with its countdown + registration form), and the landing-page preview.
 *
 * In the real build this is CMS-managed.
 *
 * The first three entries (salesmanship, leadership, train-the-trainers) carry
 * the client's own course material, supplied 2026-09-17, and head the array so
 * they head the list page. Everything after them is representative copy written
 * for the demo — TODO: replace or drop before handoff.
 *
 * TODO: every price is an arbitrary demo figure (₱6,500 for a one-day course,
 * ₱18,500 for the three-day certification) pending the client's real numbers.
 * The trailing asterisk is the page's own "indicative" marker.
 *
 * Each workshop carries 1–3 `tags` from `WORKSHOP_TAGS` (added 2026-09-19 — the
 * client wanted it obvious at a glance which area a course serves).
 */

/**
 * Fixed taxonomy for "which area does this workshop serve". Order here is the
 * display order everywhere (card pills, filter chips). In the real build this is
 * a CMS taxonomy field, not free text — see README "Backend / CRM / CMS".
 */
export const WORKSHOP_TAGS = [
  "Leadership",
  "Sales",
  "Communication",
  "Coaching",
  "Customer Experience",
  "Culture",
  "Train-the-Trainer",
] as const
export type WorkshopTag = (typeof WORKSHOP_TAGS)[number]

export type Workshop = {
  slug: string
  title: string
  /** 1–3 tags from WORKSHOP_TAGS, most relevant first. Shown as pills on every
   *  card and on the detail hero; drives the /workshops filter. */
  tags: WorkshopTag[]
  /** ISO 8601 with PH offset. */
  start: string
  /** Human-readable schedule line. */
  schedule: string
  venue: string
  city: string
  /** Display price — placeholder until the client confirms. */
  price: string
  /** Card fill — path under `public/images/`. */
  image: string
  status: "open" | "past" | "closed"
  /** One-line hook for cards. */
  summary: string
  /** Longer intro paragraph for the detail page. */
  intro: string
  audience: string
  format: string
  curriculum: string[]
  inclusions: string[]
  /**
   * The problem this workshop solves, in the visitor's words — the first line on
   * the detail page, above the title. Ad traffic lands here cold and needs to
   * recognise itself before it reads a course name.
   * TODO: client sign-off — representative framing, not his wording.
   */
  problem: string
  /** "You leave able to…" — 3-4 concrete results, shown as the trust block. */
  outcomes: string[]
  /** What to bring / how the day runs — shown on the confirmation page. */
  whatToExpect: string[]
  /** One line under the primer video player, per course. */
  primerBlurb: string
  seatsTotal: number | null
  /** Drives the scarcity pill. TODO: CMS-managed in the real build. */
  seatsLeft: number | null
}

export const WORKSHOPS: Workshop[] = [
  {
    // Content below is the client's own course material (supplied 2026-09-17),
    // lightly formatted for the page — not representative copy. `problem`,
    // `outcomes` and `whatToExpect` are still derived from it rather than
    // written by him; TODO: client sign-off on those three.
    slug: "exceptional-salesmanship",
    title: "Exceptional Salesmanship",
    // TODO: client sign-off on tags
    tags: ["Sales", "Customer Experience"],
    start: "2026-10-09T09:00:00+08:00",
    schedule: "Friday, October 9, 2026 · 9:00 AM – 5:00 PM",
    venue: "SEDA Ayala Center Cebu, E-bloc",
    city: "Cebu City",
    price: "₱6,500*",
    image: "/images/gallery/primaryhomes/photo-3.jpg",
    status: "open",
    summary:
      "A one-day masterclass on attracting high-value clients, improving conversions and growing revenue — without pressure tactics.",
    intro:
      "An intensive, one-day masterclass designed to equip further top producers to become the preferred partner. Participants will acquire the disciplines and competencies to attract high-value clients, improve conversions, increase lifetime retention and grow revenue.",
    audience:
      "Designed for sales professionals in insurance, real estate, medical, retail and the service industry.",
    format:
      "High-energy, minimal lecture, driven by peer-to-peer case studies and practical frameworks — the A–Z guide on the mechanics of consultative selling.",
    curriculum: [
      "Elite mindset & daily disciplines — time boxing, pipeline building, handling rejection, and the habits of the top 5%",
      "Attraction mechanisms & client-centric positioning — how to prospect and magnetically bring prospects to your doorstep",
      "Personal branding, social media optimisation, funnelling and nurturing strategies",
      "Consultative selling mastery — a systematic flow from pain points to solutions, rebutting objections and closing",
      "Compelling persuasion skills",
      "Excellent customer service standards",
    ],
    inclusions: [
      "Personalised kit: training manual + signature certificate of completion",
      "AM/PM snacks plus plated lunch",
      "30-day post-training mechanism",
      "Frameworks",
      "Online reunion and check-in after 30 days with the batch",
    ],
    problem:
      "You are doing the calls, the follow-ups and the presentations — and still losing deals you should have won.",
    outcomes: [
      "Attract high-value clients instead of chasing every lead",
      "Run a consultative flow from pain point to close, not a pitch",
      "Rebut objections without discounting your way to the sale",
      "Hold clients longer through service standards, not follow-up spam",
    ],
    whatToExpect: [
      "Registration opens 8:30 AM — come early, seating is first come",
      "Bring one live deal you are stuck on; you will rebuild it during the day",
      "Business casual. Bring a notebook — the manual is yours to keep",
      "Peer-to-peer case studies and practical frameworks, minimal lecture",
      "An online reunion and check-in with the batch 30 days after",
    ],
    primerBlurb:
      "A short message from Coach Adrian on what to think about before the day starts.",
    seatsTotal: 40,
    seatsLeft: 11,
  },
  {
    // Client's own course material (supplied 2026-09-17). Same sign-off TODO as
    // the salesmanship entry above for problem / outcomes / whatToExpect.
    slug: "exceptional-leadership",
    title: "Exceptional Leadership",
    tags: ["Leadership", "Communication"],
    start: "2026-10-16T09:00:00+08:00",
    schedule: "Friday, October 16, 2026 · 9:00 AM – 5:00 PM",
    venue: "SEDA Ayala Center Cebu, E-bloc",
    city: "Cebu City",
    price: "₱6,500*",
    image: "/images/gallery/sunlife/photo-3.jpg",
    status: "open",
    summary:
      "A concise, intensive day for the modern leader — grow from within, then lead a team that performs without you in the room.",
    intro:
      "An intensive yet concise workshop for the modern leadership accelerator to grow from within and lead high-performing teams at work.",
    audience:
      "Designed for experienced professionals (35+) balancing operational demands with strategic oversight.",
    format:
      "High-energy, minimal lecture, driven by peer-to-peer case studies and practical frameworks — a clear blueprint for upgrading your leadership, plus networking with professionals.",
    curriculum: [
      "Building your trinity of assets in leadership: mindset, heart-set, skill-set",
      "Navigating the 4 phases in business today: tech + AI, scaling & expansion, sales & revenue generation, redundancy & culture revamp",
      "The right mentalities of leaders and how to apply them — from managing to elevating",
      "Building your 4Qs as a leader: EQ, SQ, AQ and FQ",
      "Understanding and driving people towards excellence",
      "Non-negotiable leadership skills: delegating, endorsing, follow-up and follow-through",
      "Team management, face-to-face or hybrid",
      "Constructive feedback, difficult conversations and resolving conflict",
      "Persuasive communication: pitches, trouble-shooting and reports",
      "Cross-functional buy-in, strategic thinking and critical problem-solving",
    ],
    inclusions: [
      "Personalised kit: training manual + signature certificate of completion",
      "AM/PM snacks plus plated lunch",
      "30-day post-training mechanism",
      "Frameworks",
      "Online reunion and check-in after 30 days with the batch",
    ],
    problem:
      "You were promoted for your own output, and nobody handed you the manual for getting it through other people.",
    outcomes: [
      "Move from managing tasks to elevating the people doing them",
      "Have the difficult conversation you have been putting off",
      "Delegate with follow-through instead of taking the work back",
      "Win cross-functional buy-in without borrowing authority",
    ],
    whatToExpect: [
      "Registration opens 8:30 AM — come early, seating is first come",
      "Bring one team situation you are currently stuck on",
      "Business casual. Bring a notebook — the manual is yours to keep",
      "Peer-to-peer case studies and practical frameworks, minimal lecture",
      "An online reunion and check-in with the batch 30 days after",
    ],
    primerBlurb:
      "Coach Adrian on the shift from managing tasks to leading people.",
    seatsTotal: 40,
    seatsLeft: 17,
  },
  {
    // Client's own course material (supplied 2026-09-17). The only three-day
    // programme in the catalogue, and the only one that certifies — which is
    // why it carries its own price band and a much smaller cohort (teach-back
    // rounds and 360 feedback do not scale past ~24 people).
    // TODO: client sign-off on `problem`, `title` (his full title is "…
    // Certification Program for Exceptional Presentations" — shortened here so
    // it fits a card, full phrasing kept in `summary`) and the price.
    slug: "train-the-trainers-certification",
    title: "Train the Trainers Certification Program",
    tags: ["Train-the-Trainer", "Communication"],
    start: "2026-11-11T09:00:00+08:00",
    schedule: "November 11–13, 2026 · 9:00 AM – 5:00 PM daily",
    venue: "SEDA Ayala Center Cebu, E-bloc",
    city: "Cebu City",
    price: "₱18,500*",
    image: "/images/gallery/exceptional-salesmanship-manila-2025/photo-4.jpg",
    status: "open",
    summary:
      "A three-day boot camp for exceptional presentations — design, deliver and certify as a high-impact trainer and facilitator.",
    intro:
      "An intensive 3-day boot camp equipping aspiring trainers and consultants to become high-impact presenters and facilitators through masterclass instruction in program design, stage presence and audience engagement. The program culminates in live presentations where participants deliver training modules and receive actionable feedback.",
    audience:
      "Aspiring trainers and consultants, and subject-matter experts stepping into facilitation.",
    format:
      "Three full days, in person. Masterclass instruction, live teach-back rounds, and 360-degree peer and master-trainer feedback against a standardised 20-point rubric.",
    curriculum: [
      "The identity shift: moving from subject-matter expert to transformational facilitator",
      "Overcoming presentation anxiety, adopting adult learning principles, and setting learning objectives",
      "Instructional design: structuring 1-day and multi-day workshops — logical program flows, theory vs. practice, and high-retention learning activities",
      "Content & slide design: visually appealing decks, workbooks, and gamification tactics that keep energy high",
      "Stagecraft & vocal mastery: commanding the room through body language, vocal pacing, theatrical anchor points, engagement tactics, relevant humour and open-loop storytelling",
      "Facilitation & crowd control: managing participants, facilitating productive group debates, and reading room dynamics in real time",
      "Post-training impact & rave reviews: evaluation forms (Kirkpatrick model), driving post-workshop implementation, and securing repeat corporate bookings",
      "Business & monetisation: packaging consulting offers, pricing training packages, proposal writing, and building a personal trainer brand",
      "Teach-back rounds: each participant delivers a 15-minute live module using real slides and activities",
      "Structured feedback & certification: 360-degree peer and master-trainer feedback on a 20-point rubric (content, delivery, engagement, impact)",
    ],
    inclusions: [
      "Personalised kit and training manual",
      "AM/PM snacks plus plated lunch for 3 days",
      "Maximum Impact Certification as “Competent Trainer”",
    ],
    problem:
      "You know your subject cold. Holding a room with it for a full day is a different skill, and nobody ever taught you that one.",
    outcomes: [
      "Leave with a fully developed signature training outline",
      "Take home personal delivery video recordings from Day 3",
      "Read your own facilitator assessment scorecard against a 20-point rubric",
      "Walk out with a complete training template for your chosen topic",
    ],
    whatToExpect: [
      "Three consecutive days — registration opens 8:30 AM on Day 1",
      "Bring a topic you want to build a training programme around",
      "Day 3 is live teach-backs: you present a 15-minute module to the group",
      "You will be recorded on Day 3 and keep the footage",
      "Certification is assessed, not automatic — the 20-point rubric is shared on Day 1",
    ],
    primerBlurb:
      "Coach Adrian on the jump from knowing your subject to holding a room with it.",
    seatsTotal: 24,
    seatsLeft: 16,
  },
  // TODO: placeholder open workshops — added to preview a fuller catalogue.
  // Replace with the client's real upcoming dates.
  {
    slug: "presenting-with-impact",
    title: "Presenting with Impact",
    tags: ["Communication"],
    start: "2026-10-23T09:00:00+08:00",
    schedule: "Friday, October 23, 2026 · 9:00 AM – 5:00 PM",
    venue: "SEDA Ayala Center Cebu, E-bloc",
    city: "Cebu City",
    price: "₱6,500*",
    image: "/images/gallery/axa/photo-3.jpg",
    status: "open",
    summary:
      "Command a room, build a talk that lands, and handle questions without losing the thread — a full day of stagecraft for anyone who presents to clients, boards or their own team.",
    intro:
      "A great idea badly presented loses to a weak idea presented well. This workshop rebuilds how you plan, open, structure and deliver a talk so the audience leaves persuaded and clear on what happens next.",
    audience:
      "Managers, business developers, technical leads and founders who pitch, brief or update an audience as part of the job.",
    format:
      "One full day, in person. Live delivery drills, on-camera feedback, and a rebuilt version of a talk you bring with you.",
    curriculum: [
      "The one-sentence point every talk needs",
      "Structuring for attention, not for completeness",
      "Openings that earn the next five minutes",
      "Slides that support you instead of replacing you",
      "Voice, pace and stillness under pressure",
      "Fielding hard questions and hostile rooms",
      "Closing on a clear call to action",
    ],
    inclusions: [
      "Printed training manual",
      "Certificate of completion",
      "AM & PM snacks plus lunch",
      "30-day post-training application mechanism",
      "Online reunion session with the cohort",
    ],
    problem:
      "You know your material cold — and still watch the room drift the moment you start talking.",
    outcomes: [
      "Build a talk around one point the audience can repeat",
      "Open in a way that earns the next five minutes",
      "Hold your pace and stillness when the pressure lands",
      "Handle a hostile question without losing the thread",
    ],
    whatToExpect: [
      "Registration opens 8:30 AM — come early, seating is first come",
      "Bring a real talk or pitch you have to give soon; you will rebuild it",
      "You will be recorded on camera for feedback — footage is yours only",
      "Business casual. Bring a notebook — the manual is yours to keep",
      "You leave with a rebuilt, delivered version of your own talk",
    ],
    primerBlurb:
      "A short primer on the one-sentence point every talk needs — watch before you draft anything.",
    seatsTotal: 30,
    seatsLeft: 22,
  },
  {
    slug: "negotiation-essentials",
    title: "Negotiation Essentials",
    tags: ["Sales", "Communication"],
    start: "2026-11-06T09:00:00+08:00",
    schedule: "Friday, November 6, 2026 · 9:00 AM – 5:00 PM",
    venue: "SEDA Ayala Center Cebu, E-bloc",
    city: "Cebu City",
    price: "₱6,500*",
    image: "/images/gallery/dueksaminc/photo-3.jpg",
    status: "open",
    summary:
      "Prepare, open and close a negotiation so both sides leave able to say yes — a practical day on leverage, trade-offs and holding your number without burning the relationship.",
    intro:
      "Most people negotiate on instinct and give away margin they never needed to. This workshop gives you a repeatable process: know your walk-away, map the other side's interests, and trade concessions on purpose.",
    audience:
      "Sales, procurement, account management and business owners who close deals, renew contracts or manage suppliers.",
    format:
      "One full day, in person. Paired and group negotiation simulations with debriefs after every round.",
    curriculum: [
      "Preparation: interests, options and your walk-away",
      "Anchoring and the first offer",
      "Trading concessions instead of conceding",
      "Handling pressure, deadlines and silence",
      "Multi-party and internal negotiations",
      "Locking the agreement so it sticks",
    ],
    inclusions: [
      "Printed training manual",
      "Certificate of completion",
      "AM & PM snacks plus lunch",
      "30-day post-training application mechanism",
      "Online reunion session with the cohort",
    ],
    problem:
      "You close the deal, then look at the margin you gave away and cannot explain why you gave it.",
    outcomes: [
      "Walk in knowing your number and your walk-away",
      "Trade concessions on purpose instead of conceding under pressure",
      "Read what the other side actually needs, not what they asked for",
      "Close an agreement that still holds three months later",
    ],
    whatToExpect: [
      "Registration opens 8:30 AM — come early, seating is first come",
      "Bring a negotiation you are heading into; you will prepare it live",
      "Business casual. Bring a notebook — the manual is yours to keep",
      "Simulations run all afternoon, with a debrief after every round",
      "You leave with a reusable preparation sheet",
    ],
    primerBlurb:
      "Coach Adrian on why preparation, not personality, decides most negotiations.",
    seatsTotal: 30,
    seatsLeft: 24,
  },
  {
    slug: "coaching-for-managers",
    title: "Coaching for Managers",
    tags: ["Coaching", "Leadership"],
    start: "2026-11-20T09:00:00+08:00",
    schedule: "Friday, November 20, 2026 · 9:00 AM – 5:00 PM",
    venue: "SEDA Ayala Center Cebu, E-bloc",
    city: "Cebu City",
    price: "₱6,500*",
    image: "/images/gallery/evercare/photo-3.jpg",
    status: "open",
    summary:
      "Trade rescuing your team for developing it — a full day on the questions, feedback and follow-through that turn everyday conversations into growth.",
    intro:
      "When a manager solves every problem, the team stops growing and the manager stays buried. This workshop teaches a simple coaching habit you can use in a hallway conversation, a one-on-one or a performance review.",
    audience:
      "Team leads, supervisors and managers responsible for the performance and development of others.",
    format:
      "One full day, in person. Live coaching demonstrations, triad practice, and a plan for your next five one-on-ones.",
    curriculum: [
      "Coaching vs telling — when each is right",
      "The core questions that unlock thinking",
      "Feedback that changes behaviour",
      "Running a one-on-one people look forward to",
      "Holding follow-through without micromanaging",
      "Coaching through resistance and low confidence",
    ],
    inclusions: [
      "Printed training manual",
      "Certificate of completion",
      "AM & PM snacks plus lunch",
      "30-day post-training application mechanism",
      "Online reunion session with the cohort",
    ],
    problem:
      "Your team brings you every problem, you solve every problem, and nobody — including you — is growing.",
    outcomes: [
      "Tell the difference between a coaching moment and a telling moment",
      "Ask the handful of questions that unlock someone's own thinking",
      "Give feedback that actually changes what happens next week",
      "Run a one-on-one your team looks forward to",
    ],
    whatToExpect: [
      "Registration opens 8:30 AM — come early, seating is first come",
      "Bring one team member's situation you want to work through",
      "Business casual. Bring a notebook — the manual is yours to keep",
      "Triad practice — you will coach and be coached",
      "You leave with a plan for your next five one-on-ones",
    ],
    primerBlurb:
      "Coach Adrian on why solving your team's problems is the most expensive habit a manager has.",
    seatsTotal: 30,
    seatsLeft: 26,
  },
  {
    slug: "customer-experience-excellence",
    title: "Customer Experience Excellence",
    tags: ["Customer Experience"],
    start: "2026-12-04T09:00:00+08:00",
    schedule: "Friday, December 4, 2026 · 9:00 AM – 5:00 PM",
    venue: "SEDA Ayala Center Cebu, E-bloc",
    city: "Cebu City",
    price: "₱6,500*",
    image: "/images/gallery/primaryhomes/photo-5.jpg",
    status: "open",
    summary:
      "Turn ordinary service into a reason customers come back — a full day on the standards, recovery moves and team habits behind an experience people talk about.",
    intro:
      "Customers rarely remember the transaction; they remember how it felt. This workshop breaks down how to design service standards, handle complaints so they build loyalty, and get a whole team consistent.",
    audience:
      "Front-line leads, branch and store managers, and service teams in retail, hospitality, healthcare and professional services.",
    format:
      "One full day, in person. Scenario work, service-recovery role-play, and a standards draft for your own team.",
    curriculum: [
      "What customers actually judge you on",
      "Writing service standards a team can follow",
      "The first 30 seconds of every interaction",
      "Service recovery that wins loyalty back",
      "Handling difficult customers without escalating",
      "Making the standard stick across a team",
    ],
    inclusions: [
      "Printed training manual",
      "Certificate of completion",
      "AM & PM snacks plus lunch",
      "30-day post-training application mechanism",
      "Online reunion session with the cohort",
    ],
    problem:
      "Your service is fine on a good day and unpredictable on a busy one — and customers only remember the busy one.",
    outcomes: [
      "Write service standards a whole team can actually follow",
      "Own the first 30 seconds of every customer interaction",
      "Turn a complaint into the reason they stay with you",
      "De-escalate a difficult customer without giving away the business",
    ],
    whatToExpect: [
      "Registration opens 8:30 AM — come early, seating is first come",
      "Bring a recent complaint your team handled; you will rework it",
      "Business casual. Bring a notebook — the manual is yours to keep",
      "Service-recovery role-play in the afternoon block",
      "You leave with a first draft of standards for your own team",
    ],
    primerBlurb:
      "Coach Adrian on what customers are really judging you on — and it is not the transaction.",
    seatsTotal: 30,
    seatsLeft: 28,
  },
  {
    // TODO: replace representative past events with the client's real history.
    slug: "building-winning-cultures-2025",
    title: "Building Winning Cultures",
    tags: ["Culture", "Leadership"],
    start: "2025-11-14T09:00:00+08:00",
    schedule: "November 14, 2025 · 9:00 AM – 5:00 PM",
    venue: "SEDA Ayala Center Cebu, E-bloc",
    city: "Cebu City",
    price: "₱6,500*",
    image: "/images/gallery/sunlife/photo-5.jpg",
    status: "past",
    summary:
      "A sold-out day on the habits and rituals that turn a group of good people into a high-performing team.",
    intro:
      "Culture is what the team does when no one is watching. This session broke down the small, repeatable rituals that compound into a winning culture.",
    audience: "Team leads, department heads and business owners.",
    format: "One full day, in person.",
    curriculum: [
      "What culture actually is — and isn't",
      "The rituals that build belonging",
      "Standards, scoreboards and streaks",
      "Catching and correcting drift early",
    ],
    inclusions: [
      "Printed training manual",
      "Certificate of completion",
      "AM & PM snacks plus lunch",
      "30-day post-training application mechanism",
      "Online reunion session with the cohort",
    ],
    problem:
      "You hired good people individually and somehow ended up with a team that does not hold together.",
    outcomes: [
      "Name what your culture actually is right now, not what the poster says",
      "Install rituals that build belonging without a budget",
      "Catch cultural drift early enough to correct it",
    ],
    whatToExpect: [
      "Registration opens 8:30 AM — come early, seating is first come",
      "Business casual. Bring a notebook — the manual is yours to keep",
      "You leave with a written ritual plan for your team",
    ],
    primerBlurb:
      "Coach Adrian on what culture actually is — and what it is not.",
    seatsTotal: 40,
    seatsLeft: 0,
  },
]

export const OPEN_WORKSHOPS = WORKSHOPS.filter((w) => w.status === "open")
export const PAST_WORKSHOPS = WORKSHOPS.filter((w) => w.status === "past")

/**
 * Soonest open workshop by start date — powers the landing announcement strip.
 * `start` is ISO 8601 with a fixed +08:00 offset on every row, so a lexical
 * sort is chronological.
 */
export const NEXT_WORKSHOP: Workshop | undefined = [...OPEN_WORKSHOPS].sort(
  (a, b) => a.start.localeCompare(b.start)
)[0]

export function getWorkshop(slug: string): Workshop | undefined {
  return WORKSHOPS.find((w) => w.slug === slug)
}
