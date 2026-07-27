import type { FeatureCategory } from "./types";

import { setup } from "./setup";
import { aiChat } from "./ai-chat";
import { voice } from "./voice";
import { memory } from "./memory";
import { languages } from "./languages";
import { tools } from "./tools";
import { knowledgePacks } from "./knowledge-packs";
import { specialists } from "./specialists";
import { proactive } from "./proactive";
import { actionHub } from "./action-hub";
import { screenAutomation } from "./screen-automation";
import { cloudAi } from "./cloud-ai";
import { customisation } from "./customisation";
import { unrestrictedMode } from "./unrestricted-mode";

// Registry order is the order categories appear on the /features hub.
// Sequenced roughly by the order a new user meets them: install and set
// up, then the everyday surfaces, then the optional and advanced areas.
export const FEATURE_CATEGORIES: FeatureCategory[] = [
  setup,
  aiChat,
  voice,
  memory,
  languages,
  tools,
  knowledgePacks,
  specialists,
  proactive,
  actionHub,
  screenAutomation,
  cloudAi,
  customisation,
  unrestrictedMode,
];

export function getCategory(slug: string): FeatureCategory | undefined {
  return FEATURE_CATEGORIES.find((c) => c.slug === slug);
}

export function getAllCategorySlugs(): string[] {
  return FEATURE_CATEGORIES.map((c) => c.slug);
}

// Inverse of the `guides` field: given a blog post slug, which feature
// pages point at it as a guide.
//
// Feature page -> guide is the link the cluster is built on. Without the
// return leg the cluster is one-directional, so a reader who lands on a
// guide from search has no route to the capability page and the feature
// page gets no link equity back. Deriving it here rather than hand-adding
// links inside the .mdx files means the two directions cannot drift, and
// no published post has to be edited to add one.
export function getCategoriesForGuide(blogSlug: string): FeatureCategory[] {
  return FEATURE_CATEGORIES.filter((c) =>
    c.guides.some((g) => g.slug === blogSlug),
  );
}

export type { FeatureCategory };
