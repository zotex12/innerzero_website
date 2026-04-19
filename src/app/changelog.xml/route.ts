import { RELEASES, type Release } from "@/app/(marketing)/changelog/page";
import { SITE_URL, absoluteUrl, toRfc822, toRssCdata, xmlEscape } from "@/lib/feeds";

export const revalidate = 3600;

const FEED_TITLE = "InnerZero Changelog";
const FEED_DESCRIPTION = "Release notes and version history for InnerZero.";
const LANGUAGE = "en-gb";
const COPYRIGHT = "Copyright 2026 InnerZero";
const GENERATOR = "InnerZero";

function resolvePubDate(release: Release): Date {
  if (release.releaseDate) {
    const d = new Date(release.releaseDate);
    if (!Number.isNaN(d.getTime())) return d;
  }
  // Fallback: parse the displayed "Month YYYY" and use the first of that
  // month. If that also fails, use the Unix epoch so the item still
  // validates.
  const parsed = Date.parse(`1 ${release.date}`);
  if (!Number.isNaN(parsed)) return new Date(parsed);
  return new Date(0);
}

function buildDescription(release: Release): string {
  // Flatten all change entries into a single plain-text summary grouped
  // by label. Keeps feeds readable without raw HTML.
  return release.groups
    .map((group) => {
      const entries = group.entries.map((e) => `- ${e.text}`).join(" ");
      return `${group.label}: ${entries}`;
    })
    .join(" ");
}

export async function GET() {
  const lastBuildDate = toRfc822(new Date());

  const itemsXml = RELEASES.map((release) => {
    const pubDate = resolvePubDate(release);
    const anchorUrl = absoluteUrl(`/changelog#v${release.version}`);
    const description = buildDescription(release);
    return [
      "    <item>",
      `      <title>${xmlEscape(`InnerZero v${release.version}`)}</title>`,
      `      <link>${xmlEscape(anchorUrl)}</link>`,
      `      <guid isPermaLink="true">${xmlEscape(anchorUrl)}</guid>`,
      `      <pubDate>${toRfc822(pubDate)}</pubDate>`,
      `      <description>${toRssCdata(description)}</description>`,
      "    </item>",
    ].join("\n");
  }).join("\n");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${xmlEscape(FEED_TITLE)}</title>`,
    `    <link>${xmlEscape(SITE_URL + "/changelog")}</link>`,
    `    <description>${toRssCdata(FEED_DESCRIPTION)}</description>`,
    `    <language>${LANGUAGE}</language>`,
    `    <lastBuildDate>${lastBuildDate}</lastBuildDate>`,
    `    <copyright>${xmlEscape(COPYRIGHT)}</copyright>`,
    `    <generator>${xmlEscape(GENERATOR)}</generator>`,
    `    <atom:link href="${xmlEscape(SITE_URL + "/changelog.xml")}" rel="self" type="application/rss+xml" />`,
    "    <image>",
    `      <url>${xmlEscape(SITE_URL + "/images/logo.png")}</url>`,
    `      <title>${xmlEscape(FEED_TITLE)}</title>`,
    `      <link>${xmlEscape(SITE_URL + "/changelog")}</link>`,
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
