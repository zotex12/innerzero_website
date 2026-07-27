import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FeaturePage } from "@/components/sections/FeaturePage";
import { FEATURE_CATEGORIES, getCategory } from "@/lib/features";
import { createMetadata } from "@/lib/metadata";

// Static route. Every category is known at build time, so the whole
// cluster prerenders and there is no runtime lookup cost.
export const dynamicParams = false;

export function generateStaticParams() {
  return FEATURE_CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);

  if (!category) return {};

  return createMetadata({
    path: `/features/${slug}`,
    // Absolute title: these titles already carry their own qualifier and
    // the "%s | InnerZero: Private AI Assistant" template would push the
    // useful words past the SERP truncation point.
    title: { absolute: category.seoTitle },
    description: category.seoDescription,
    openGraph: {
      title: category.seoTitle,
      description: category.seoDescription,
      type: "article",
      // Only wide heroes become the social card. Social previews crop to
      // roughly 1.91:1, so a square-framed hero (the setup wizard shots)
      // would be cut to a strip of its middle. Those fall through to the
      // 1536x1024 default banner from DEFAULT_METADATA instead.
      ...(category.hero && category.hero.frame !== "square"
        ? { images: [{ url: category.hero.src }] }
        : {}),
    },
  });
}

export default async function FeatureCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategory(slug);

  if (!category) notFound();

  return <FeaturePage data={category} />;
}
