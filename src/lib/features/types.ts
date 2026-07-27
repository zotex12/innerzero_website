// Shared types for the /features/<slug> category cluster.
//
// Structure rationale (see WEBCLAUDE.md "Route map"):
//   /features           hub, scannable, links out to every category
//   /features/<slug>    capability detail for one area (this type)
//   /blog/<slug>        the step-by-step tutorial
//
// The category page is deliberately NOT a tutorial. The site already has
// ~68 blog posts, ~12 of which are per-feature how-to guides. Duplicating
// those as feature pages would put two of our own URLs in competition for
// the same query. Category pages answer "what is this and is it for me";
// the `guides` field points at the post that answers "how do I do it".

export interface FeatureCapability {
  /** Stable anchor id. Kebab-case. Used for /features/<slug>#<id> deep links. */
  id: string;
  /** Card heading. */
  title: string;
  /**
   * Expanded description. Must go beyond the one-line hub card text:
   * the hub shows a teaser, this is the substance. 2 to 4 sentences.
   */
  body: string;
  /** Renders a "Coming soon" pill and excludes the item from claims of what ships today. */
  comingSoon?: boolean;
}

export interface FeatureGuide {
  /** Blog post slug, without the /blog/ prefix. Must exist in src/content/blog. */
  slug: string;
  /** Display title. Kept explicit so the card reads well out of context. */
  title: string;
  /** One line on what the guide covers, so the link is worth clicking. */
  blurb: string;
}

export interface FeatureFAQ {
  question: string;
  /** Plain text. Also emitted into FAQPage JSON-LD, so no markup. */
  answer: string;
}

export interface FeatureScreenshot {
  /** Path under /public. */
  src: string;
  /** Descriptive alt text. Never "screenshot of X". */
  alt: string;
  /** Caption shown under the frame. */
  caption: string;
  /**
   * Frame shape. Images render with object-contain, so a frame that does
   * not match the source letterboxes it and shrinks the readable area.
   *
   * "wide" (default) is 19:10 and suits full-window app captures, which
   * on this site all sit between 1.89 and 2.00.
   * "square" is 4:3 and suits the setup wizard captures, which are close
   * to 1:1 and become unreadably small inside a 19:10 frame.
   */
  frame?: "wide" | "square";
}

export interface FeatureStat {
  /** Large value, e.g. "871,000". */
  value: string;
  /** Label under the value, e.g. "Wikipedia articles offline". */
  label: string;
}

export interface FeatureCategory {
  /** URL segment. /features/<slug> */
  slug: string;
  /** Hub card + nav label. Short. */
  navLabel: string;
  /** Page h1. */
  h1: string;
  /** <title>. Written for search, not for the nav. */
  seoTitle: string;
  /** Meta description. 140 to 158 characters. */
  seoDescription: string;
  /** One-line teaser used on the /features hub card. */
  hubTeaser: string;
  /** Opening paragraph. Sets up the problem this area solves. */
  leadIn: string;
  /** Second paragraph. What InnerZero actually does about it. */
  leadOut: string;
  /** Optional hero image below the lead paragraphs. */
  hero?: FeatureScreenshot;
  /** Optional headline numbers rendered as a stat strip. */
  stats?: FeatureStat[];
  /** The capabilities in this area. Each becomes an anchored section. */
  capabilities: FeatureCapability[];
  /** Optional extra screenshots keyed to a capability id, rendered after it. */
  inlineScreenshots?: Record<string, FeatureScreenshot>;
  /** Hand-curated links to the real tutorials. Empty array is allowed. */
  guides: FeatureGuide[];
  /** 3 to 6 questions. Emitted as FAQPage JSON-LD. */
  faqs: FeatureFAQ[];
  /** Slugs of sibling categories to cross-link. 2 to 4. */
  related: string[];
  /** ISO date. */
  published: string;
  /** ISO date. */
  modified: string;
}
