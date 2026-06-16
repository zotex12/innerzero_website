// Send the InnerZero release-update email to the newsletter list.
//
// Runs locally (operator machine), not on the server, so the live site
// has no public "send to everyone" endpoint. Keys are read from
// .env.local via Node's --env-file flag.
//
// USAGE (run from the repo root):
//   node --env-file=.env.local scripts/release-email/send.mjs            # dry run: writes preview.html, sends nothing
//   node --env-file=.env.local scripts/release-email/send.mjs --test you@example.com   # one real test email to you only
//   node --env-file=.env.local scripts/release-email/send.mjs --send     # send to the whole active list
//   ...add --force to re-send a version that was already sent
//
// Required env (all already in .env.local except RESEND_API_KEY, which
// you add once): RESEND_API_KEY, NEXT_PUBLIC_SUPABASE_URL,
// SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SITE_URL.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { renderReleaseEmail } from "./template.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const FROM = "InnerZero <updates@innerzero.com>";
const BATCH_SIZE = 100; // Resend batch endpoint maximum per call.

// --- Parse args ---
const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);
const valueOf = (flag) => {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : null;
};
const isSend = has("--send");
const force = has("--force");
const testEmail = valueOf("--test");

function fail(message) {
  console.error(`\n[send] ${message}\n`);
  process.exit(1);
}

// --- Env ---
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://innerzero.com").replace(/\/$/, "");

if (isSend || testEmail) {
  if (!RESEND_API_KEY) fail("RESEND_API_KEY is missing. Add it to .env.local, then re-run.");
}
if (isSend) {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    fail("NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing from .env.local.");
  }
}

// --- Load release content ---
const releasePath = join(HERE, "release.json");
let release;
try {
  release = JSON.parse(readFileSync(releasePath, "utf8"));
} catch (err) {
  fail(`Could not read release.json: ${err.message}`);
}
const version = String(release.version || "").replace(/^v/i, "");
if (!version) fail("release.json has no version.");

// Shape guard: catch a malformed groups/items structure up front with a
// clear message rather than a later .map() crash.
if (!Array.isArray(release.groups)) {
  fail("release.json: 'groups' must be an array.");
}
for (const g of release.groups) {
  if (!g || !Array.isArray(g.items)) {
    fail(`release.json: group "${g?.label ?? "?"}" must have an 'items' array.`);
  }
}

// --- Double-send guard ---
const sentLogPath = join(HERE, ".sent-log.json");
const sentLog = existsSync(sentLogPath)
  ? JSON.parse(readFileSync(sentLogPath, "utf8"))
  : {};
if (isSend && sentLog[version] && !force) {
  fail(
    `Version ${version} was already sent on ${sentLog[version].sentAt} ` +
      `(${sentLog[version].recipients} recipients). Use --force to send again.`,
  );
}

const ctx = { siteUrl: SITE_URL, year: new Date().getFullYear() };

// --- DRY RUN: render a preview, send nothing ---
if (!isSend && !testEmail) {
  const preview = renderReleaseEmail(release, {
    ...ctx,
    unsubscribeUrl: `${SITE_URL}/unsubscribe?token=PREVIEW_TOKEN`,
  });
  const out = join(HERE, "preview.html");
  writeFileSync(out, preview.html, "utf8");
  console.log(`\n[dry run] Version ${version}`);
  console.log(`[dry run] Subject: ${preview.subject}`);
  console.log(`[dry run] Preview written to: ${out}`);
  console.log(`[dry run] Open it in a browser to check the look.`);
  console.log(`[dry run] Nothing was sent. Use --test <email> or --send.\n`);
  process.exit(0);
}

const resend = new Resend(RESEND_API_KEY);

function buildMessage(toEmail, unsubscribeToken) {
  const t = encodeURIComponent(unsubscribeToken);
  const unsubUrlPage = `${SITE_URL}/unsubscribe?token=${t}`;
  const unsubUrlApi = `${SITE_URL}/api/newsletter/unsubscribe?token=${t}`;
  const { subject, html, text } = renderReleaseEmail(release, {
    ...ctx,
    unsubscribeUrl: unsubUrlPage,
  });
  return {
    from: FROM,
    to: [toEmail],
    subject,
    html,
    text,
    headers: {
      // One-click unsubscribe (RFC 8058) for inbox providers, plus the
      // friendly confirmation page link.
      "List-Unsubscribe": `<${unsubUrlApi}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  };
}

// One real-send path. Both branches let the process end naturally so the
// HTTPS connection to Resend closes cleanly. Calling process.exit() here
// while that socket is still open aborts it and triggers a libuv
// assertion on Windows (the email still sends, but the exit code is
// non-zero, which would confuse callers checking it).
if (testEmail) {
  // --- TEST: one real email to a single address ---
  const msg = buildMessage(testEmail, "PREVIEW_TOKEN");
  const { error } = await resend.emails.send(msg);
  if (error) fail(`Resend error: ${JSON.stringify(error)}`);
  console.log(`\n[test] Sent "${msg.subject}" to ${testEmail}. Check that inbox.\n`);
} else {
  // --- SEND: the whole active list ---
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
  const { data: subscribers, error: dbError } = await supabase
    .from("newsletter_subscribers")
    .select("email, unsubscribe_token")
    .is("unsubscribed_at", null);

  if (dbError) fail(`Supabase error: ${dbError.message}`);
  if (!subscribers || subscribers.length === 0) {
    fail("No active subscribers found. Nothing to send.");
  }

  console.log(`\n[send] Version ${version}: ${subscribers.length} active subscriber(s).`);

  let sent = 0;
  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const chunk = subscribers.slice(i, i + BATCH_SIZE);
    const batch = chunk.map((s) => buildMessage(s.email, s.unsubscribe_token));
    const { data, error } = await resend.batch.send(batch);
    if (error) fail(`Resend batch error at row ${i}: ${JSON.stringify(error)}`);
    // batch.send returns the accepted messages under data.data. If Resend
    // accepted fewer than we sent, record the real number and warn rather
    // than logging a partial batch as a clean success.
    const ids = data && Array.isArray(data.data) ? data.data : null;
    const accepted = ids ? ids.length : chunk.length;
    if (accepted < chunk.length) {
      console.warn(
        `[send] WARNING: Resend accepted ${accepted}/${chunk.length} in this batch. Check the Resend dashboard.`,
      );
    }
    sent += accepted;
    console.log(`[send] ${sent}/${subscribers.length} sent`);
  }

  // --- Record the send so we cannot double-send by accident ---
  sentLog[version] = {
    sentAt: new Date().toISOString(),
    recipients: sent,
    subject: release.subject || `InnerZero ${version} is out`,
  };
  writeFileSync(sentLogPath, JSON.stringify(sentLog, null, 2), "utf8");
  console.log(`\n[send] Done. ${sent} email(s) sent for version ${version}.\n`);
}
