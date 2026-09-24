/**
 * Adrian's six areas of specialization. Short `blurb` for the landing teaser +
 * corporate page grid; longer `detail` for the About page's expanded version.
 * Copy is representative around the PRD's capability list. `usefulFor` feeds
 * the corporate page's programme carousel only; the landing section does not
 * read it.
 */
import {
  Compass,
  Mic,
  Users,
  MessagesSquare,
  GraduationCap,
  UserRoundCheck,
  type LucideIcon,
} from "lucide-react"
import { placeholderImg } from "@/lib/images"

export type Specialization = {
  key: string
  title: string
  blurb: string
  detail: string
  /** "Useful for" bullets on the corporate carousel's expanded card — who this
   *  programme is for. TODO: representative copy; Adrian to confirm. */
  usefulFor: string[]
  icon: LucideIcon
}

// TODO: Adrian to confirm the usefulFor bullets (representative, 2026-09-19)
export const SPECIALIZATIONS: Specialization[] = [
  {
    key: "leadership",
    title: "Leadership Training & Development",
    blurb:
      "Turning strong individual performers into leaders who set standards and grow the people around them.",
    detail:
      "Programs that move managers from running tasks to leading people — accountability conversations, coaching in the moment, delegation that develops, and the personal standards a team rises to meet.",
    usefulFor: [
      "New and first-time managers promoted from strong individual roles",
      "Supervisors who still take the work back instead of delegating it",
      "Mid-level leaders who need to hold people accountable without losing their trust",
      "Companies building a leadership bench ahead of growth or succession",
    ],
    icon: Compass,
  },
  {
    key: "keynotes",
    title: "Inspirational Keynotes",
    blurb:
      "High-energy, story-led keynotes that leave an audience with something to use, not just a feeling.",
    detail:
      "Conference and company-event keynotes on leadership, culture and performance — built to land with a room of hundreds and still feel personal, and always tied to a concrete takeaway.",
    usefulFor: [
      "Conventions, kick-offs and awards nights that need a high-energy opener",
      "Sales and leadership summits of 100 to 1,000+ people",
      "Moments of change — a merger, a relaunch, a hard year — when the room needs a reset",
      "Events that want a takeaway people still use next week, not just a good mood",
    ],
    icon: Mic,
  },
  {
    key: "culture",
    title: "Winning Cultures & High-Performing Teams",
    blurb:
      "The rituals and standards that compound a group of good people into a team that wins.",
    detail:
      "How culture actually forms — the small repeatable rituals, scoreboards and streaks — and how to catch and correct drift early before it sets. For teams that need to hold their edge under pressure.",
    usefulFor: [
      "Teams that grew fast and lost the habits that made them good",
      "Departments working in silos that need to operate as one team",
      "Leadership teams relaunching values that currently live only on a poster",
      "Organisations coming out of a restructure, redundancy or merger",
    ],
    icon: Users,
  },
  {
    key: "communication",
    title: "Effective & Compelling Communications",
    blurb:
      "Saying it so it moves people — clarity, structure and presence, in the room and on stage.",
    detail:
      "Message structure, executive presence, handling the tough question, and presenting so the point survives the meeting. Practical work for leaders and client-facing teams.",
    usefulFor: [
      "Leaders who present to boards, clients or large internal audiences",
      "Client-facing and sales teams whose pitch has to land the first time",
      "Technical experts who need to explain complex work to non-experts",
      "Managers handling feedback, difficult conversations and tough questions",
    ],
    icon: MessagesSquare,
  },
  {
    key: "train-the-trainer",
    title: "Train the Trainer + Coach the Coaches",
    blurb:
      "Equipping in-house facilitators and coaches to run sessions that change behaviour, not just the mood.",
    detail:
      "Session design, facilitation craft, and coaching skill for internal L&D teams — so the capability stays in the company after the external trainer leaves.",
    usefulFor: [
      "In-house L&D teams and internal facilitators",
      "Subject-matter experts asked to train their own colleagues",
      "Team leads rolling out a coaching culture internally",
      "Companies that want the capability to stay after the external trainer leaves",
    ],
    icon: GraduationCap,
  },
  {
    key: "personal-branding",
    title: "Corporate Imaging & Personal Branding",
    blurb:
      "The signal you send before you say a word — presence, positioning and consistency.",
    detail:
      "For leaders and client-facing professionals: aligning how you show up with what you want to be known for, across the room, the deck and the profile.",
    usefulFor: [
      "Senior leaders stepping into more visible, external-facing roles",
      "Client-facing professionals in banking, insurance, real estate and consulting",
      "Newly promoted executives whose presence needs to match the title",
      "Teams representing the company at events, pitches and online",
    ],
    icon: UserRoundCheck,
  },
]

/* TODO: replace the placeholderImg() Unsplash stand-ins with real program
   photos once the client supplies them — one landscape shot per program. */
export const SPECIALIZATION_IMAGES: Record<string, string> = {
  leadership: placeholderImg("1552664730-d307ca884978", 1400, 800),
  keynotes: placeholderImg("1475721027785-f74eccf877e2", 1400, 800),
  culture: placeholderImg("1522071820081-009f0129c71c", 1400, 800),
  communication: placeholderImg("1543269865-cbf427effbad", 1400, 800),
  "train-the-trainer": placeholderImg("1524178232363-1fb2b075b655", 1400, 800),
  // Tall portrait original — a centered 1400x800 crop starts at the mouth, so
  // take a taller top-anchored crop that actually contains the head.
  "personal-branding": placeholderImg(
    "1560250097-0b93528c311a",
    1400,
    1200,
    "top"
  ),
}

// Last card's portrait shot is taller than the card at every breakpoint, so
// the default centered crop lands on the chest. Bias it up to the eye line —
// ~42% reads the same framing collapsed and expanded.
export const SPECIALIZATION_IMAGE_POSITIONS: Record<string, string> = {
  "personal-branding": "50% 42%",
}

export const SPECIALIZATION_IMAGE_ALTS: Record<string, string> = {
  leadership: "Managers in a leadership development session around a table",
  keynotes: "Adrian Ding on stage delivering a keynote to a full room",
  culture: "A team working closely together in an open workspace",
  communication: "A leader presenting to colleagues in a meeting room",
  "train-the-trainer": "An internal facilitator running a training session",
  "personal-branding":
    "A professional in a considered, confident portrait setting",
}
