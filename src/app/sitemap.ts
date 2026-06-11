import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/metadata";
import { getAllPosts } from "@/lib/blog";

// Native App Router sitemap. Replaces the previous next-sitemap postbuild
// step, which only captured the two RSS route handlers (/feed.xml and
// /changelog.xml) and left every human page out of the sitemap.
//
// Auth routes (/login, /register, /forgot-password, /reset-password),
// the account area, the api routes, and the transient /download/thanks
// page are intentionally excluded. RSS feeds are discovered via the
// <link rel="alternate"> tags in the document head, not the sitemap.
//
// Keep STATIC_PATHS in sync with the indexable routes under src/app.

type ChangeFrequency = MetadataRoute.Sitemap[number]["changeFrequency"];

const STATIC_PATHS: {
  path: string;
  priority: number;
  changeFrequency: ChangeFrequency;
}[] = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/features", priority: 0.8, changeFrequency: "monthly" },
  { path: "/pricing", priority: 0.8, changeFrequency: "monthly" },
  { path: "/download", priority: 0.8, changeFrequency: "weekly" },
  { path: "/models", priority: 0.8, changeFrequency: "monthly" },
  { path: "/blog", priority: 0.8, changeFrequency: "daily" },
  { path: "/what-is-local-ai", priority: 0.7, changeFrequency: "monthly" },
  { path: "/changelog", priority: 0.6, changeFrequency: "weekly" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
  { path: "/waitlist", priority: 0.5, changeFrequency: "monthly" },
  { path: "/for/writers", priority: 0.6, changeFrequency: "monthly" },
  { path: "/for/students", priority: 0.6, changeFrequency: "monthly" },
  { path: "/for/developers", priority: 0.6, changeFrequency: "monthly" },
  { path: "/for/researchers", priority: 0.6, changeFrequency: "monthly" },
  { path: "/for/offline-work", priority: 0.6, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((p) => ({
    url: absoluteUrl(p.path),
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  const postEntries: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: post.updated || post.date || undefined,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...postEntries];
}
