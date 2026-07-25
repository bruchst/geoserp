import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Single-page tool: the simulator lives entirely on "/" (country and query are
// client state, not routes), so the sitemap has exactly one entry.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
