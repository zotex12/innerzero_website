import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/metadata";
import { getAllPosts, getAllPostsForFeed } from "@/lib/blog";
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

// Date the /blog listing template last changed. Bump it only when the
// listing markup or behaviour changes (BlogGrid, blog/page.tsx), never per
// build. The /blog lastModified is the later of this and the newest
// published post date; see latestListingDate() below.
const BLOG_LISTING_MODIFIED = "2026-10-23";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// A real calendar day in YYYY-MM-DD form. The round trip rejects values like
// "2026-13-99" that match the pattern but would emit an invalid <lastmod>.
function isIsoDay(d: string): boolean {
  return (
    ISO_DATE.test(d) &&
    !Number.isNaN(Date.parse(d)) &&
    new Date(d).toISOString().slice(0, 10) === d
  );
}

// gray-matter parses an unquoted `date: 2026-11-03` as a Date, although
// BlogMeta types date as a string. Normalise both shapes to YYYY-MM-DD so a
// post with an unquoted date still moves /blog instead of being skipped.
function toIsoDay(raw: unknown): string {
  if (raw instanceof Date) {
    return Number.isNaN(raw.getTime()) ? "" : raw.toISOString().slice(0, 10);
  }
  return typeof raw === "string" ? raw : "";
}

// Newest post.date among published posts (getAllPostsForFeed already skips
// draft: true and future-dated posts). Uses date, not updated: the listing
// renders only date, title, description and tags, so an updated bump on an
// old post must not move /blog. YYYY-MM-DD strings compare correctly as
// strings.
function latestListingDate(): string {
  return getAllPostsForFeed().reduce((latest, p) => {
    const d = toIsoDay(p.date);
    return isIsoDay(d) && d > latest ? d : latest;
  }, BLOG_LISTING_MODIFIED);
}

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
  { path: "/", priority: 1.0, changeFrequency: "weekly", lastModified: "2026-10-06" },
  { path: "/features", priority: 0.8, changeFrequency: "monthly", lastModified: "2026-08-16" },
  { path: "/pricing", priority: 0.8, changeFrequency: "monthly" },
  { path: "/download", priority: 0.8, changeFrequency: "weekly", lastModified: "2026-10-06" },
  { path: "/models", priority: 0.8, changeFrequency: "monthly", lastModified: "2026-08-16" },
  // lastModified for /blog is derived inside sitemap() (latestListingDate).
  // A lastModified set on this row is ignored: bump BLOG_LISTING_MODIFIED.
  { path: "/blog", priority: 0.8, changeFrequency: "daily" },
  { path: "/what-is-local-ai", priority: 0.7, changeFrequency: "monthly", lastModified: "2026-10-23" },
  { path: "/changelog", priority: 0.6, changeFrequency: "weekly", lastModified: "2026-10-06" },
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
  const blogLastModified = latestListingDate();
  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((p) => {
    const lastModified = p.path === "/blog" ? blogLastModified : p.lastModified;
    return {
      url: absoluteUrl(p.path),
      changeFrequency: p.changeFrequency,
      priority: p.priority,
      ...(lastModified ? { lastModified } : {}),
    };
  });

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
