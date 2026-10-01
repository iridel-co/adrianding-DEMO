/**
 * Testimonials for the landing carousel and the corporate-training page.
 * Quotes are the client's own wording, verbatim. Orgs without logo artwork
 * (PETDA, Rotary International) render as a name chip.
 */

export type Testimonial = {
  quote: string
  name: string
  role: string
  org: string
  /** Include in the corporate-training page's curated subset. */
  corporate: boolean
  /** Headshot under /public (square WebP, 320px). */
  photo?: string
  /** Company logo under /public. Omitted orgs render as a name chip. */
  logo?: string
  /** Logo artwork proportion; "square" emblems get a taller box. */
  logoShape?: "wide" | "square"
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Great leadership isn’t just about direction – it’s about transformation. And that’s exactly what Coach Adrian and the incredible team at Maximum Impact Philippines delivered for us. Their recent training program for my team was nothing short of transformative. With passion, expertise, and a deep commitment to growth, Adrian equipped us with practical tools, renewed motivation and actionable strategies to elevate our performance. The energy, insights and engaging approach left a lasting impact on every participant. Thank you for your dedication to empowering teams and fostering excellence. You’ve not only sharpened our skills but also inspired us to push beyond limit.",
    name: "Aseem Roy",
    role: "Global Practice Head - Digital CX (BPS) | Country Head",
    org: "Wipro",
    corporate: true,
    photo: "/images/testimonials/aseem-roy.webp",
    logo: "/images/logos/co-wipro.svg",
    logoShape: "square",
  },
  {
    quote:
      "We’ve invited Coach Adrian Ding twice now for our Leadership Learning Series, and both times he delivered something fresh, relevant, and genuinely impactful. He speaks with a lot of energy and clarity and effectively connects across cultures — very relatable to our local leaders, while also resonating with our international teams. His insights on leadership are practical, engaging, and grounded in real life stories. The team leaves the session not just inspired, but with ideas they can actually use in the workplace and their daily lives.",
    name: "Jay Aure",
    role: "Country Head Global Service Center",
    org: "Global Payments Inc.",
    corporate: true,
    photo: "/images/testimonials/jay-aure.webp",
    logo: "/images/logos/co-global-payments.svg",
  },
  {
    quote:
      "Mr. Adrian Ding is a versatile motivational speaker and facilitator. Whether it is weaving basic leadership concepts into a simple and relatable guide for new leaders, or helping us senior leaders focus on strategic, high-impact areas that drive overall business performance, he is equally engaging and inspiring!",
    name: "Michael So",
    role: "General Manager",
    org: "Rose Pharmacy Inc.",
    corporate: true,
    photo: "/images/testimonials/michael-so.webp",
    logo: "/images/logos/co-rose-pharmacy.png",
  },
  {
    quote:
      "Adrian is a brilliant mentor and coach. What makes him exceptional isn’t just his knowledge, but his sincerity, patience and belief in others. He has the gift of teaching in a way that sticks and inspires. Our leadership team is grateful for his contribution to our organization.",
    name: "Joseph Liwag",
    role: "Vice President & Managing Director",
    org: "Knowles Philippines",
    logo: "/images/logos/co-knowles.webp",
    corporate: true,
    photo: "/images/testimonials/joseph-liwag.webp",
  },
  {
    quote:
      "Partnering with Coach Adrian Ding and Maximum Impact Philippines was an enriching experience for our company. Adrian and his team delivered powerful, purpose-driven insights that inspired motivation, growth and lasting impact. Their commitment to excellence was evident from the strategic pre-event consultation to the post event follow up that ensured our objectives were clearly communicated and fully embraced by our sales, admin, operations and senior leadership teams.",
    name: "Peter Limquiaco",
    role: "President",
    org: "Global Pacific",
    corporate: true,
    photo: "/images/testimonials/peter-limquiaco.webp",
    logo: "/images/logos/co-global-pacific.png",
  },
  {
    quote:
      "We have been working with Adrian for the past 3 years. He consistently delivers. All his session designs were aligned to our intended outcomes. He is a world class facilitator - maintains the strategic level interaction, provokes thought and builds engagement effectively. More power Adrian and continue helping organizations realize their best!",
    name: "Nonoy Nuyles",
    role: "Country Head of Human Resources",
    org: "HSBC Philippines",
    corporate: true,
    photo: "/images/testimonials/nonoy-nuyles.webp",
    logo: "/images/logos/co-hsbc.svg",
  },
  {
    quote:
      "Coach Adrian’s motivational sessions during our Regional Conventions in Cebu, Manila and Davao, were nothing short of transformative. With clarity, passion and sharp business insight, he empowered our dealers to lead with purpose and embrace growth.",
    name: "Sonia Madrid",
    role: "President",
    org: "Petron Dealers Association (PETDA)",
    corporate: true,
    photo: "/images/testimonials/sonia-madrid.webp",
  },
  {
    quote:
      "Coach Adrian Ding was an absolute standout during our DISCON 2025, setting the tone as the very first plenary speaker with his energy, heart and powerful presence. He wasn’t merely there to speak; he created a shared experience that resonated deeply with every person in the room. His presence is the kind you’d want in any event that aims to inspire, connect and create lasting impact.",
    name: "Richard Centino",
    role: "District Governor",
    org: "Rotary International",
    corporate: true,
    photo: "/images/testimonials/richard-centino.webp",
  },
]

export const CORPORATE_TESTIMONIALS = TESTIMONIALS.filter((t) => t.corporate)
