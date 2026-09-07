/**
 * Public workshop catalogue — powers the workshops list, each workshop detail
 * page (with its countdown + registration form), and the landing-page preview.
 *
 * In the real build this is CMS-managed. Prices are unset pending the client
 * (PRD): shown as "Price on inquiry*" — real UI copy, not a raw placeholder
 * token, so it reads as intentional if this ships before the client confirms
 * figures. TODO: swap in the real price once supplied. Curriculum outlines are
 * representative — TODO: replace with the exact outline from the source deck.
 */

export type Workshop = {
  slug: string
  title: string
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
  status: "open" | "past"
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
  seatsTotal: number
  /** Drives the scarcity pill. TODO: CMS-managed in the real build. */
  seatsLeft: number
}

export const WORKSHOPS: Workshop[] = [
  {
    slug: "exceptional-salesmanship",
    title: "Exceptional Salesmanship",
    start: "2026-10-09T09:00:00+08:00",
    schedule: "Friday, October 9, 2026 · 9:00 AM – 5:00 PM",
    venue: "SEDA Ayala Center Cebu, E-bloc",
    city: "Cebu City",
    price: "Price on inquiry*",
    image: "/images/gallery/primaryhomes/photo-3.jpg",
    status: "open",
    summary:
      "A full-day intensive on the mindset, language and process behind sales that close — without pressure tactics.",
    intro:
      "Selling is a transfer of conviction. This one-day workshop rebuilds how you open, qualify, present and close — so the sale feels like the natural next step for the buyer, not a battle. Built for professionals who live and die by their numbers.",
    audience:
      "Account managers, agents and consultants in insurance, real estate, medical, retail and service industries — anyone carrying a quota.",
    format:
      "One full day, in person. Live frameworks, paired practice, role-play with feedback, and a 30-day application plan you leave with.",
    curriculum: [
      "The conviction transfer — why people actually buy",
      "Opening for trust in the first 90 seconds",
      "Question ladders that surface the real need",
      "Presenting value so price becomes a detail",
      "Handling objections without friction",
      "Closing language and the assumptive next step",
      "Building a referral engine from every client",
    ],
    inclusions: [
      "Printed training manual",
      "Certificate of completion",
      "AM & PM snacks plus lunch",
      "30-day post-training application mechanism",
      "Online reunion session with the cohort",
    ],
    problem:
      "You are doing the calls, the follow-ups and the presentations — and still losing deals you should have won.",
    outcomes: [
      "Open a conversation so the prospect wants the next meeting",
      "Ask the questions that surface the real reason they would buy",
      "Answer “it's too expensive” without discounting",
      "Close on a clear next step instead of “let me think about it”",
    ],
    whatToExpect: [
      "Registration opens 8:30 AM — come early, seating is first come",
      "Bring one live deal you are stuck on; you will rebuild it during the day",
      "Business casual. Bring a notebook — the manual is yours to keep",
      "Role-play with feedback in the afternoon block",
      "You leave with a written 30-day application plan",
    ],
    primerBlurb:
      "A short message from Coach Adrian on what to think about before the day starts.",
    seatsTotal: 40,
    seatsLeft: 11,
  },
  {
    slug: "exceptional-leadership",
    title: "Exceptional Leadership",
    start: "2026-10-16T09:00:00+08:00",
    schedule: "Friday, October 16, 2026 · 9:00 AM – 5:00 PM",
    venue: "SEDA Ayala Center Cebu, E-bloc",
    city: "Cebu City",
    price: "Price on inquiry*",
    image: "/images/gallery/sunlife/photo-3.jpg",
    status: "open",
    summary:
      "The shift from managing tasks to leading people — a practical day on influence, standards and building a team that owns its results.",
    intro:
      "Most people are promoted for their individual output and then left to figure out leadership on the job. This workshop closes that gap: how to set standards people rise to, have the conversations you have been avoiding, and build a culture that holds without you in the room.",
    audience:
      "New and emerging leaders, supervisors, and senior individual contributors stepping into people management.",
    format:
      "One full day, in person. Case work, guided self-assessment, live coaching demos, and a personal leadership plan.",
    curriculum: [
      "Manager vs leader — the real difference in the day-to-day",
      "Setting standards people choose to meet",
      "The accountability conversation, start to finish",
      "Coaching in the moment instead of rescuing",
      "Delegation that develops the team",
      "Reading and shaping team culture",
      "Your 90-day leadership plan",
    ],
    inclusions: [
      "Printed training manual",
      "Certificate of completion",
      "AM & PM snacks plus lunch",
      "30-day post-training application mechanism",
      "Online reunion session with the cohort",
    ],
    problem:
      "You were promoted for being good at the work. Nobody taught you how to lead the people who now do it.",
    outcomes: [
      "Set a standard your team meets without being chased",
      "Run the accountability conversation you have been putting off",
      "Delegate so people grow instead of handing work back",
      "Leave with a written 90-day plan for your team",
    ],
    whatToExpect: [
      "Registration opens 8:30 AM — come early, seating is first come",
      "Bring one situation with a team member you want to resolve",
      "Business casual. Bring a notebook — the manual is yours to keep",
      "Guided self-assessment in the morning block",
      "You leave with a written 90-day leadership plan",
    ],
    primerBlurb:
      "Coach Adrian on the one shift that separates a manager from a leader — worth five minutes before the day.",
    seatsTotal: 40,
    seatsLeft: 17,
  },
  // TODO: placeholder open workshops — added to preview a fuller catalogue.
  // Replace with the client's real upcoming dates.
  {
    slug: "presenting-with-impact",
    title: "Presenting with Impact",
    start: "2026-10-23T09:00:00+08:00",
    schedule: "Friday, October 23, 2026 · 9:00 AM – 5:00 PM",
    venue: "SEDA Ayala Center Cebu, E-bloc",
    city: "Cebu City",
    price: "Price on inquiry*",
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
    start: "2026-11-06T09:00:00+08:00",
    schedule: "Friday, November 6, 2026 · 9:00 AM – 5:00 PM",
    venue: "SEDA Ayala Center Cebu, E-bloc",
    city: "Cebu City",
    price: "Price on inquiry*",
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
    start: "2026-11-20T09:00:00+08:00",
    schedule: "Friday, November 20, 2026 · 9:00 AM – 5:00 PM",
    venue: "SEDA Ayala Center Cebu, E-bloc",
    city: "Cebu City",
    price: "Price on inquiry*",
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
    start: "2026-12-04T09:00:00+08:00",
    schedule: "Friday, December 4, 2026 · 9:00 AM – 5:00 PM",
    venue: "SEDA Ayala Center Cebu, E-bloc",
    city: "Cebu City",
    price: "Price on inquiry*",
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
    start: "2025-11-14T09:00:00+08:00",
    schedule: "November 14, 2025 · 9:00 AM – 5:00 PM",
    venue: "SEDA Ayala Center Cebu, E-bloc",
    city: "Cebu City",
    price: "Price on inquiry*",
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
