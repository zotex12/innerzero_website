"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Check, Heart, Coffee, ExternalLink, ChevronDown, Zap, Info } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PRICING_FREE, SUPPORTER, BUSINESS_LICENCE, FAQ_DATA, CLOUD_FAQ, type FAQItem } from "@/lib/constants";
import { BusinessLicenceButton } from "@/components/sections/BusinessLicenceButton";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface CloudPlan {
  id: string;
  name: string;
  plan_type: "subscription" | "payg";
  usage_amount: number;
  price_pence: number;
  tier_access: string[];
  sort_order: number;
}

interface ModelTier {
  id: string;
  name: string;
  display_name: string;
  usage_multiplier: number;
  sort_order: number;
}

interface PricingSectionProps {
  className?: string;
}


function formatPence(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

function formatUsage(amount: number): string {
  return amount.toLocaleString("en-GB");
}

function FAQAccordionItem({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border-default">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left cursor-pointer"
        aria-expanded={open}
      >
        <span className="pr-4 text-sm font-medium text-text-primary md:text-base">
          {item.question}
        </span>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-text-muted transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      <div className={cn("faq-content", open && "open")}>
        <div className="overflow-hidden">
          <p className="pb-4 text-sm leading-relaxed text-text-secondary">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

function CloudCheckoutButton({
  planId,
  label,
  variant,
}: {
  planId: string;
  label: string;
  variant: "primary" | "secondary";
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    setLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login?redirect=/pricing");
        return;
      }

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: planId }),
      });

      const data = (await res.json()) as { url?: string; message?: string };

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.message ?? "Something went wrong. Please try again.");
        setLoading(false);
      }
    } catch {
      alert("Failed to start checkout. Please try again.");
      setLoading(false);
    }
  }

  const isPrimary = variant === "primary";

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-[15px] font-medium transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer",
        isPrimary
          ? "bg-accent-gold text-[#0a0a0f] hover:bg-accent-gold-hover"
          : "border border-border-default text-text-primary hover:border-accent-gold hover:text-accent-gold"
      )}
    >
      {loading ? "Processing..." : label}
    </button>
  );
}

