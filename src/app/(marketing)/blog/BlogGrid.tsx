"use client";

import { useState } from "react";
import Link from "next/link";
import type { BlogMeta } from "@/lib/blog";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { cn } from "@/lib/utils";

// Every card is server-rendered so crawlers reach every post from /blog;
// only visibility is client state (cards past this index stay hidden until Show more).
const INITIAL_VISIBLE = 8;

interface Props {
  posts: BlogMeta[];
  tags: { tag: string; count: number }[];
}

export function BlogGrid({ posts, tags }: Props) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const filtered = activeTag
    ? posts.filter((p) => p.tags.includes(activeTag))
    : posts;

  return (
    <>
      {/* Tag filter bar */}
      <div
        role="group"
        aria-label="Filter posts by tag"
        className="flex flex-wrap gap-2 mb-8"
      >
        <button
          onClick={() => { setActiveTag(null); setShowAll(false); }}
          aria-pressed={activeTag === null}
          className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary ${
            activeTag === null
              ? "bg-accent-gold-solid text-[#0a0a0f] font-semibold"
              : "bg-bg-card text-text-secondary hover:text-text-primary border border-border-default"
          }`}
        >
          All
        </button>
        {tags.map(({ tag }) => (
          <button
            key={tag}
            onClick={() => { setActiveTag(tag); setShowAll(false); }}
            aria-pressed={activeTag === tag}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary ${
              activeTag === tag
                ? "bg-accent-gold-solid text-[#0a0a0f] font-semibold"
                : "bg-bg-card text-text-secondary hover:text-text-primary border border-border-default"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Post grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {filtered.map((post, i) => {
          const collapsed = !showAll && i >= INITIAL_VISIBLE;
          return (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className={cn(
              "group rounded-xl border border-border-default bg-bg-card p-6 transition-all duration-200 hover:border-accent-gold hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(212,168,67,0.06)]",
              collapsed ? "hidden" : "block"
            )}
          >
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-accent-teal-muted px-2.5 py-0.5 text-[11px] font-medium text-accent-teal"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h3 className="text-base font-semibold text-text-primary transition-colors group-hover:text-accent-gold">
              {post.title}
            </h3>
            <p className="mt-2 text-sm text-text-secondary line-clamp-2">
              {post.description}
            </p>
            <div className="mt-4 flex items-center gap-3 text-xs text-text-muted">
              <TimeAgo date={post.date} />
              <span>{post.readingTime}</span>
              <span>{post.author}</span>
            </div>
          </Link>
          );
        })}
      </div>

      {/* Show more */}
      {!showAll && filtered.length > INITIAL_VISIBLE && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setShowAll(true)}
            className="rounded-lg border border-border-default bg-bg-card px-6 py-2 text-sm text-text-secondary transition-colors hover:text-text-primary hover:border-accent-gold cursor-pointer"
          >
            Show more
          </button>
        </div>
      )}
    </>
  );
}
