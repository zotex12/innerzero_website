/**
 * Usage threshold alerts via Resend email.
 * Fire-and-forget — never fails the deduction if email fails.
 */

import { createAdminClient } from "@/lib/supabase/admin";

const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (process.env.NODE_ENV === "production" && !RESEND_API_KEY) {
  console.error(
    "[startup] RESEND_API_KEY missing in production — usage threshold alerts will silently skip"
  );
}
const FROM_EMAIL = "InnerZero <noreply@innerzero.com>";
const ACCOUNT_URL = "https://innerzero.com/account";
const PRICING_URL = "https://innerzero.com/pricing";

const THRESHOLDS = [
  { pct: 50, key: "50" },
  { pct: 20, key: "20" },
  { pct: 5, key: "5" },
  { pct: 0, key: "0" },
] as const;

interface AlertEmail {
  subject: string;
  html: string;
}

function buildEmail(
  threshold: string,
  currentBalance: number,
  monthlyAllowance: number
): AlertEmail {
  const remaining = Math.max(0, currentBalance);

  switch (threshold) {
    case "50":
      return {
        subject: "InnerZero Cloud: 50% usage remaining",
        html: `<p>Hi there,</p>
<p>You've used half of your monthly Cloud AI allowance. You have <strong>${remaining.toLocaleString("en-GB")}</strong> of ${monthlyAllowance.toLocaleString("en-GB")} usage remaining this cycle.</p>
<p>No action needed — just a heads up.</p>
<p><a href="${ACCOUNT_URL}">View your account</a> · <a href="${PRICING_URL}">Top up</a></p>
<p>— InnerZero</p>`,
      };
    case "20":
      return {
        subject: "InnerZero Cloud: Running low on usage",
        html: `<p>Hi there,</p>
<p>You're running low on Cloud AI usage. You have <strong>${remaining.toLocaleString("en-GB")}</strong> of ${monthlyAllowance.toLocaleString("en-GB")} usage remaining this cycle.</p>
<p>Consider topping up with a credit pack to avoid interruption.</p>
<p><a href="${PRICING_URL}">Top up now</a> · <a href="${ACCOUNT_URL}">View your account</a></p>
<p>— InnerZero</p>`,
      };
    case "5":
      return {
        subject: "InnerZero Cloud: Almost out of usage",
        html: `<p>Hi there,</p>
<p>You have <strong>${remaining.toLocaleString("en-GB")}</strong> of ${monthlyAllowance.toLocaleString("en-GB")} Cloud AI usage remaining. Cloud AI will stop when this runs out.</p>
<p>Top up now to keep using Cloud AI without interruption.</p>
<p><a href="${PRICING_URL}">Top up now</a> · <a href="${ACCOUNT_URL}">View your account</a></p>
<p>— InnerZero</p>`,
      };
    case "0":
      return {
        subject: "InnerZero Cloud: Usage exhausted",
        html: `<p>Hi there,</p>
<p>Your Cloud AI usage for this billing cycle has been exhausted. Cloud AI requests will not work until your balance is replenished.</p>
<p>Your local AI is still fully functional — no interruption there.</p>
<p>Top up with a credit pack or upgrade your plan to continue using Cloud AI.</p>
<p><a href="${PRICING_URL}">Top up or upgrade</a> · <a href="${ACCOUNT_URL}">View your account</a></p>
<p>— InnerZero</p>`,
      };
    default:
      return { subject: "", html: "" };
  }
}

async function sendUsageEmail(
  email: string,
  threshold: string,
  currentBalance: number,
  monthlyAllowance: number
): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn("[usage-alerts] RESEND_API_KEY not configured, skipping email");
    return false;
  }

  const { subject, html } = buildEmail(threshold, currentBalance, monthlyAllowance);
  if (!subject) return false;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: email,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      console.error(`[usage-alerts] Resend API error: ${res.status}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[usage-alerts] Email send failed:", err instanceof Error ? err.message : "unknown");
    return false;
  }
}

/**
 * Check if a usage threshold was just crossed and send an email alert.
 * Fire-and-forget: caller should not await this.
 *
 * Only applies to subscription users (has monthlyAllowance > 0).
 * PAYG-only users are skipped.
 */
export async function checkAndSendUsageAlert(
  userId: string,
  currentBalance: number,
  monthlyAllowance: number,
  alertsSent: string[]
): Promise<void> {
  if (monthlyAllowance <= 0) return;

  const pctRemaining = (currentBalance / monthlyAllowance) * 100;

  // Find the highest threshold that was just crossed
  const thresholdToSend = THRESHOLDS.find(
    (t) => pctRemaining <= t.pct && !alertsSent.includes(t.key)
  );

  if (!thresholdToSend) return;

  const admin = createAdminClient();

  // Get user email from profiles
  const { data: profile } = await admin
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .single();

  if (!profile?.email) return;

  const sent = await sendUsageEmail(
    profile.email,
    thresholdToSend.key,
    currentBalance,
    monthlyAllowance
  );

  if (sent) {
    const updatedAlerts = [...alertsSent, thresholdToSend.key];
    await admin
      .from("profiles")
      .update({ usage_alerts_sent: updatedAlerts })
      .eq("id", userId);
  }
}