export function PricingSection({ className }: PricingSectionProps) {
  const [plans, setPlans] = useState<CloudPlan[]>([]);
  const [modelTiers, setModelTiers] = useState<ModelTier[]>([]);
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [usageInfoOpen, setUsageInfoOpen] = useState(false);
  // One-shot guard: once we've resolved the initial hash (or decided there
  // isn't one), don't re-scroll on later re-renders.
  const hashScrollDone = useRef(false);

  useEffect(() => {
    fetch("/api/cloud/plans")
      .then((res) => res.json())
      .then((data: { plans: CloudPlan[]; model_tiers: ModelTier[] }) => {
        setPlans(data.plans ?? []);
        setModelTiers(data.model_tiers ?? []);
      })
      .catch(() => {
        // Silently fail; static fallback from constants will show
      });

    // Check if user is logged in and has a plan
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from("profiles")
          .select("plan")
          .eq("id", user.id)
          .single()
          .then(({ data }) => {
            if (data?.plan) setUserPlan(data.plan);
          });
      }
    });
  }, []);

  // Hash-anchor scroll. The PAYG section is conditionally rendered after the
  // cloud plans fetch resolves, so /pricing#pay-as-you-go on hard refresh
  // hits a DOM that doesn't have the target yet — the browser's native hash
  // scroll is a no-op and the user lands at the top. We re-run scrollIntoView
  // one frame after plans land so the element exists by then.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (hashScrollDone.current) return;
    if (plans.length === 0) return;

    const hash = window.location.hash;
    if (!hash) {
      hashScrollDone.current = true;
      return;
    }

    const id = hash.slice(1);
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      hashScrollDone.current = true;
    });
  }, [plans.length]);

  const subscriptionPlans = plans.filter((p) => p.plan_type === "subscription");
  const paygPlans = plans.filter((p) => p.plan_type === "payg");

  // Determine which subscription is "best value" (middle plan by sort_order)
  const bestValueId =
    subscriptionPlans.length >= 2
      ? subscriptionPlans[Math.floor(subscriptionPlans.length / 2)]?.id
      : null;

  function getPlanBadge(plan: CloudPlan) {
    if (!userPlan || userPlan === "free") return null;
    if (plan.id === userPlan) return "Current Plan";
    // Compare by sort_order for upgrade/downgrade
    const currentPlan = subscriptionPlans.find((p) => p.id === userPlan);
    if (!currentPlan) return null;
    if (plan.sort_order > currentPlan.sort_order) return "Upgrade";
    if (plan.sort_order < currentPlan.sort_order) return "Downgrade";
    return null;
  }

  function getCtaLabel(plan: CloudPlan) {
    const badge = getPlanBadge(plan);
    if (badge === "Current Plan") return "Current Plan";
    if (badge === "Upgrade") return "Upgrade";
    if (badge === "Downgrade") return "Downgrade";
    return "Get Started";
  }

  return (
    <div className={cn("", className)}>
      {/* Section A: Free Local */}
      <section className="py-12 md:py-20">
        <Container>
          <ScrollReveal>
            <div className="mx-auto max-w-xl">
              <div className="relative rounded-xl border-2 border-accent-teal bg-bg-card p-8 text-center shadow-[0_0_30px_rgba(0,201,183,0.1)]">
                <Badge variant="teal" className="mb-4">
                  The full product
                </Badge>

                <h3 className="text-2xl font-bold text-text-primary">
                  {PRICING_FREE.planName}
                </h3>

                <div className="mt-4">
                  <span className="text-4xl font-bold text-text-primary">
                    {PRICING_FREE.price}
                  </span>
                </div>

                <p className="mt-4 text-sm text-text-secondary">
                  {PRICING_FREE.subtitle}
                </p>

                <ul className="mt-6 flex flex-col gap-3 text-left">
                  {PRICING_FREE.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-sm text-text-secondary"
                    >
                      <Check className="h-4 w-4 shrink-0 text-success" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Button href={PRICING_FREE.ctaHref} className="w-full">
                    {PRICING_FREE.cta}
                  </Button>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </Container>
      </section>

      {/* Section B: Business Licence */}
      <section className="bg-bg-secondary py-12 md:py-20">
        <Container>
          <ScrollReveal>
            <div className="mx-auto max-w-xl">
              <div className="rounded-xl border-2 border-accent-gold bg-bg-card p-8 text-center shadow-[0_0_30px_rgba(212,168,67,0.08)]">
                <h3 className="text-2xl font-bold text-text-primary">
                  {BUSINESS_LICENCE.planName}
                </h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-text-primary">
                    {BUSINESS_LICENCE.price}
                  </span>
                  <span className="text-text-secondary">{BUSINESS_LICENCE.period} per user</span>
                </div>
                <p className="mt-4 text-sm text-text-secondary">
                  Required for commercial use of InnerZero. One seat per user.
                </p>
                <ul className="mt-6 flex flex-col gap-3 text-left">
                  <li className="flex items-center gap-3 text-sm text-text-secondary"><Check className="h-4 w-4 shrink-0 text-success" />Use InnerZero at work</li>
                  <li className="flex items-center gap-3 text-sm text-text-secondary"><Check className="h-4 w-4 shrink-0 text-success" />Commercial projects and client work</li>
                  <li className="flex items-center gap-3 text-sm text-text-secondary"><Check className="h-4 w-4 shrink-0 text-success" />Sole traders, freelancers, and companies</li>
                  <li className="flex items-center gap-3 text-sm text-text-secondary"><Check className="h-4 w-4 shrink-0 text-success" />Annual licence, cancel anytime</li>
                  <li className="flex items-center gap-3 text-sm text-text-secondary"><Check className="h-4 w-4 shrink-0 text-success" />Same free app, no extra features</li>
                </ul>
                <div className="mt-8">
                  <BusinessLicenceButton />
                </div>
              </div>
              <p className="mt-4 text-center text-sm text-text-muted">
                Educational institutions, charities, and non-profits are exempt.
              </p>
            </div>
          </ScrollReveal>
        </Container>
      </section>

      {/* Section C: Cloud AI Subscriptions */}
      {/* scroll-mt-20 offsets the fixed h-16 header + a little breathing room
          so deep-link hash anchors don't land under the nav. */}
      <section id="cloud-ai" className="scroll-mt-20 py-12 md:py-20">
        <Container>
          <ScrollReveal>
            <div className="mx-auto max-w-3xl text-center mb-10">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-accent-gold" />
                <h2 className="text-2xl font-bold text-text-primary md:text-[2rem]">
                  Cloud AI
                </h2>
              </div>
              <p className="text-text-secondary">
                Optional cloud AI for faster responses and premium models, with built-in privacy controls.
              </p>
              <p className="mt-2 text-sm text-text-muted">
                Or add your own API keys for free, with zero markup.
              </p>
            </div>

            {subscriptionPlans.length > 0 ? (
              <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
                {subscriptionPlans.map((plan) => {
                  const isBestValue = plan.id === bestValueId;
                  const planBadge = getPlanBadge(plan);
                  const isCurrentPlan = planBadge === "Current Plan";

                  return (
                    <div
                      key={plan.id}
                      className={cn(
                        "relative flex flex-col rounded-xl border bg-bg-card p-6 text-center transition-all duration-150 hover:-translate-y-[2px]",
                        isBestValue
                          ? "border-2 border-accent-gold shadow-[0_0_20px_rgba(212,168,67,0.08)]"
                          : "border-border-default hover:border-border-hover"
                      )}
                    >
                      {isBestValue && (
                        <Badge variant="gold" className="mb-3">
                          Best Value
                        </Badge>
                      )}
                      {planBadge && (
                        <Badge
                          variant={isCurrentPlan ? "teal" : "default"}
                          className="mb-3"
                        >
                          {planBadge}
                        </Badge>
                      )}

                      <h3 className="text-lg font-semibold text-text-primary">
                        {plan.name}
                      </h3>

                      <div className="mt-3">
                        <span className="text-3xl font-bold text-text-primary">
                          {formatPence(plan.price_pence)}
                        </span>
                        <span className="text-text-secondary">/mo</span>
                      </div>

                      <p className="mt-2 text-sm text-text-muted">
                        {formatUsage(plan.usage_amount)} usage/month
                      </p>

                      <ul className="mt-5 flex flex-col gap-2 text-left">
                        {plan.tier_access.map((tier) => {
                          const tierInfo = modelTiers.find((t) => t.name === tier);
                          return (
                            <li
                              key={tier}
                              className="flex items-center gap-2 text-sm text-text-secondary"
                            >
                              <Check className="h-3.5 w-3.5 shrink-0 text-success" />
                              {tierInfo?.display_name ?? tier} models
                            </li>
                          );
                        })}
                      </ul>

                      <div className="mt-auto pt-6">
                        {isCurrentPlan ? (
                          <span className="inline-flex w-full items-center justify-center rounded-lg border border-accent-teal px-6 py-3 text-[15px] font-medium text-accent-teal">
                            Current Plan
                          </span>
                        ) : (
                          <CloudCheckoutButton
                            planId={plan.id}
                            label={getCtaLabel(plan)}
                            variant={isBestValue ? "primary" : "secondary"}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Fallback while loading */
              <div className="mx-auto max-w-4xl text-center py-8">
                <p className="text-text-muted text-sm">Loading cloud plans...</p>
              </div>
            )}

            <div className="mx-auto max-w-3xl mt-8 text-center space-y-2">
              <p className="text-sm text-text-secondary">
                Managed plans include DeepSeek, Google Gemini, and Anthropic Claude. Model selection is automatic based on your chosen tier.
              </p>
              <p className="text-sm text-text-muted">
                Want more providers? Add your own API keys for free. Supports OpenAI, xAI Grok, Qwen, Kimi, and all managed providers. Zero markup.
              </p>
            </div>
          </ScrollReveal>
        </Container>
      </section>

      {/* Section D: Pay As You Go */}
      {paygPlans.length > 0 && (
        <section id="pay-as-you-go" className="scroll-mt-20 bg-bg-secondary py-12 md:py-20">
          <Container>
            <ScrollReveal>
              <div className="mx-auto max-w-3xl text-center mb-10">
                <h2 className="text-2xl font-bold text-text-primary md:text-[2rem]">
                  Pay As You Go
                </h2>
                <p className="mt-4 text-text-secondary">
                  Top up when you need it. No subscription required.
                </p>
              </div>

              <div
                className={cn(
                  "mx-auto grid max-w-4xl grid-cols-1 gap-6",
                  paygPlans.length === 2
                    ? "md:grid-cols-2 max-w-2xl"
                    : "md:grid-cols-3"
                )}
              >
                {paygPlans.map((pack) => {
                  const perUnit = pack.price_pence / pack.usage_amount;

                  return (
                    <div
                      key={pack.id}
                      className="rounded-xl border border-border-default bg-bg-card p-6 text-center transition-all duration-150 hover:-translate-y-[2px] hover:border-border-hover"
                    >
                      <h3 className="text-lg font-semibold text-text-primary">
                        {formatUsage(pack.usage_amount)} Usage
                      </h3>

                      <div className="mt-3">
                        <span className="text-3xl font-bold text-text-primary">
                          {formatPence(pack.price_pence)}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-text-muted">
                        {perUnit.toFixed(1)}p per usage
                      </p>

                      <p className="mt-3 text-xs text-text-muted">
                        No subscription required. Credits expire 1 year after purchase.
                      </p>

                      <div className="mt-6">
                        <CloudCheckoutButton
                          planId={pack.id}
                          label="Buy"
                          variant="secondary"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="mx-auto max-w-3xl mt-6 text-center text-sm text-text-muted">
                PAYG credits use the same managed providers as subscription plans.
              </p>
            </ScrollReveal>
          </Container>
        </section>
      )}

      {/* Usage Multiplier Info Box */}
      {modelTiers.length > 0 && (
        <section className="py-8 md:py-12">
          <Container>
            <div className="mx-auto max-w-2xl">
              <button
                onClick={() => setUsageInfoOpen(!usageInfoOpen)}
                className="flex w-full items-center justify-between rounded-xl border border-border-default bg-bg-card px-6 py-4 text-left transition-colors hover:border-border-hover cursor-pointer"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                  <Info className="h-4 w-4 text-accent-teal" />
                  How usage works
                </span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-text-muted transition-transform duration-200",
                    usageInfoOpen && "rotate-180"
                  )}
                />
              </button>
              <div className={cn("faq-content", usageInfoOpen && "open")}>
                <div className="overflow-hidden">
                  <div className="px-6 pt-3 pb-5">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {modelTiers.map((tier) => (
                        <div
                          key={tier.id}
                          className="rounded-lg border border-border-default bg-bg-secondary p-3 text-center"
                        >
                          <p className="text-xs font-medium text-text-muted uppercase tracking-wide">
                            {tier.display_name}
                          </p>
                          <p className="mt-1 text-lg font-bold text-text-primary">
                            {tier.usage_multiplier}
                          </p>
                          <p className="text-xs text-text-muted">per response</p>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-text-muted text-center">
                      Auto mode picks the best model for each request and uses the lowest multiplier.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* Section E: Support InnerZero */}
      <section className="py-12 md:py-20">
        <Container>
          <ScrollReveal>
            <div className="mx-auto max-w-3xl text-center mb-10">
              <h2 className="text-2xl font-bold text-text-primary md:text-[2rem]">
                Help build the future of private AI.
              </h2>
            </div>

            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-6 md:grid-cols-2">
              {/* Supporter card */}
              <div className="rounded-xl border border-border-default bg-bg-card p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="h-5 w-5 text-accent-gold" />
                  <h3 className="text-lg font-semibold text-text-primary">
                    Supporter
                  </h3>
                </div>
                <div className="mb-3">
                  <span className="text-2xl font-bold text-text-primary">
                    {SUPPORTER.price}
                  </span>
                  <span className="text-text-secondary">{SUPPORTER.period}</span>
                </div>
                <p className="text-sm text-text-secondary mb-6">
                  {SUPPORTER.description}
                </p>
                <a
                  href={SUPPORTER.ctaHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent-gold px-6 py-3 text-[15px] font-medium text-[#0a0a0f] transition-all duration-150 hover:bg-accent-gold-hover"
                >
                  {SUPPORTER.cta}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              {/* Donation card */}
              <div className="rounded-xl border border-border-default bg-bg-card p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Coffee className="h-5 w-5 text-accent-gold" />
                  <h3 className="text-lg font-semibold text-text-primary">
                    One-off Donation
                  </h3>
                </div>
                <p className="text-sm text-text-secondary mb-6 mt-3">
                  Buy us a coffee! Any amount helps fund development and keeps InnerZero free for everyone.
                </p>
                <a
                  href="https://ko-fi.com/innerzero"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border-default px-6 py-3 text-[15px] font-medium text-text-primary transition-all duration-150 hover:border-accent-gold hover:text-accent-gold"
                >
                  Donate
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            <div className="mt-6 text-center">
              <a
                href="https://discord.gg/rn9SPXgThT"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-accent-teal"
              >
                Join the community on Discord
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </ScrollReveal>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-12 md:py-20">
        <Container>
          <SectionHeader
            title="Frequently Asked Questions"
            subtitle="Everything you need to know about InnerZero."
          />
          <ScrollReveal>
            <div className="mx-auto max-w-2xl">
              {[...FAQ_DATA, ...CLOUD_FAQ].map((item) => (
                <FAQAccordionItem key={item.question} item={item} />
              ))}
            </div>
          </ScrollReveal>
        </Container>
      </section>
    </div>
  );
}
