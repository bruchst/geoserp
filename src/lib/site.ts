// Canonical production origin for the public site.
// The app is also reachable at geoserp.vercel.app; pointing every canonical
// here consolidates both hostnames onto the branded subdomain.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ??
  "https://geoserp.sbruch.com";
