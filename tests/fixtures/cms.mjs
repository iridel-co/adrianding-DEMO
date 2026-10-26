// Deterministic API data for browser checks; never imported by the application.
const price = { centavos: 650000, currency: "PHP", note: "Early bird offer" }
const session = {
  id: "12345678-abcd-4000-8000-123456789abc",
  date: "2026-11-20",
  endDate: "2026-11-20",
  startTime: "09:00",
  endTime: "17:00",
  timezone: "Asia/Manila",
  venueName: "CMS venue",
  city: "Cebu",
  venueMapUrl: null,
  registrationCutoffAt: null,
  price,
  capacity: 24,
  seatsLeft: 9,
  status: "open",
  isRegistrationOpen: true,
}
const workshops = [
  {
    slug: "exceptional-salesmanship",
    title: "Exceptional Salesmanship",
    summary: "CMS workshop summary.",
    tags: ["Sales", "New CMS tag"],
    heroImage: null,
    defaultPrice: price,
    nextSession: session,
  },
  {
    slug: "exceptional-leadership",
    title: "Exceptional Leadership",
    summary: "CMS leadership summary.",
    tags: ["Leadership"],
    heroImage: null,
    defaultPrice: null,
    nextSession: null,
  },
]
const industries = [
  { id: "industry-1", name: "Technology" },
  { id: "industry-2", name: "Finance" },
]
const programs = Array.from({ length: 8 }, (_, i) => ({
  id: `program-${i}`,
  slug: i === 0 ? "leadership" : `cms-program-${i}`,
  title: i === 0 ? "Leadership Training & Development" : `CMS Program ${i}`,
  summary: `CMS summary ${i}`,
  usefulFor: ["Teams"],
  image: null,
}))
const clients = industries.map((industry, i) => ({
  id: `client-${i + 1}`,
  name: `CMS Client ${i + 1}`,
  industry,
  logo: null,
  isFeatured: true,
}))
const testimonials = Array.from({ length: 3 }, (_, i) => ({
  id: `testimonial-${i}`,
  quote: `CMS quote ${i + 1}`,
  personName: `CMS Person ${i + 1}`,
  company: "CMS Company",
  role: "Leader",
  photo: null,
  isFeatured: true,
  workshop:
    i === 0 ? { slug: workshops[0].slug, title: workshops[0].title } : null,
}))
const faqs = ["about", "workshop"].map((group) => ({
  id: `faq-${group}`,
  group,
  question: `CMS ${group} question?`,
  answer: `CMS ${group} answer.`,
}))
const profile = {
  headline: "CMS profile headline",
  tagline: "Training that makes a difference.",
  roles: ["Trainer", "Coach"],
  shortBio: "CMS short biography.",
  longBio: ["CMS long biography."],
  portrait: null,
  emails: ["coach@example.test"],
  phone: "+639171234567",
  footerTopics: ["CMS topic"],
  socialLinks: [],
  stats: [
    {
      value: "20,000+",
      label: "Professionals trained",
      description: "CMS stat description.",
      pages: ["home", "about", "corporate", "inquiry"],
    },
  ],
  timeline: [
    {
      period: "2020",
      title: "CMS milestone",
      description: "CMS journey.",
      image: null,
    },
  ],
  credentials: [
    {
      organization: "CMS credential",
      description: "CMS credential description.",
      logo: null,
    },
  ],
  corporatePrimer: { videoUrl: null, blurb: "CMS primer" },
}

export function cmsReply(url) {
  const path = url.pathname.replace(/^\/api\/public\//, "")
  const missing = {
    status: 404,
    body: { error: { code: "not_found", message: "Not found" } },
  }
  if (path.startsWith("workshops/")) {
    const item = workshops.find(
      (workshop) => workshop.slug === decodeURIComponent(path.slice(10))
    )
    if (!item) return missing
    const { nextSession, ...course } = item
    return {
      status: 200,
      body: {
        ...course,
        courseCode: null,
        problem: "CMS problem.",
        intro: "CMS workshop introduction.",
        audience: "CMS audience.",
        format: "CMS format.",
        primerVideoUrl: null,
        primerBlurb: "CMS primer.",
        defaultVenue: { name: "CMS venue", city: "Cebu", mapUrl: null },
        defaultCapacity: null,
        outcomes: ["CMS outcome"],
        curriculum: ["CMS curriculum"],
        inclusions: ["CMS inclusion"],
        whatToExpect: ["CMS expectation"],
        sessions: nextSession
          ? [
              session,
              {
                ...session,
                id: "12345678-abcd-4000-8000-123456789abd",
                date: "2026-12-01",
                endDate: "2026-12-01",
                status: "closed",
                isRegistrationOpen: false,
              },
            ]
          : [],
      },
    }
  }
  if (path.startsWith("programs/")) {
    const program = programs.find(
      (item) => item.slug === decodeURIComponent(path.slice(9))
    )
    return program ? { status: 200, body: program } : missing
  }
  const data = {
    profile,
    workshops,
    programs,
    industries,
    clients,
    testimonials,
    faqs,
  }[path]
  return data ? { status: 200, body: data } : missing
}
