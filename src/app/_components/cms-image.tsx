"use client"

import Image from "next/image"
import { useState, type ComponentProps } from "react"

// Missing and unavailable CMS media use a neutral surface, never sample artwork.
export function CmsImage({
  src,
  alt,
  ...props
}: Omit<ComponentProps<typeof Image>, "src"> & { src?: string | null }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const supported =
    src &&
    ((src.startsWith("/") && !src.startsWith("//")) ||
      src.startsWith("https://adrian-ding-assets.iridel.com/"))
  if (!supported || failedSrc === src) {
    return (
      <span
        role="img"
        aria-label={alt ? `${alt} (image unavailable)` : "Image unavailable"}
        className={`inline-block bg-neutral-200 ${props.fill ? "absolute inset-0" : ""} ${props.className ?? ""}`}
        style={{
          width: props.fill ? undefined : props.width,
          height: props.fill ? undefined : props.height,
          ...props.style,
        }}
      />
    )
  }
  return (
    <Image {...props} src={src} alt={alt} onError={() => setFailedSrc(src)} />
  )
}
