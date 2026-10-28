"use client"

import Image from "next/image"
import { CMS_MEDIA_HOST } from "@/lib/cms-media"
import { useState, type ComponentProps, type ReactNode } from "react"

// Missing and unavailable CMS media use the same fallback, never sample artwork.
export function CmsImage({
  src,
  alt,
  fallback,
  ...props
}: Omit<ComponentProps<typeof Image>, "src"> & {
  src?: string | null
  fallback?: ReactNode
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const supported =
    src &&
    ((src.startsWith("/") && !src.startsWith("//")) ||
      src.startsWith(`https://${CMS_MEDIA_HOST}/`))
  if (!supported || failedSrc === src) {
    return (
      <span
        role={alt ? "img" : undefined}
        aria-label={alt ? `${alt} (image unavailable)` : undefined}
        aria-hidden={alt ? undefined : true}
        className={`inline-flex items-center justify-center ${fallback === undefined ? "bg-brand" : ""} ${props.fill ? "absolute inset-0" : ""} ${props.className ?? ""}`}
        style={{
          backgroundImage:
            fallback === undefined
              ? "repeating-radial-gradient(circle at top right, transparent 0 140px, #ffffff0d 141px 142px, transparent 143px 240px)"
              : undefined,
          width: props.fill ? undefined : props.width,
          height: props.fill ? undefined : props.height,
          ...props.style,
        }}
      >
        {fallback}
      </span>
    )
  }
  return (
    <Image {...props} src={src} alt={alt} onError={() => setFailedSrc(src)} />
  )
}
