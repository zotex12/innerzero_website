"use client";

import { useState } from "react";
import Link from "next/link";
import type { BlogMeta } from "@/lib/blog";

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

  const visible = showAll ? filtered : filtered.slice(0, 8);

  return (
    <>
      {/* Tag filter bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
        <button
          onClick={() => { setActiveTag(null); setShowAll(false); }}
          className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
            activeTag === null
              ? "bg-accent-gold text-[#111] font-semibold"
              : "bg-bg-card text-text-secondary hover:text-text-primary border border-border-default"
          }`}
        >
          All
        </button>
        {tags.map(({ tag }) => (
          <button
            key={tag}
            onClick={() => { setActiveTag(tag); setShowAll(false); }}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              activeTag === tag
                ? "bg-accent-gold text-[#111] font-semibold"
                : "bg-bg-card text-text-secondary hover:text-text-primary border border-border-default"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Post grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {visible.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block rounded-xl border border-border-default bg-bg-card p-6 transition-all duration-200 hover:border-accent-gold hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(212,168,67,0.06)]"
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
              <span>{post.date}</span>
              <span>{post.readingTime}</span>
              <span>{post.author}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Show more */}
      {!showAll && filtered.length > 8 && (
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
