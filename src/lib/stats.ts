// Shared download-stats fetcher. Used by /api/stats (the public JSON
// endpoint) and by the homepage <SocialProofStrip /> server component.
// Calling this directly in the strip avoids an HTTP self-fetch during
// prerender, which would otherwise hit the LIVE site's /api/stats and
// be circular while a new deploy is in flight.

const REPO = "zotex12/innerzero-releases";
const RELEASES_URL = `https://api.github.com/repos/${REPO}/releases?per_page=100`;
const REQUEST_TIMEOUT_MS = 8000;
const REVALIDATE_SECONDS = 3600;

export interface StatsResponse {
  ok: boolean;
  total: number;
  rounded: string | null;
  release_count: number;
  latest_version: string | null;
  latest_published_at: string | null;
}

interface GithubAsset {
  download_count?: number;
}

interface GithubRelease {
  tag_name?: string;
  published_at?: string | null;
  draft?: boolean;
  prerelease?: boolean;
  assets?: GithubAsset[];
}

const EMPTY: StatsResponse = {
  ok: false,
  total: 0,
  rounded: null,
  release_count: 0,
  latest_version: null,
  latest_published_at: null,
};

function roundDownloads(total: number): string | null {
  if (total < 100) return null;
  if (total < 10_000) return `${Math.floor(total / 100) * 100}+`;
  return `${Math.floor(total / 1000)}K+`;
}

async function fetchReleases(): Promise<GithubRelease[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn(
      "[stats] GITHUB_TOKEN missing; falling back to unauthenticated GitHub API (60/hr per IP).",
    );
  }

  try {
    const res = await fetch(RELEASES_URL, {
      headers,
      signal: controller.signal,
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) {
      throw new Error(`GitHub API returned ${res.status}`);
    }
    const data = (await res.json()) as GithubRelease[];
    return Array.isArray(data) ? data : [];
  } finally {
    clearTimeout(timer);
  }
}

function summarise(releases: GithubRelease[]): StatsResponse {
  let total = 0;
  let releaseCount = 0;
  let latestPublishedAt: string | null = null;
  let latestVersion: string | null = null;
  let latestEpoch = -Infinity;

  for (const rel of releases) {
    if (rel.draft) continue;
    releaseCount++;
    for (const asset of rel.assets ?? []) {
      const n = asset.download_count;
      if (typeof n === "number" && Number.isFinite(n)) total += n;
    }
    if (rel.published_at) {
      const epoch = Date.parse(rel.published_at);
      if (!Number.isNaN(epoch) && epoch > latestEpoch) {
        latestEpoch = epoch;
        latestPublishedAt = rel.published_at;
        latestVersion = rel.tag_name ?? null;
      }
    }
  }

  return {
    ok: true,
    total,
    rounded: roundDownloads(total),
    release_count: releaseCount,
    latest_version: latestVersion,
    latest_published_at: latestPublishedAt,
  };
}

// Public entry point. Always resolves; never throws. On any failure
// returns the EMPTY payload with ok:false so callers can render a
// graceful no-op state.
export async function getStatsPayload(): Promise<StatsResponse> {
  try {
    const releases = await fetchReleases();
    return summarise(releases);
  } catch (err) {
    console.warn(
      "[stats] Falling back to empty payload:",
      err instanceof Error ? err.message : err,
    );
    return EMPTY;
  }
}
