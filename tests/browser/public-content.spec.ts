import { expect, test } from "@playwright/test"
import {
  formatPublicPrice,
  parseCmsCounter,
  publicApiErrorSchema,
  publicClientsSchema,
  publicFaqsSchema,
  publicIndustriesSchema,
  publicMediaSchema,
  publicPriceSchema,
  publicProfileSchema,
  publicProgramsSchema,
  publicSessionSchema,
  publicSessionTimestamps,
  publicTestimonialsSchema,
  publicWorkshopDetailSchema,
  publicWorkshopsSchema,
} from "../../src/lib/public-content"
import { workshopView } from "../../src/lib/workshop-view"
import { getWorkshopAvailability } from "../../src/lib/workshop-availability"
import { sessionAvailability } from "../../src/lib/public-workshops"

const media = {
  url: "https://example.test/photo.webp",
  alt: "Sample",
  width: null,
  height: null,
}
const price = { centavos: 650000, currency: "PHP" as const, note: "" }
const session = {
  id: "1",
  date: "2026-11-20",
  endDate: "2026-11-21",
  startTime: "09:30",
  endTime: "17:00",
  timezone: "Asia/Manila" as const,
  venueName: "Sample",
  city: "Manila",
  venueMapUrl: null,
  registrationCutoffAt: "2026-11-19T09:30:00+08:00",
  price,
  capacity: 24,
  status: "open" as const,
  isRegistrationOpen: false,
}
const workshop = {
  slug: "sample",
  title: "Sample",
  summary: "Summary",
  heroImage: media,
  tags: ["Any CMS tag"],
  defaultPrice: price,
}
const profile = {
  headline: "",
  tagline: "",
  roles: [],
  shortBio: "",
  longBio: [],
  portrait: null,
  emails: [],
  phone: "",
  footerTopics: [],
  socialLinks: [],
  stats: [],
  timeline: [],
  credentials: [],
  corporatePrimer: { videoUrl: null, blurb: "" },
}
const industry = { id: "1", name: "Sample" }
const client = { ...industry, logo: media, industry, isFeatured: true }
const program = {
  id: "1",
  slug: "sample-program",
  title: "Sample",
  summary: "Develop your team.",
  image: media,
  usefulFor: ["Teams"],
}
const testimonial = {
  id: "1",
  quote: "Sample",
  personName: "Sam",
  photo: media,
  role: "Lead",
  company: "Sample",
  workshop: { slug: "sample", title: "Sample" },
  isFeatured: true,
}
const detail = {
  ...workshop,
  courseCode: null,
  problem: "",
  intro: "",
  audience: "",
  format: "",
  primerVideoUrl: null,
  primerBlurb: "",
  defaultCapacity: null,
  defaultVenue: { name: "Sample", city: "Manila", mapUrl: null },
  outcomes: [],
  curriculum: [],
  inclusions: [],
  whatToExpect: [],
  sessions: [session, { ...session, id: "2", status: "closed" }],
}
const collections = [
  [publicWorkshopsSchema, { ...workshop, nextSession: session }],
  [publicClientsSchema, client],
  [publicIndustriesSchema, industry],
  [publicProgramsSchema, program],
  [publicTestimonialsSchema, testimonial],
  [
    publicFaqsSchema,
    { id: "1", group: "workshop", question: "Sample?", answer: "Yes" },
  ],
] as const

