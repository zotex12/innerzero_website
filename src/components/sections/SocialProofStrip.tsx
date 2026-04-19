import { cn } from "@/lib/utils";
import { getStatsPayload } from "@/lib/stats";
import { DiscordIcon } from "@/components/icons/DiscordIcon";

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

  // Build the visible items in left-to-right order. Each item declares
  // whether it should be preceded by a bullet separator. Plain-text
  // stats use bullets; the Discord pill is a distinct UI element so it
  // stands alone without a leading bullet (the pill border itself is
  // the separator).
  const items: { key: string; node: React.ReactNode; noBullet?: boolean }[] =
    [];

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
    noBullet: true,
    node: (
      <a
        href={DISCORD_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Join InnerZero Discord community"
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-border-default bg-bg-card/40 px-3 py-1.5",
          "text-sm font-medium text-text-secondary no-underline transition-colors duration-150",
          "hover:border-[#5865F2] hover:bg-[#5865F2]/10 hover:text-[#5865F2]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5865F2] focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary",
        )}
      >
        <DiscordIcon />
        Join our Discord
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
          {i > 0 && !item.noBullet && (
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
