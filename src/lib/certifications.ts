/**
 * Adrian's credentials — read by the About page's full logo row and by the
 * compact credential strip on each workshop detail page. Lives here rather than
 * inline in the About section because ad traffic lands straight on a course page
 * and needs the same proof without a detour.
 *
 * TODO: confirm the exact accrediting-body names and years (AET / CPD) with the
 * client; the rest are from the PRD.
 */

export type Certification = {
  name: string
  line: string
  /** Short form for the compact strip on course pages. */
  short: string
  src: string
  /**
   * Backs the mark with a circle in this color — INSEAD's wordmark has no card
   * of its own like the others, so it floats without one otherwise.
   */
  circleBg?: string
}

export const CERTIFICATIONS: Certification[] = [
  {
    name: "Peak Potentials",
    line: "Train the Trainer certification — T. Harv Eker, 2004",
    short: "Train the Trainer, 2004",
    src: "/images/logos/trainer-logo.webp",
  },
  {
    name: "Genos International",
    line: "Emotional Intelligence coaching practice, 2017",
    short: "Emotional Intelligence, 2017",
    src: "/images/logos/genos-logo.webp",
  },
  {
    name: "INSEAD",
    line: "Executive Education programme, 2021",
    short: "Executive Education, 2021",
    src: "/images/logos/insead-logo.png",
    circleBg: "#eaecef",
  },
  {
    name: "AET",
    line: "Accredited trainer",
    short: "Accredited trainer",
    src: "/images/logos/aet-logo.png",
  },
  {
    name: "CPD Council",
    line: "Accredited professional-development provider",
    short: "Accredited provider",
    src: "/images/logos/cpd-logo.webp",
  },
]
