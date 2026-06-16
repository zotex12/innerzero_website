// Release-update email template for InnerZero.
//
// Pure, framework-free renderer so it runs under plain Node (no build
// step) and is easy to edit by hand for future releases. It takes the
// per-release content from release.json plus a few runtime values
// (links, per-recipient unsubscribe URL) and returns the subject, the
// HTML body, and a plain-text fallback.
//
// Brand conventions (match the website, do not break them):
// - British English. No em dashes. No emojis. No invented stats.
// - No "free forever" / "always free" / "permanent" wording.
// - Colours mirror src/styles/globals.css (dark theme + gold accent).
//
// To change the look, edit the styles in this file. To change the words
// for a release, edit release.json (not this file).

// --- Brand palette (from globals.css dark theme) ---
const COLOR = {
  bg: "#0a0a0f",
  card: "#14141c",
  cardInner: "#1a1a24",
  border: "#2a2a3a",
  textPrimary: "#f0f0f5",
  textSecondary: "#a0a0b8",
  textMuted: "#85859d",
  gold: "#d4a843",
  goldBright: "#f0c040",
  teal: "#00c9b7",
  green: "#22c55e",
  buttonText: "#0a0a0f",
};

// Per-group label colour. Falls back to gold for anything unexpected.
const LABEL_COLOR = {
  New: COLOR.teal,
  Improved: COLOR.gold,
  Fixed: COLOR.green,
  "Known limitations": COLOR.textMuted,
};

const FONT_STACK =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/** Minimal HTML escape for any text that ends up in the markup. */
function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** One change group rendered as a coloured label plus a list of items. */
function renderGroup(group) {
  const color = LABEL_COLOR[group.label] || COLOR.gold;
  const items = (group.items || [])
    .map(
      (item) => `
            <tr>
              <td valign="top" style="padding:0 10px 10px 0;color:${color};font-size:15px;line-height:24px;">&bull;</td>
              <td valign="top" style="padding:0 0 10px 0;color:${COLOR.textSecondary};font-size:15px;line-height:24px;">${esc(item)}</td>
            </tr>`,
    )
    .join("");

  return `
      <tr>
        <td style="padding:0 0 6px 0;">
          <span style="display:inline-block;padding:3px 10px;border-radius:999px;background:rgba(212,168,67,0.12);color:${color};font-size:12px;font-weight:600;letter-spacing:0.02em;text-transform:uppercase;">${esc(group.label)}</span>
        </td>
      </tr>
      <tr>
        <td style="padding:0 0 18px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${items}
          </table>
        </td>
      </tr>`;
}

/**
 * Render the release email.
 *
 * @param {object} release  Parsed release.json content.
 * @param {object} ctx      { siteUrl, unsubscribeUrl, year }
 * @returns {{ subject: string, html: string, text: string }}
 */
export function renderReleaseEmail(release, ctx) {
  const version = String(release.version || "").replace(/^v/i, "");
  const siteUrl = (ctx.siteUrl || "https://innerzero.com").replace(/\/$/, "");
  const downloadUrl = `${siteUrl}/download`;
  const changelogUrl = `${siteUrl}/changelog#v${version}`;
  const unsubscribeUrl = ctx.unsubscribeUrl || `${siteUrl}/unsubscribe`;
  const year = ctx.year || new Date().getFullYear();

  const subject = release.subject || `InnerZero ${version} is out`;
  const preheader =
    release.preheader || `Version ${version} of InnerZero is now available.`;
  const intro = release.intro || "Here is what is new in this update.";
  const dateLabel = release.dateLabel || "";

  const groupsHtml = (release.groups || []).map(renderGroup).join("");

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>${esc(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${COLOR.bg};">
  <span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;mso-hide:all;">${esc(preheader)}</span>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${COLOR.bg};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:600px;background:${COLOR.card};border:1px solid ${COLOR.border};border-radius:14px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:28px 32px 20px 32px;border-bottom:1px solid ${COLOR.border};">
              <div style="font-family:${FONT_STACK};font-size:20px;font-weight:700;color:${COLOR.gold};letter-spacing:0.01em;">InnerZero</div>
              <div style="font-family:${FONT_STACK};font-size:13px;color:${COLOR.textMuted};margin-top:4px;">Private AI that runs on your own computer.</div>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="padding:28px 32px 8px 32px;">
              <div style="font-family:${FONT_STACK};font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:${COLOR.gold};">New release${dateLabel ? " &middot; " + esc(dateLabel) : ""}</div>
              <h1 style="margin:10px 0 0 0;font-family:${FONT_STACK};font-size:26px;line-height:1.25;font-weight:700;color:${COLOR.textPrimary};">Version ${esc(version)} is out now</h1>
              <p style="margin:14px 0 0 0;font-family:${FONT_STACK};font-size:15px;line-height:24px;color:${COLOR.textSecondary};">${esc(intro)}</p>
            </td>
          </tr>

          <!-- Changes -->
          <tr>
            <td style="padding:24px 32px 4px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                ${groupsHtml}
              </table>
            </td>
          </tr>

          <!-- CTA button -->
          <tr>
            <td style="padding:8px 32px 8px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" bgcolor="${COLOR.gold}" style="border-radius:10px;">
                    <a href="${esc(downloadUrl)}" target="_blank" style="display:inline-block;padding:13px 26px;font-family:${FONT_STACK};font-size:15px;font-weight:600;color:${COLOR.buttonText};text-decoration:none;border-radius:10px;">Download the update</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Secondary link -->
          <tr>
            <td style="padding:6px 32px 28px 32px;">
              <a href="${esc(changelogUrl)}" target="_blank" style="font-family:${FONT_STACK};font-size:14px;color:${COLOR.gold};text-decoration:underline;">Read the full changelog</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:22px 32px 26px 32px;border-top:1px solid ${COLOR.border};">
              <p style="margin:0;font-family:${FONT_STACK};font-size:12px;line-height:20px;color:${COLOR.textMuted};">
                You are receiving this because you joined the InnerZero update list.
              </p>
              <p style="margin:10px 0 0 0;font-family:${FONT_STACK};font-size:12px;line-height:20px;color:${COLOR.textMuted};">
                <a href="${esc(unsubscribeUrl)}" target="_blank" style="color:${COLOR.textSecondary};text-decoration:underline;">Unsubscribe</a>
                &nbsp;&middot;&nbsp;
                <a href="${esc(siteUrl)}" target="_blank" style="color:${COLOR.textSecondary};text-decoration:underline;">innerzero.com</a>
              </p>
              <p style="margin:12px 0 0 0;font-family:${FONT_STACK};font-size:12px;line-height:20px;color:${COLOR.textMuted};">
                &copy; ${esc(year)} InnerZero
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  // Plain-text fallback for deliverability and text-only clients.
  const textGroups = (release.groups || [])
    .map((g) => {
      const lines = (g.items || []).map((i) => `  - ${i}`).join("\n");
      return `${g.label}\n${lines}`;
    })
    .join("\n\n");

  const text = `InnerZero ${version} is out now
${dateLabel ? dateLabel + "\n" : ""}
${intro}

${textGroups}

Download the update: ${downloadUrl}
Full changelog: ${changelogUrl}

---
You are receiving this because you joined the InnerZero update list.
Unsubscribe: ${unsubscribeUrl}
innerzero.com
(c) ${year} InnerZero`;

  return { subject, html, text };
}
