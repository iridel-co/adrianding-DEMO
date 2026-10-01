/**
 * Companies Adrian Ding / Maximum Impact PH have trained, for the "You're in
 * great company" marquee (landing + corporate-training pages).
 *
 * Categories and the client roster below are the client's own list. Logos are
 * the cleaned set in `public/images/logos/` (prefix `co-`); an entry with no
 * `src` is a confirmed client whose logo artwork has not been sourced yet — the
 * marquee renders those as a name chip and footnotes the count.
 */

export type CompanyLogo = {
  name: string
  /** Path under /public. Omitted when no logo artwork exists yet. */
  src?: string
  /**
   * Artwork proportion. "square" logos (emblems, stacked marks, portrait
   * lockups) are capped shorter in the marquee so they don't tower over the
   * wide wordmarks sitting at the same row height. Default is "wide".
   */
  shape?: "wide" | "square"
}

export type CompanyGroup = {
  category: string
  logos: CompanyLogo[]
}

export const COMPANY_GROUPS: CompanyGroup[] = [
  {
    category: "Multi-nationals",
    logos: [
      { name: "HSBC", src: "/images/logos/co-hsbc.svg", shape: "square" },
      { name: "Global Payments", src: "/images/logos/co-global-payments.svg" },
      { name: "Worldpay", src: "/images/logos/co-worldpay.svg" },
      { name: "Alstom", src: "/images/logos/co-alstom.svg" },
      { name: "Bombardier", src: "/images/logos/co-bombardier.svg" },
      { name: "Wipro", src: "/images/logos/co-wipro.svg", shape: "square" },
      { name: "Optum", src: "/images/logos/co-optum.svg" },
      {
        name: "Mercedes-Benz Global Services PH",
        src: "/images/logos/co-mercedes-benz.svg",
        shape: "square",
      },
      { name: "The Linde Group", src: "/images/logos/co-linde.webp" },
      { name: "Nestlé", src: "/images/logos/co-nestle.svg" },
      { name: "Knowles Electronics", src: "/images/logos/co-knowles.svg" },
      { name: "Teradyne", src: "/images/logos/co-teradyne.svg" },
      { name: "GlaxoSmithKline", src: "/images/logos/co-gsk.png" },
      {
        name: "bioMérieux",
        src: "/images/logos/co-biomerieux.svg",
        shape: "square",
      },
      { name: "Lear", src: "/images/logos/co-lear.svg" },
      { name: "Yara", src: "/images/logos/co-yara.svg", shape: "square" },
      { name: "NTT", src: "/images/logos/co-ntt.svg" },
      { name: "Unilever", src: "/images/logos/co-unilever.svg" },
      { name: "KMC Solutions", src: "/images/logos/co-kmc-solutions.png" },
      { name: "Kohler", src: "/images/logos/co-kohler.svg" },
      { name: "Timex", src: "/images/logos/co-timex.svg" },
      { name: "adidas", src: "/images/logos/co-adidas.svg", shape: "square" },
      {
        name: "Mactan-Cebu International Airport",
        src: "/images/logos/co-mactan-cebu-airport.svg",
      },
      { name: "Tsuneishi", src: "/images/logos/co-tsuneishi.svg" },
      { name: "NKC", src: "/images/logos/co-nkc.svg" },
      { name: "SDNI" },
      { name: "5ELK", src: "/images/logos/co-5elk.svg" },
      { name: "BSA Solutions" },
      { name: "Autoliv", src: "/images/logos/co-autoliv.svg" },
      { name: "Rise", src: "/images/logos/co-rise.svg" },
    ],
  },
  {
    category: "Mega-corporations",
    logos: [
      { name: "Petron", src: "/images/logos/co-petron.svg", shape: "square" },
      { name: "PLDT", src: "/images/logos/co-pldt.svg" },
      {
        name: "Petron Dealers Association (PETDA)",
        src: "/images/logos/co-petda.webp",
      },
      { name: "Aboitiz Power", src: "/images/logos/co-aboitizpower.svg" },
      { name: "Vivant", src: "/images/logos/co-vivant.svg" },
      {
        name: "Energy Development Corp (EDC)",
        src: "/images/logos/co-edc.png",
        shape: "square",
      },
      {
        name: "Jollibee Foods Corporation",
        src: "/images/logos/co-jollibee.svg",
      },
      { name: "Unilab", src: "/images/logos/co-unilab.svg" },
      { name: "Rose Pharmacy", src: "/images/logos/co-rose-pharmacy.png" },
      { name: "IPI", src: "/images/logos/co-ipi.png" },
      { name: "South Star Drug", src: "/images/logos/co-southstar-drug.webp" },
      { name: "Global Pacific", src: "/images/logos/co-global-pacific.png" },
      { name: "Toyota", src: "/images/logos/co-toyota.svg" },
      { name: "The Generics Pharmacy", src: "/images/logos/co-tgp.png" },
      { name: "Chong Hua Hospital", src: "/images/logos/co-chong-hua.webp" },
      {
        name: "Cebu Orthopedic Institute",
        src: "/images/logos/co-cebu-orthopedic.png",
      },
      { name: "T1 Project Services" },
      { name: "Run Time" },
      { name: "Athena", src: "/images/logos/co-athena.svg" },
      {
        name: "Metro Retail Group",
        src: "/images/logos/co-metro-retail.svg",
        shape: "square",
      },
      { name: "Hi-Precision Diagnostics" },
      { name: "Apptech", src: "/images/logos/co-apptech.webp" },
    ],
  },
  {
    category: "Finance",
    logos: [
      { name: "Sun Life Philippines", src: "/images/logos/co-sun-life.svg" },
      {
        name: "AXA Philippines",
        src: "/images/logos/co-axa.svg",
        shape: "square",
      },
      { name: "Manulife Philippines", src: "/images/logos/co-manulife.svg" },
      { name: "Pru Life UK", src: "/images/logos/co-pru-life-uk.webp" },
      { name: "AIA", src: "/images/logos/co-aia.svg" },
      { name: "FWD", src: "/images/logos/co-fwd.svg" },
      {
        name: "Maxicare · MaxiLife · MaxiHealth+",
        src: "/images/logos/co-maxicare.webp",
      },
      { name: "Insular Life", src: "/images/logos/co-insular-life.webp" },
      { name: "Pacific Prime", src: "/images/logos/co-pacific-prime.webp" },
      { name: "IMG", src: "/images/logos/co-img.svg" },
    ],
  },
  {
    category: "Real Estate Development",
    logos: [
      { name: "HT Land", src: "/images/logos/co-ht-land.webp" },
      {
        name: "Mont Property Ventures",
        src: "/images/logos/co-mont-property.webp",
      },
      {
        name: "Cebu Landmasters Inc",
        src: "/images/logos/co-cebu-landmasters.webp",
      },
      { name: "Apple One", src: "/images/logos/co-apple-one.webp" },
      { name: "Ayala Land", src: "/images/logos/co-ayala-land.svg" },
      { name: "Quirante Construction Corp." },
      { name: "Primary Structures Corporation" },
      { name: "Primary Homes", src: "/images/logos/co-primary-homes.webp" },
      {
        name: "Primary Group of Builders",
        src: "/images/logos/co-primary-group-of-builders.webp",
      },
      {
        name: "Concrete Solutions Inc.",
        src: "/images/logos/co-concrete-solutions.webp",
      },
      {
        name: "Sky Rise Realty",
        src: "/images/logos/co-sky-rise-realty.webp",
        shape: "square",
      },
    ],
  },
  {
    category: "Hotels & Resorts",
    logos: [
      {
        name: "Shangri-La's Mactan Island Resort & Spa",
        src: "/images/logos/co-shangri-la-mactan.svg",
      },
      {
        name: "Sheraton",
        src: "/images/logos/co-sheraton.svg",
      },
      {
        name: "Plantation Bay",
        src: "/images/logos/co-plantation-bay.webp",
      },
      {
        name: "Marco Polo Plaza Hotel",
        src: "/images/logos/co-marco-polo-plaza.svg",
      },
    ],
  },
  {
    category: "Food & Retail",
    logos: [
      { name: "Pages Holdings" },
      {
        name: "House of Lechon",
        src: "/images/logos/co-house-of-lechon.webp",
        shape: "square",
      },
      { name: "My Joy", src: "/images/logos/co-my-joy.webp", shape: "square" },
      { name: "Ayame", src: "/images/logos/co-ayame.webp" },
      {
        name: "Belcris Foods",
        src: "/images/logos/co-belcris-foods.webp",
        shape: "square",
      },
      { name: "Leylam", src: "/images/logos/co-leylam.webp", shape: "square" },
      {
        name: "Thinking Tools Inc.",
        src: "/images/logos/co-thinking-tools.webp",
      },
      {
        name: "Tom & Tom's Coffee",
        src: "/images/logos/co-tom-n-toms-coffee.webp",
        shape: "square",
      },
    ],
  },
  {
    category: "SMEs & Family Businesses",
    logos: [
      {
        name: "Altomed Pharmaceuticals",
        src: "/images/logos/co-altomed.webp",
      },
      {
        name: "Medirich Pharma",
        src: "/images/logos/co-medirich.webp",
        shape: "square",
      },
      {
        name: "Evercare Pharmacy",
        src: "/images/logos/co-evercare-pharmacy.webp",
      },
      {
        name: "Joyland Industrial Corporation",
        src: "/images/logos/co-joyland.webp",
      },
      {
        name: "Charlton Trade",
        src: "/images/logos/co-charlton-trade.webp",
      },
      { name: "Diagold", src: "/images/logos/co-diagold.webp" },
    ],
  },
]

/** Flat list, handy for a single continuous marquee row. */
export const ALL_COMPANIES: CompanyLogo[] = COMPANY_GROUPS.flatMap(
  (g) => g.logos
)
