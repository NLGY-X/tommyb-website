import type { MetadataRoute } from "next";
import { siteSettings } from "@/server/data";
import { siteUrl } from "@/server/db";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const pages = [
    { path: "", priority: 1, changeFrequency: "weekly" as const },
    { path: "/events", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/booking", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/music", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/bio", priority: 0.6, changeFrequency: "yearly" as const },
  ];
  if (siteSettings().twitch) {
    pages.push({ path: "/live", priority: 0.5, changeFrequency: "monthly" as const });
  }
  return pages.map((p) => ({ url: `${base}${p.path}`, priority: p.priority, changeFrequency: p.changeFrequency }));
}
