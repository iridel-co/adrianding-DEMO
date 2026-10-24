import "server-only"

import { cache } from "react"
import { notFound } from "next/navigation"
import { z } from "zod"
import {
  publicClientsSchema,
  publicFaqsSchema,
  publicIndustriesSchema,
  publicProfileSchema,
  publicProgramsSchema,
  publicTestimonialsSchema,
  publicWorkshopDetailSchema,
  publicWorkshopsSchema,
} from "./public-content"

async function read<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  const origin = process.env.PORTAL_API_URL
  if (!origin) throw new Error("PORTAL_API_URL is required for CMS content.")
  const response = await fetch(new URL(`/api/public/${path}`, origin), {
    next: { revalidate: 60 },
    signal: AbortSignal.timeout(10000),
  })
  if (response.status === 404) throw new PublicContentNotFound()
  if (!response.ok) throw new Error(`CMS request failed (${response.status}).`)
  return schema.parse(await response.json())
}

export class PublicContentNotFound extends Error {}

export const getPublicProfile = cache(() =>
  read("profile", publicProfileSchema)
)
export const getPublicClients = cache(() =>
  read("clients", publicClientsSchema)
)
export const getPublicIndustries = cache(() =>
  read("industries", publicIndustriesSchema)
)
export const getPublicPrograms = cache(() =>
  read("programs", publicProgramsSchema)
)
export const getPublicTestimonials = cache(() =>
  read("testimonials", publicTestimonialsSchema)
)
export const getPublicFaqs = cache(() => read("faqs", publicFaqsSchema))
export const getPublicWorkshops = cache(() =>
  read("workshops", publicWorkshopsSchema)
)
export const getPublicWorkshop = cache(async (slug: string) => {
  try {
    return await read(
      `workshops/${encodeURIComponent(slug)}`,
      publicWorkshopDetailSchema
    )
  } catch (error) {
    if (error instanceof PublicContentNotFound) notFound()
    throw error
  }
})