test.describe("Public CMS contracts @policy", () => {
  test("accepts all endpoints, empty collections and masked relationships", () => {
    expect(publicProfileSchema.parse(profile)).toEqual(profile)
    for (const [schema, record] of collections) {
      expect(schema.parse([record])).toEqual([record])
      expect(schema.parse([])).toEqual([])
    }
    expect(publicWorkshopDetailSchema.parse(detail)).toEqual(detail)
    const masked = [
      [
        publicWorkshopsSchema,
        { ...workshop, heroImage: null, defaultPrice: null, nextSession: null },
      ],
      [publicClientsSchema, { ...client, logo: null, industry: null }],
      [publicProgramsSchema, { ...program, image: null }],
      [
        publicTestimonialsSchema,
        { ...testimonial, photo: null, workshop: null },
      ],
    ] as const
    for (const [schema, record] of masked)
      expect(schema.parse([record])).toEqual([record])
    const error = { error: { code: "not_found", message: "Not found" } }
    expect(publicApiErrorSchema.parse(error)).toEqual(error)
  })

  test("rejects malformed wire values and strips audit fields", () => {
    expect(
      publicProgramsSchema.safeParse([{ ...program, slug: undefined }]).success
    ).toBe(false)
    expect(
      publicProgramsSchema.safeParse([{ ...program, summary: undefined }])
        .success
    ).toBe(false)
    for (const centavos of [-1, 1.5, "650000"]) {
      expect(publicPriceSchema.safeParse({ ...price, centavos }).success).toBe(
        false
      )
    }
    for (const invalid of [
      { date: "2026-02-30" },
      { startTime: "24:00" },
      { status: "draft" },
    ]) {
      expect(
        publicSessionSchema.safeParse({ ...session, ...invalid }).success
      ).toBe(false)
    }
    expect(
      publicMediaSchema.safeParse({ ...media, url: "/relative.webp" }).success
    ).toBe(false)
    expect(
      publicWorkshopDetailSchema.parse({ ...detail, auditLog: "private" })
    ).toEqual(detail)
  })

  test("maps money and Manila times without inferring registration eligibility", () => {
    expect(formatPublicPrice(price)).toBe("₱6,500.00")
    expect(formatPublicPrice({ ...price, centavos: 650001 })).toBe("₱6,500.01")
    expect(publicSessionTimestamps(session)).toEqual({
      start: "2026-11-20T09:30:00+08:00",
      end: "2026-11-21T17:00:00+08:00",
    })
    const parsed = publicSessionSchema.parse(session)
    expect(parsed.status).toBe("open")
    expect(parsed.isRegistrationOpen).toBe(false)
    expect(parsed).not.toHaveProperty("seatsLeft")
    for (const seatsLeft of [0, 1, 9]) {
      const counted = publicSessionSchema.parse({
        ...session,
        seatsLeft,
        isRegistrationOpen: true,
      })
      const countedView = workshopView(
        publicWorkshopDetailSchema.parse({ ...detail, sessions: [counted] })
      )
      expect(countedView.seatsLeft).toBe(seatsLeft)
      expect(countedView.seatsTotal).toBe(24)
      expect(sessionAvailability(counted)).toBe(
        seatsLeft === 0
          ? "Fully booked"
          : `${seatsLeft} ${seatsLeft === 1 ? "seat" : "seats"} left`
      )
      expect(getWorkshopAvailability(countedView).canRegister).toBe(
        seatsLeft > 0
      )
      expect(
        sessionAvailability({ ...counted, isRegistrationOpen: false })
      ).toBe("Registration closed")
    }
    expect(
      publicSessionSchema.safeParse({ ...session, seatsLeft: -1 }).success
    ).toBe(false)
    expect(
      publicSessionSchema.safeParse({ ...session, seatsLeft: 1.5 }).success
    ).toBe(false)
    const view = workshopView(publicWorkshopDetailSchema.parse(detail))
    expect(view.title).toBe(detail.title)
    expect(view.curriculum).toEqual(detail.curriculum)
    expect(getWorkshopAvailability(view).canRegister).toBe(false)
    const ongoing = workshopView(
      publicWorkshopDetailSchema.parse({
        ...detail,
        sessions: [
          {
            ...session,
            date: "2000-01-01",
            endDate: "2099-12-31",
            isRegistrationOpen: true,
          },
        ],
      })
    )
    expect(ongoing.status).toBe("open")
    expect(getWorkshopAvailability(ongoing).canRegister).toBe(true)
  })

  test("@policy numeric animation preserves CMS formatting", () => {
    expect(parseCmsCounter("20,000+")).toEqual({
      to: 20000,
      prefix: "",
      suffix: "+",
      decimals: 0,
    })
    expect(parseCmsCounter("12.50%")).toEqual({
      to: 12.5,
      prefix: "",
      suffix: "%",
      decimals: 2,
    })
    for (const value of [
      "20000+",
      "001",
      "20–30",
      "20,00+",
      "9007199254740992",
      "Many teams",
    ]) {
      expect(parseCmsCounter(value)).toBeNull()
    }
  })
})
