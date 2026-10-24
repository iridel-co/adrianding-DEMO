import { CmsImage } from "@/app/_components/cms-image"
import { getPublicClients } from "@/lib/public-api"

/** Compact client proof using only CMS featured clients. */
export async function TrustLogos({
  label = "Trusted by teams at",
  className = "",
}: {
  label?: string
  className?: string
}) {
  const clients = (await getPublicClients()).filter(
    (client) => client.isFeatured
  )
  if (!clients.length) return null
  return (
    <div className={className}>
      <p className="text-muted-foreground text-xs tracking-[0.14em] uppercase">
        {label}
      </p>
      <ul className="mt-5 flex flex-wrap items-center gap-x-9 gap-y-6">
        {clients.map((client) => (
          <li key={client.id}>
            {client.logo ? (
              <CmsImage
                src={client.logo.url}
                alt={client.logo.alt || client.name}
                height={40}
                width={140}
                style={{ width: "auto" }}
                className={`object-contain opacity-55 grayscale ${client.logo.width && client.logo.height && client.logo.width <= client.logo.height ? "h-7" : "h-5 sm:h-6"}`}
              />
            ) : (
              <span className="text-muted-foreground text-sm">
                {client.name}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
