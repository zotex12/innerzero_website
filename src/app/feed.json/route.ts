import { getAllPostsForFeed } from "@/lib/blog";
import { SITE_URL, absoluteUrl, buildExcerpt } from "@/lib/feeds";
import { applySecurityHeaders } from "@/lib/security-headers";
import { SITE_AUTHOR } from "@/lib/constants";

// JSON Feed 1.1 — https://jsonfeed.org/version/1.1
//
// Blog posts only. Changelog has its own RSS endpoint. Excerpt-only per
// the project rule; full post content requires visiting the site.
//
// Served at /feed.json (top-level, sibling to /feed.xml and /changelog.xml).
// It previously lived at /api/feed, but robots.txt Disallow: /api/* blocked
// it there while layout.tsx advertised it to crawlers, tripping the Google
// Search Console "Indexed, though blocked by robots.txt" warning. /api/feed
// now 308-redirects here (next.config.ts) so existing subscribers still work.

export const revalidate = 3600;

const FEED_TITLE = "InnerZero Blog";
const FEED_DESCRIPTION =
  "Posts from InnerZero on local-first AI, coding agents, and related work.";

interface JsonFeedAuthor {
  name: string;
  url?: string;
}

interface JsonFeedItem {
  id: string;
  url: string;
  title: string;
  content_text: string;
  date_published: string;
  tags?: string[];
  authors: JsonFeedAuthor[];
}

interface JsonFeed {
  version: string;
  title: string;
  description: string;
  home_page_url: string;
  feed_url: string;
  language: string;
  icon: string;
  items: JsonFeedItem[];
}

export async function GET() {
  const posts = getAllPostsForFeed();

  const items: JsonFeedItem[] = posts.map((post) => {
    const url = absoluteUrl(`/blog/${post.slug}`);
    const excerpt = buildExcerpt({
      description: post.description,
      content: post.content,
    });
    const datePublished = new Date(post.date);
    const iso = Number.isNaN(datePublished.getTime())
      ? new Date(0).toISOString()
      : datePublished.toISOString();

    const item: JsonFeedItem = {
      id: url,
      url,
      title: post.title,
      content_text: excerpt,
      date_published: iso,
      authors: [
        {
          // Point the feed author at the /about founder bio rather than the
          // site root, so the byline resolves to the same Person entity the
          // BlogPosting JSON-LD references.
          name: post.author || SITE_AUTHOR.name,
          url: absoluteUrl(SITE_AUTHOR.profilePath),
        },
      ],
    };

    if (Array.isArray(post.tags) && post.tags.length > 0) {
      const cleaned = post.tags.filter(
        (t) => typeof t === "string" && t.trim().length > 0
      );
      if (cleaned.length > 0) item.tags = cleaned;
    }

    return item;
  });

  const feed: JsonFeed = {
    version: "https://jsonfeed.org/version/1.1",
    title: FEED_TITLE,
    description: FEED_DESCRIPTION,
    home_page_url: `${SITE_URL}/blog`,
    feed_url: `${SITE_URL}/feed.json`,
    language: "en-gb",
    icon: `${SITE_URL}/images/logo.png`,
    items,
  };

  return applySecurityHeaders(
    new Response(JSON.stringify(feed, null, 2) + "\n", {
      status: 200,
      headers: {
        "Content-Type": "application/feed+json; charset=utf-8",
        "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      },
    })
  );
}
