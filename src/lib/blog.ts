import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  author: string;
  authorRole?: string;
  tags: string[];
  readingTime: string;
  featured: boolean;
  ogImage?: string;
  content: string;
}

export type BlogMeta = Omit<BlogPost, "content">;

export function getAllPosts(): BlogMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));
  const posts = files.map((file) => {
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
    const { data } = matter(raw);
    return {
      slug: data.slug || file.replace(/\.mdx$/, ""),
      title: data.title || "",
      description: data.description || "",
      date: data.date || "",
      updated: data.updated || undefined,
      author: data.author || "Louie",
      authorRole: data.authorRole || undefined,
      tags: data.tags || [],
      readingTime: data.readingTime || "",
      featured: data.featured || false,
      ogImage: data.ogImage || undefined,
    } satisfies BlogMeta;
  });
  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getPostBySlug(slug: string): BlogPost | null {
  if (!fs.existsSync(BLOG_DIR)) return null;
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));
  for (const file of files) {
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
    const { data, content } = matter(raw);
    const postSlug = data.slug || file.replace(/\.mdx$/, "");
    if (postSlug === slug) {
      return {
        slug: postSlug,
        title: data.title || "",
        description: data.description || "",
        date: data.date || "",
        updated: data.updated || undefined,
        author: data.author || "Louie",
        authorRole: data.authorRole || undefined,
        tags: data.tags || [],
        readingTime: data.readingTime || "",
        featured: data.featured || false,
        ogImage: data.ogImage || undefined,
        content,
      };
    }
  }
  return null;
}

export function getRelatedPosts(
  currentSlug: string,
  tags: string[],
  limit = 3
): BlogMeta[] {
  const all = getAllPosts().filter((p) => p.slug !== currentSlug);
  const scored = all.map((p) => ({
    post: p,
    score: p.tags.filter((t) => tags.includes(t)).length,
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.post);
}

/**
 * Feed-oriented variant of getAllPosts that includes the MDX body so the
 * RSS/JSON feed handlers can fall back to a body excerpt when a post has
 * no frontmatter description. Filters out future-dated entries (exclusive
 * of today's UTC date) and anything marked `draft: true` in frontmatter.
 * Sort order matches getAllPosts (newest date first).
 */
export function getAllPostsForFeed(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const now = Date.now();
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));
  const posts: BlogPost[] = [];
  for (const file of files) {
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
    const { data, content } = matter(raw);
    if (data.draft === true) continue;
    const postDate = data.date ? new Date(data.date) : null;
    if (postDate && !Number.isNaN(postDate.getTime()) && postDate.getTime() > now) {
      continue;
    }
    posts.push({
      slug: data.slug || file.replace(/\.mdx$/, ""),
      title: data.title || "",
      description: data.description || "",
      date: data.date || "",
      updated: data.updated || undefined,
      author: data.author || "Louie",
      authorRole: data.authorRole || undefined,
      tags: data.tags || [],
      readingTime: data.readingTime || "",
      featured: data.featured || false,
      ogImage: data.ogImage || undefined,
      content,
    });
  }
  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getAllTags(): { tag: string; count: number }[] {
  const posts = getAllPosts();
  const map = new Map<string, number>();
  for (const p of posts) {
    for (const t of p.tags) {
      map.set(t, (map.get(t) || 0) + 1);
    }
  }
  return Array.from(map.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}
