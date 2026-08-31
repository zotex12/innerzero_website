import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/metadata";
import { getAllPosts } from "@/lib/blog";
import { FEATURE_CATEGORIES } from "@/lib/features";

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
  // Set when the page's content is meaningfully revised (release updates,
  // copy corrections). Static pages previously emitted no lastModified at
  // all, so a release day changed /download and /changelog without
  // signalling anything to crawlers, while blog and feature entries did.
  lastModified?: string;
}[] = [
  { path: "/", priority: 1.0, changeFrequency: "weekly", lastModified: "2026-08-28" },
  { path: "/features", priority: 0.8, changeFrequency: "monthly", lastModified: "2026-08-16" },
  { path: "/pricing", priority: 0.8, changeFrequency: "monthly" },
  { path: "/download", priority: 0.8, changeFrequency: "weekly", lastModified: "2026-08-28" },
  { path: "/models", priority: 0.8, changeFrequency: "monthly", lastModified: "2026-08-16" },
  { path: "/blog", priority: 0.8, changeFrequency: "daily" },
  { path: "/what-is-local-ai", priority: 0.7, changeFrequency: "monthly", lastModified: "2026-08-16" },
  { path: "/changelog", priority: 0.6, changeFrequency: "weekly", lastModified: "2026-08-28" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
  { path: "/for/writers", priority: 0.6, changeFrequency: "monthly" },
  { path: "/for/students", priority: 0.6, changeFrequency: "monthly" },
  { path: "/for/developers", priority: 0.6, changeFrequency: "monthly", lastModified: "2026-08-16" },
  { path: "/for/researchers", priority: 0.6, changeFrequency: "monthly", lastModified: "2026-08-16" },
  { path: "/for/offline-work", priority: 0.6, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly", lastModified: "2026-08-26" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly", lastModified: "2026-08-28" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((p) => ({
    url: absoluteUrl(p.path),
    changeFrequency: p.changeFrequency,
    priority: p.priority,
    ...(p.lastModified ? { lastModified: p.lastModified } : {}),
  }));

  // Feature category pages. Derived from the registry rather than listed
  // by hand so a new category cannot be added without reaching the
  // sitemap. Priority sits just under /features (0.8) because the hub is
  // the cluster's entry point and each category is a spoke off it.
  const featureEntries: MetadataRoute.Sitemap = FEATURE_CATEGORIES.map((c) => ({
    url: absoluteUrl(`/features/${c.slug}`),
    lastModified: c.modified,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const postEntries: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: post.updated || post.date || undefined,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...featureEntries, ...postEntries];
}
