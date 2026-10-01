/**
 * Base URL of the current deployment, used for metadata (Open Graph, canonical
 * links), robots.txt and sitemap.xml — never a hard-coded production domain.
 *
 * Resolution order:
 * 1. NEXT_PUBLIC_SITE_URL — set this to your own domain (see .env.example).
 * 2. Vercel system env vars — the production domain on production deployments,
 *    otherwise the unique URL of the preview deployment itself.
 * 3. http://localhost:<PORT> for local development.
 */
export function getSiteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return new URL(explicit);

  const vercelHost =
    process.env.VERCEL_ENV === "production"
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL
      : process.env.VERCEL_URL;
  if (vercelHost) return new URL(`https://${vercelHost}`);

  return new URL(`http://localhost:${process.env.PORT ?? 3000}`);
}
