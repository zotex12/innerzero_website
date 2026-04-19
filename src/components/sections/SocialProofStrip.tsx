import { cn } from "@/lib/utils";
import { getStatsPayload } from "@/lib/stats";

const DISCORD_URL = "https://discord.gg/rn9SPXgThT";

interface SocialProofStripProps {
  className?: string;
}

export async function SocialProofStrip({ className }: SocialProofStripProps) {
  // Calls the shared stats helper directly rather than HTTP-fetching
  // /api/stats. Avoids a self-fetch race during prerender (live site
  // would not yet have the new endpoint) and shaves a network hop.
  const stats = await getStatsPayload();

  // Hide entirely if the API failed AND we have no real number to show.
  // Keeps the hero clean rather than rendering a bullet-only Discord row.
  if (!stats.ok && stats.total === 0) return null;

  // Build the visible items in left-to-right order. Spans hide themselves
  // when the underlying data is missing (rounded === null when downloads
  // are below the 100 threshold; latest_version === null on a fresh
  // repo).
  const items: { key: string; node: React.ReactNode }[] = [];

  if (stats.rounded) {
    items.push({
      key: "downloads",
      node: <span>{stats.rounded} downloads</span>,
    });
  }

  if (stats.latest_version) {
    items.push({
      key: "version",
      node: <span>{stats.latest_version} live</span>,
    });
  }

  items.push({
    key: "discord",
    node: (
      <a
        href={DISCORD_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Join InnerZero Discord community"
        className="inline-flex items-center gap-1 font-medium no-underline transition-colors hover:text-accent-teal"
      >
        Join our Discord <span aria-hidden="true">&rarr;</span>
      </a>
    ),
  });

  return (
    <div
      data-testid="social-proof-strip"
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-text-secondary",
        className,
      )}
    >
      {items.map((item, i) => (
        <span key={item.key} className="inline-flex items-center gap-x-5">
          {i > 0 && (
            <span
              aria-hidden="true"
              className="shrink-0 text-text-muted"
            >
              &bull;
            </span>
          )}
          {item.node}
        </span>
      ))}
    </div>
  );
}
