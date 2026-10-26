import { z } from "zod"

// Read-only CMS contract: adrian-ding-portal main at 898bcbe (merged PR #2).
// These contracts do not activate fetching or replace the local content catalogue.
const nullableUrl = z.url().nullable()
const date = z.iso.date()
const time = z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/)

export const publicMediaSchema = z.object({
  url: z.url(),
  alt: z.string(),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
})

export const publicPriceSchema = z.object({
  centavos: z.number().int().nonnegative(),
  currency: z.literal("PHP"),
  note: z.string(),
})

export const publicSessionSchema = z.object({
  id: z.string(),
  date,
  endDate: date,
  startTime: time,
  endTime: time,
  timezone: z.literal("Asia/Manila"),
  venueName: z.string(),
  city: z.string(),
  venueMapUrl: nullableUrl,
  registrationCutoffAt: z.iso.datetime({ offset: true }).nullable(),
  price: publicPriceSchema,
  capacity: z.number().int().nonnegative(),
  seatsLeft: z.number().int().nonnegative().optional(),
  status: z.enum(["open", "closed"]),
  isRegistrationOpen: z.boolean(),
})

export const publicWorkshopSchema = z.object({
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  heroImage: publicMediaSchema.nullable(),
  tags: z.array(z.string()),
  defaultPrice: publicPriceSchema.nullable(),
  nextSession: publicSessionSchema.nullable(),
})

export const publicWorkshopDetailSchema = publicWorkshopSchema
  .omit({ nextSession: true })
  .extend({
    courseCode: z.string().nullable(),
    problem: z.string(),
    intro: z.string(),
    audience: z.string(),
    format: z.string(),
    primerVideoUrl: nullableUrl,
    primerBlurb: z.string(),
    defaultVenue: z.object({
      name: z.string(),
      city: z.string(),
      mapUrl: nullableUrl,
    }),
    defaultCapacity: z.number().int().nonnegative().nullable(),
    outcomes: z.array(z.string()),
    curriculum: z.array(z.string()),
    inclusions: z.array(z.string()),
    whatToExpect: z.array(z.string()),
    sessions: z.array(publicSessionSchema),
  })

export const publicIndustrySchema = z.object({
  id: z.string(),
  name: z.string(),
})
export const publicClientSchema = z.object({
  id: z.string(),
  name: z.string(),
  logo: publicMediaSchema.nullable(),
  industry: publicIndustrySchema.nullable(),
  isFeatured: z.boolean(),
})
export const publicProgramSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  image: publicMediaSchema.nullable(),
  usefulFor: z.array(z.string()),
})
export const publicTestimonialSchema = z.object({
  id: z.string(),
  quote: z.string(),
  personName: z.string(),
  photo: publicMediaSchema.nullable(),
  role: z.string(),
  company: z.string(),
  workshop: z.object({ slug: z.string(), title: z.string() }).nullable(),
  isFeatured: z.boolean(),
})
export const publicFaqSchema = z.object({
  id: z.string(),
  group: z.enum(["workshop", "about"]),
  question: z.string(),
  answer: z.string(),
})

export const publicProfileSchema = z.object({
  headline: z.string(),
  tagline: z.string(),
  roles: z.array(z.string()),
  shortBio: z.string(),
  longBio: z.array(z.string()),
  portrait: publicMediaSchema.nullable(),
  emails: z.array(z.string()),
  phone: z.string(),
  footerTopics: z.array(z.string()),
  socialLinks: z.array(
    z.object({
      network: z.enum([
        "linkedin",
        "facebook",
        "instagram",
        "tiktok",
        "youtube",
      ]),
      url: z.string(),
    })
  ),
  stats: z.array(
    z.object({
      value: z.string(),
      label: z.string(),
      description: z.string(),
      pages: z.array(z.enum(["home", "about", "corporate", "inquiry"])),
    })
  ),
  timeline: z.array(
    z.object({
      period: z.string(),
      title: z.string(),
      description: z.string(),
      image: publicMediaSchema.nullable(),
    })
  ),
  credentials: z.array(
    z.object({
      organization: z.string(),
      description: z.string(),
      logo: publicMediaSchema.nullable(),
    })
  ),
  corporatePrimer: z.object({
    videoUrl: z.string().nullable(),
    blurb: z.string(),
  }),
})

export const publicWorkshopsSchema = z.array(publicWorkshopSchema)
export const publicClientsSchema = z.array(publicClientSchema)
export const publicIndustriesSchema = z.array(publicIndustrySchema)
export const publicProgramsSchema = z.array(publicProgramSchema)
export const publicTestimonialsSchema = z.array(publicTestimonialSchema)
export const publicFaqsSchema = z.array(publicFaqSchema)
export const publicApiErrorSchema = z.object({
  error: z.object({
    code: z.enum([
      "invalid_request",
      "not_found",
      "method_not_allowed",
      "internal_error",
    ]),
    message: z.string(),
  }),
})

export type PublicMedia = z.infer<typeof publicMediaSchema>
export type PublicPrice = z.infer<typeof publicPriceSchema>
export type PublicSession = z.infer<typeof publicSessionSchema>
export type PublicWorkshop = z.infer<typeof publicWorkshopSchema>
export type PublicWorkshopDetail = z.infer<typeof publicWorkshopDetailSchema>
export type PublicIndustry = z.infer<typeof publicIndustrySchema>
export type PublicClient = z.infer<typeof publicClientSchema>
export type PublicProgram = z.infer<typeof publicProgramSchema>
export type PublicTestimonial = z.infer<typeof publicTestimonialSchema>
export type PublicFaq = z.infer<typeof publicFaqSchema>
export type PublicProfile = z.infer<typeof publicProfileSchema>
export type PublicApiError = z.infer<typeof publicApiErrorSchema>

export function formatPublicPrice(price: PublicPrice): string {
  const { centavos } = publicPriceSchema.parse(price)
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(centavos / 100)
}

export function publicSessionTimestamps(session: PublicSession): {
  start: string
  end: string
} {
  const parsed = publicSessionSchema.parse(session)
  return {
    start: `${parsed.date}T${parsed.startTime}:00+08:00`,
    end: `${parsed.endDate}T${parsed.endTime}:00+08:00`,
  }
}

// Animate only values the existing counter can reproduce exactly.
export function parseCmsCounter(value: string) {
  const match = /^([^\d]*)(\d[\d,]*(?:\.\d+)?)([^\d]*)$/.exec(value)
  if (!match) return null
  const [, prefix, numeric, suffix] = match
  const to = Number(numeric.replaceAll(",", ""))
  const decimals = numeric.split(".")[1]?.length ?? 0
  if (!Number.isFinite(to) || to > Number.MAX_SAFE_INTEGER || decimals > 20) {
    return null
  }
  const formatted = to.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  if (formatted !== numeric) return null
  return { to, prefix, suffix, decimals }
}
