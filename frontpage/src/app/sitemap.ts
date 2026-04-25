import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

const ROUTES = ["", "/about", "/download", "/how-to-use", "/contact"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const ptEntries: MetadataRoute.Sitemap = ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified,
    changeFrequency: (route === "" ? "weekly" : "monthly") as "weekly" | "monthly",
    priority: route === "" ? 1.0 : 0.8,
  }));

  const enEntries: MetadataRoute.Sitemap = ROUTES.map((route) => ({
    url: `${SITE_URL}/en${route}`,
    lastModified,
    changeFrequency: (route === "" ? "weekly" : "monthly") as "weekly" | "monthly",
    priority: route === "" ? 0.9 : 0.7,
  }));

  return [...ptEntries, ...enEntries];
}
