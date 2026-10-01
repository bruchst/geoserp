import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// The simulator itself is client state on "/"; every other entry is a
// keyword landing page that embeds it with a preset market.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/german-serp-tracking`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
