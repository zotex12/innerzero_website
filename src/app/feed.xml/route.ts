import { getAllPostsForFeed } from "@/lib/blog";
import {
  SITE_URL,
  absoluteUrl,
  buildExcerpt,
  toRfc822,
  toRssCdata,
  xmlEscape,
} from "@/lib/feeds";

// Revalidate the feed hourly. Blog content is static at build time; this
// lets newly-published posts appear in the feed within an hour of deploy
// without requiring a full rebuild.
export const revalidate = 3600;

const FEED_TITLE = "InnerZero Blog";
const FEED_DESCRIPTION =
  "Posts from InnerZero on local-first AI, coding agents, and related work.";
const LANGUAGE = "en-gb";
const COPYRIGHT = "Copyright 2026 InnerZero";
const GENERATOR = "InnerZero";

export async function GET() {
  const posts = getAllPostsForFeed();

  const lastBuildDate = toRfc822(new Date());

  const itemsXml = posts
    .map((post) => {
      const url = absoluteUrl(`/blog/${post.slug}`);
      const excerpt = buildExcerpt({
        description: post.description,
        content: post.content,
      });
      const categories = Array.isArray(post.tags)
        ? post.tags
            .filter((t) => typeof t === "string" && t.trim().length > 0)
            .map((t) => `      <category>${xmlEscape(t)}</category>`)
            .join("\n")
        : "";

      return [
        "    <item>",
        `      <title>${xmlEscape(post.title)}</title>`,
        `      <link>${xmlEscape(url)}</link>`,
        `      <guid isPermaLink="true">${xmlEscape(url)}</guid>`,
        `      <pubDate>${toRfc822(post.date)}</pubDate>`,
        `      <description>${toRssCdata(excerpt)}</description>`,
        categories || null,
        "    </item>",
      ]
        .filter((line) => line !== null)
        .join("\n");
    })
    .join("\n");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${xmlEscape(FEED_TITLE)}</title>`,
    `    <link>${xmlEscape(SITE_URL + "/blog")}</link>`,
    `    <description>${toRssCdata(FEED_DESCRIPTION)}</description>`,
    `    <language>${LANGUAGE}</language>`,
    `    <lastBuildDate>${lastBuildDate}</lastBuildDate>`,
    `    <copyright>${xmlEscape(COPYRIGHT)}</copyright>`,
    `    <generator>${xmlEscape(GENERATOR)}</generator>`,
    `    <atom:link href="${xmlEscape(SITE_URL + "/feed.xml")}" rel="self" type="application/rss+xml" />`,
    "    <image>",
    `      <url>${xmlEscape(SITE_URL + "/images/logo.png")}</url>`,
    `      <title>${xmlEscape(FEED_TITLE)}</title>`,
    `      <link>${xmlEscape(SITE_URL + "/blog")}</link>`,
    "    </image>",
    itemsXml,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
