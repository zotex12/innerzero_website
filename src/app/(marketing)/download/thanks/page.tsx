import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { AutoDownload } from "@/components/sections/AutoDownload";
import { DiscordIcon } from "@/components/icons/DiscordIcon";
import { createMetadata } from "@/lib/metadata";

export const revalidate = 3600;

const REPO = "zotex12/innerzero-releases";
const RELEASES_URL = `https://api.github.com/repos/${REPO}/releases?per_page=100`;
const FALLBACK_LATEST = `https://github.com/${REPO}/releases/latest`;
const REQUEST_TIMEOUT_MS = 8000;

const GITHUB_REPO_URL = `https://github.com/${REPO}`;
const DISCORD_URL = "https://discord.gg/rn9SPXgThT";

export const metadata: Metadata = createMetadata({
  alternates: { canonical: "/download/thanks" },
  title: { absolute: "Downloading InnerZero..." },
  description:
    "Thanks for downloading InnerZero. Star us on GitHub and join the Discord while you wait.",
  openGraph: {
    title: "Downloading InnerZero...",
    description:
      "Thanks for downloading InnerZero. Star us on GitHub and join the Discord while you wait.",
    url: "https://innerzero.com/download/thanks",
  },
  // Transient thank-you / interstitial. Keep it out of the index but
  // let crawlers follow the outbound links to the actual download.
  robots: { index: false, follow: true },
});

interface GithubAsset {
  name?: string;
  browser_download_url?: string;
}

interface GithubRelease {
  tag_name?: string;
  draft?: boolean;
  assets?: GithubAsset[];
}

// Resolve a specific asset's download URL by exact filename match
// against the latest non-draft release. Falls back to the public
// "latest release" page on any error or miss so the user always
// gets somewhere useful, even if the GitHub API is down or the
// requested asset name is stale (e.g. a bookmarked link from a
// previous version).
async function resolveAssetUrl(assetName: string | undefined): Promise<string> {
  if (!assetName) return FALLBACK_LATEST;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(RELEASES_URL, {
      headers,
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    const releases = (await res.json()) as GithubRelease[];
    if (!Array.isArray(releases)) return FALLBACK_LATEST;

    for (const rel of releases) {
      if (rel.draft) continue;
      for (const asset of rel.assets ?? []) {
        if (asset.name === assetName && asset.browser_download_url) {
          return asset.browser_download_url;
        }
      }
    }
    return FALLBACK_LATEST;
  } catch (err) {
    console.warn(
      "[/download/thanks] resolveAssetUrl falling back:",
      err instanceof Error ? err.message : err,
    );
    return FALLBACK_LATEST;
  } finally {
    clearTimeout(timer);
  }
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12.02c0 5.1 3.29 9.42 7.86 10.95.58.1.79-.25.79-.56 0-.27-.01-1.18-.02-2.13-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.69 1.25 3.34.96.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.95 10.95 0 0 1 5.74 0c2.18-1.49 3.14-1.18 3.14-1.18.63 1.59.24 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.26 5.69.41.36.78 1.07.78 2.16 0 1.56-.02 2.81-.02 3.2 0 .31.21.67.8.55 4.56-1.53 7.84-5.85 7.84-10.94C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

export default async function DownloadThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ asset?: string }>;
}) {
  const params = await searchParams;
  const assetUrl = await resolveAssetUrl(params.asset);

  return (
    <div className="pt-28 pb-16 md:pt-36 md:pb-24">
      <Container>
        <div className="mx-auto max-w-2xl">
          {/* Status */}
          <header className="text-center">
            <div className="flex justify-center" aria-hidden="true">
              <span className="relative inline-flex h-3 w-3">
                <span className="absolute inset-0 animate-ping rounded-full bg-accent-gold opacity-60" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-accent-gold" />
              </span>
            </div>
            <h1 className="mt-5 text-3xl font-bold text-text-primary md:text-[2.5rem] md:leading-[1.2]">
              Downloading InnerZero...
            </h1>
            <p className="mt-4 text-lg text-text-secondary">
              Your download should start automatically.{" "}
              <a
                href={assetUrl}
                className="text-accent-gold transition-colors hover:text-accent-gold-hover"
              >
                If nothing happens, click here.
              </a>
            </p>
          </header>

          {/* Community prompts */}
          <section
            aria-labelledby="while-you-wait-heading"
            className="mt-14 md:mt-16"
          >
            <h2
              id="while-you-wait-heading"
              className="text-center text-xl font-semibold text-text-primary md:text-2xl"
            >
              While you wait
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col rounded-xl border border-border-default bg-bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-accent-gold hover:shadow-[0_12px_32px_-8px_rgba(212,168,67,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-gold focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary"
              >
                <GithubIcon className="h-7 w-7 text-text-primary" />
                <h3 className="mt-3 text-base font-semibold text-text-primary">
                  Star us on GitHub
                </h3>
                <p className="mt-1 text-sm text-text-secondary">
                  Helps more people discover InnerZero.
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent-gold">
                  <span aria-hidden="true">&#x2B50;</span> Star on GitHub
                </span>
              </a>

              <a
                href={DISCORD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col rounded-xl border border-border-default bg-bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[#5865F2] hover:shadow-[0_12px_32px_-8px_rgba(88,101,242,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5865F2] focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary"
              >
                <DiscordIcon className="h-7 w-7 text-text-primary transition-colors group-hover:text-[#5865F2]" />
                <h3 className="mt-3 text-base font-semibold text-text-primary">
                  Join our Discord
                </h3>
                <p className="mt-1 text-sm text-text-secondary">
                  Get help, share feedback, meet other users.
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors group-hover:text-[#5865F2]">
                  Join Discord
                </span>
              </a>
            </div>
          </section>

          {/* Footer note */}
          <p className="mt-12 text-center text-sm text-text-muted md:mt-16">
            First time? The setup wizard will walk you through everything.
            Questions? Check the{" "}
            <Link
              href="/#faq"
              className="text-text-secondary underline-offset-4 transition-colors hover:text-accent-gold hover:underline"
            >
              FAQ
            </Link>{" "}
            or email{" "}
            <a
              href="mailto:help@innerzero.com"
              className="text-text-secondary underline-offset-4 transition-colors hover:text-accent-gold hover:underline"
            >
              help@innerzero.com
            </a>
            .
          </p>
        </div>
      </Container>

      <AutoDownload assetUrl={assetUrl} />
    </div>
  );
}
