import type { IncrementalCache } from "@opennextjs/aws/types/overrides.js"
import { defineCloudflareConfig } from "@opennextjs/cloudflare"
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache"

/**
 * Every page is prerendered at build time and nothing revalidates, so the
 * cache is read-only and served from the deployed static assets — no R2
 * bucket needed. If Phase 2 adds revalidation (e.g. CMS-driven updates),
 * switch back to the R2 incremental cache and add the bucket to
 * wrangler.jsonc. @see https://opennext.js.org/cloudflare/caching
 *
 * Workaround: Next 16.3 asks the cache for keys like
 * `/route-cache/APP_PAGE/<hash>/$/about`, but OpenNext (1.20.7) still saves
 * prerendered pages under the plain path (`/about`). Without this, every
 * lookup misses: pages re-render on each request and the OG image routes
 * crash (they need sharp and the local filesystem, neither of which exist
 * on Workers). This strips the prefix so lookups hit the saved files.
 * Remove it once OpenNext supports the new keys.
 */
const ROUTE_CACHE_PREFIX = /^\/route-cache\/[A-Z_]+\/[0-9a-f]+\/\$/

const incrementalCache: IncrementalCache = {
  name: staticAssetsIncrementalCache.name,
  get: (key, cacheType) =>
    staticAssetsIncrementalCache.get(
      key.replace(ROUTE_CACHE_PREFIX, ""),
      cacheType
    ),
  set: (key, value, cacheType) =>
    staticAssetsIncrementalCache.set(key, value, cacheType),
  delete: () => staticAssetsIncrementalCache.delete(),
}

export default defineCloudflareConfig({ incrementalCache })
