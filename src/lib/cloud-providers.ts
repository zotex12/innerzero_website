/**
 * Cloud AI provider routing.
 * Transforms messages to each provider's format, calls the API, and returns
 * a standardised response. Never logs message content or AI responses.
 */

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Failure classification for the B0 direct-DeepSeek path (Codex plan-review
// correction c). "transient" = provider-side trouble (timeout, connection,
// 5xx, 429): may fall back, counts toward the circuit. "auth" = our key or
// config (401/403): the prompt is fine, may fall back, counts toward the
// circuit. "request" = malformed/content 4xx: the prompt must NEVER be
// resent to another provider and the circuit must not open.
// The legacy tier-cascade path ignores this field (defaults to "transient"),
// so flag-off behaviour is unchanged.
export type ProviderErrorClass = "transient" | "auth" | "request";

export function classifyProviderHttpStatus(status: number): ProviderErrorClass {
  if (status === 401 || status === 403) return "auth";
  if (status === 429) return "transient";
  if (status >= 400 && status < 500) return "request";
  return "transient";
}

export class ProviderUnavailableError extends Error {
  errorClass: ProviderErrorClass;
  // First token of the reason ("502", "timeout", "connection_error").
  // The B0 path persists ONLY this token (plus errorClass) to the
  // fallback-event and provider-health tables, never the provider's
  // error body (Codex plan-review correction d).
  reasonCode: string;
  constructor(
    provider: string,
    reason: string,
    errorClass: ProviderErrorClass = "transient"
  ) {
    super(`${provider} unavailable: ${reason}`);
    this.name = "ProviderUnavailableError";
    this.errorClass = errorClass;
    this.reasonCode = reason.split(":")[0].trim().slice(0, 40);
  }
}

export interface ProviderResponse {
  content: string;
  provider: string;
  model: string;
  input_tokens?: number;
  output_tokens?: number;
}

// ── DeepSeek via Azure OpenAI ──────────────────────────────────────────

async function callDeepSeek(
  modelId: string,
  messages: ChatMessage[],
  systemPrompt?: string,
  timeoutMs: number = 30_000
): Promise<ProviderResponse> {
  const apiKey = process.env.AZURE_DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("AZURE_DEEPSEEK_API_KEY not configured");

  const openaiMessages: { role: string; content: string }[] = [];
  if (systemPrompt) {
    openaiMessages.push({ role: "system", content: systemPrompt });
  }
  for (const m of messages) {
    openaiMessages.push({ role: m.role, content: m.content });
  }

  // Azure OpenAI-compatible endpoint on Foundry deployment. URL is the v1
  // chat/completions route, auth is Bearer, and the body.model field holds
  // the Azure deployment name "DeepSeek-V3.2" (dot, not hyphen). Do NOT
  // restore the legacy /openai/deployments/<name>/ pattern — that returns
  // 404 against this deployment. `modelId` is the provider-level id from
  // the DB tier config (e.g. "deepseek-chat") used for cost lookup and
  // response logging; it must not be used for Azure routing.
  const url =
    "https://innerzero-resource.openai.azure.com/openai/v1/chat/completions";

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "DeepSeek-V3.2",
        messages: openaiMessages,
        max_tokens: 2048,
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    // Distinguish timeout/abort from other connection failures so cascade
    // logs can measure rate-by-cause (audit observability gap).
    const name = (err as { name?: string } | null)?.name;
    const reason = (name === "TimeoutError" || name === "AbortError")
      ? "timeout"
      : "connection_error";
    throw new ProviderUnavailableError("deepseek", reason);
  }

  if (!res.ok) {
    // Cascade on all non-2xx (4xx and 5xx). A 4xx from one provider does not
    // mean the user's request is bad — it means THIS provider failed right
    // now (misconfigured endpoint, upstream quota, deployment removed, etc.),
    // so the tier's next candidate deserves a try. Body text is the
    // provider's own error response (truncated) — NOT user content.
    const bodyText = await res.text().catch(() => "");
    throw new ProviderUnavailableError(
      "deepseek",
      `${res.status}: ${bodyText.slice(0, 200)}`
    );
  }

  // Body read is wrapped: AbortError firing between headers and body
  // completion was previously an uncaught DOMException that broke the
  // cascade loop (non-ProviderUnavailableError → break path in proxy).
  // Now it throws body_read_failed so the next candidate is tried.
  let data;
  try {
    data = await res.json();
  } catch {
    throw new ProviderUnavailableError("deepseek", "body_read_failed");
  }
  const choice = data.choices?.[0];

  return {
    content: choice?.message?.content ?? "",
    provider: "deepseek",
    model: modelId,
    input_tokens: data.usage?.prompt_tokens,
    output_tokens: data.usage?.completion_tokens,
  };
}

// ── DeepSeek direct API (B0, deepseek-v4-flash) ───────────────────────

// Exported for tests: the exact request body sent to the direct DeepSeek
// API. Locked decision 6 pins the single managed text model to
// deepseek-v4-flash; correction (b) pins thinking EXPLICITLY disabled
// (v4-flash defaults thinking ON, and reasoning would eat the 2048 output
// budget and truncate answers); max_tokens stays at or below 2048.
export function buildDeepSeekDirectBody(
  messages: ChatMessage[],
  systemPrompt?: string
): Record<string, unknown> {
  const openaiMessages: { role: string; content: string }[] = [];
  if (systemPrompt) {
    openaiMessages.push({ role: "system", content: systemPrompt });
  }
  for (const m of messages) {
    openaiMessages.push({ role: m.role, content: m.content });
  }
  return {
    model: "deepseek-v4-flash",
    messages: openaiMessages,
    max_tokens: 2048,
    thinking: { type: "disabled" },
  };
}

// Direct DeepSeek call for the B0 managed path (locked decision 9: Azure is
// retired; every provider call uses that provider's DIRECT API). Reached
// only when CLOUD_PROXY_B0_V4FLASH_ENABLED is on; the Azure leg above stays
// untouched for the flag-off path until the post-B0 cleanup phase removes it.
export async function callDeepSeekDirect(
  messages: ChatMessage[],
  systemPrompt?: string,
  timeoutMs: number = 30_000
): Promise<ProviderResponse> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY not configured");

  let res: Response;
  try {
    res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(buildDeepSeekDirectBody(messages, systemPrompt)),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    const name = (err as { name?: string } | null)?.name;
    const reason = (name === "TimeoutError" || name === "AbortError")
      ? "timeout"
      : "connection_error";
    throw new ProviderUnavailableError("deepseek", reason, "transient");
  }

  if (!res.ok) {
    // Classified, unlike the legacy cascade: a request-class 4xx must not
    // be resent to a second provider. Body text is the provider's own
    // error response (truncated) — NOT user content.
    const bodyText = await res.text().catch(() => "");
    throw new ProviderUnavailableError(
      "deepseek",
      `${res.status}: ${bodyText.slice(0, 200)}`,
      classifyProviderHttpStatus(res.status)
    );
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw new ProviderUnavailableError("deepseek", "body_read_failed", "transient");
  }
  const choice = data.choices?.[0];

  // A 200 with no usable content must NOT enter the success/billing path
  // (Codex review fold: the subscriber would be charged for an empty
  // reply). Throwing transient lets the circuit count it and the
  // fallback leg serve the request instead.
  const content = choice?.message?.content;
  if (typeof content !== "string" || content.length === 0) {
    throw new ProviderUnavailableError("deepseek", "empty_response", "transient");
  }

  return {
    content,
    provider: "deepseek",
    model: "deepseek-v4-flash",
    input_tokens: data.usage?.prompt_tokens,
    output_tokens: data.usage?.completion_tokens,
  };
}

// ── Google Gemini ──────────────────────────────────────────────────────

async function callGoogle(
  modelId: string,
  messages: ChatMessage[],
  systemPrompt?: string,
  timeoutMs: number = 30_000
): Promise<ProviderResponse> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_AI_API_KEY not configured");

  const contents: { role: string; parts: { text: string }[] }[] = [];
  for (const m of messages) {
    contents.push({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    });
  }

  const body: Record<string, unknown> = {
    contents,
    generationConfig: { maxOutputTokens: 2048 },
  };
  if (systemPrompt) {
    body.systemInstruction = { parts: [{ text: systemPrompt }] };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    const name = (err as { name?: string } | null)?.name;
    const reason = (name === "TimeoutError" || name === "AbortError")
      ? "timeout"
      : "connection_error";
    throw new ProviderUnavailableError("google", reason);
  }

  if (!res.ok) {
    // Cascade on all non-2xx — see rationale in callDeepSeek.
    const bodyText = await res.text().catch(() => "");
    throw new ProviderUnavailableError(
      "google",
      `${res.status}: ${bodyText.slice(0, 200)}`
    );
  }

  // See callDeepSeek — wrap body read so mid-body aborts cascade cleanly.
  let data;
  try {
    data = await res.json();
  } catch {
    throw new ProviderUnavailableError("google", "body_read_failed");
  }
  const candidate = data.candidates?.[0];
  const text =
    candidate?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";

  return {
    content: text,
    provider: "google",
    model: modelId,
    input_tokens: data.usageMetadata?.promptTokenCount,
    output_tokens: data.usageMetadata?.candidatesTokenCount,
  };
}

// ── Anthropic Claude ───────────────────────────────────────────────────

async function callAnthropic(
  modelId: string,
  messages: ChatMessage[],
  systemPrompt?: string,
  timeoutMs: number = 30_000
): Promise<ProviderResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const anthropicMessages = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const body: Record<string, unknown> = {
    model: modelId,
    max_tokens: 2048,
    messages: anthropicMessages,
  };
  if (systemPrompt) {
    body.system = systemPrompt;
  }

  let res: Response;
  try {
    res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    const name = (err as { name?: string } | null)?.name;
    const reason = (name === "TimeoutError" || name === "AbortError")
      ? "timeout"
      : "connection_error";
    throw new ProviderUnavailableError("anthropic", reason);
  }

  if (!res.ok) {
    // Cascade on all non-2xx — see rationale in callDeepSeek.
    const bodyText = await res.text().catch(() => "");
    throw new ProviderUnavailableError(
      "anthropic",
      `${res.status}: ${bodyText.slice(0, 200)}`
    );
  }

  // See callDeepSeek — wrap body read so mid-body aborts cascade cleanly.
  let data;
  try {
    data = await res.json();
  } catch {
    throw new ProviderUnavailableError("anthropic", "body_read_failed");
  }
  const text =
    data.content
      ?.filter((b: { type: string }) => b.type === "text")
      .map((b: { text: string }) => b.text)
      .join("") ?? "";

  return {
    content: text,
    provider: "anthropic",
    model: modelId,
    input_tokens: data.usage?.input_tokens,
    output_tokens: data.usage?.output_tokens,
  };
}

// ── Provider cost rates (pence per 1K tokens) ────────────────────────
// Converted from USD per 1M tokens at $1 = £0.79, rounded UP for margin.

export const PROVIDER_COSTS: Record<
  string,
  { input_per_1k: number; output_per_1k: number }
> = {
  // Azure DeepSeek V3.2: $0.58/1M input, $1.68/1M output. Key matches the
  // provider-level model_id from model_tiers.models (proxy passes that in).
  // The Azure deployment name "DeepSeek-V3.2" lives only inside callDeepSeek.
  "deepseek-chat": { input_per_1k: 0.0459, output_per_1k: 0.1328 },
  // Direct DeepSeek V4 Flash (B0): $0.14/1M input (cache miss), $0.28/1M
  // output. Official api-docs.deepseek.com prices verified 2026-07-17.
  "deepseek-v4-flash": { input_per_1k: 0.0111, output_per_1k: 0.0223 },
  // Google Gemini 2.5 Flash: $0.30/1M input, $2.50/1M output
  "gemini-2.5-flash": { input_per_1k: 0.0237, output_per_1k: 0.1975 },
  // Google Gemini 2.5 Flash-Lite: $0.10/1M input, $0.40/1M output
  "gemini-2.5-flash-lite": { input_per_1k: 0.0079, output_per_1k: 0.0316 },
  // Anthropic Claude Haiku 4.5: $1.00/1M input, $5.00/1M output
  "claude-haiku-4-5-20251001": { input_per_1k: 0.0790, output_per_1k: 0.3950 },
  // Anthropic Claude Sonnet 4.6: $3.00/1M input, $15.00/1M output
  "claude-sonnet-4-6": { input_per_1k: 0.2370, output_per_1k: 1.1850 },
  // Anthropic Claude Opus 4.6: $5.00/1M input, $25.00/1M output
  "claude-opus-4-6": { input_per_1k: 0.3950, output_per_1k: 1.9750 },
};

// Fallback: most expensive rate (Claude Opus) for unknown models
const FALLBACK_COST = PROVIDER_COSTS["claude-opus-4-6"];

export function estimateCostPence(
  modelId: string,
  inputTokens: number,
  outputTokens: number
): number {
  const rates = PROVIDER_COSTS[modelId] ?? FALLBACK_COST;
  return (
    (inputTokens / 1000) * rates.input_per_1k +
    (outputTokens / 1000) * rates.output_per_1k
  );
}

// ── Router ─────────────────────────────────────────────────────────────

const PROVIDER_MAP: Record<
  string,
  (
    modelId: string,
    messages: ChatMessage[],
    systemPrompt?: string,
    timeoutMs?: number
  ) => Promise<ProviderResponse>
> = {
  deepseek: callDeepSeek,
  google: callGoogle,
  anthropic: callAnthropic,
};

export async function routeToProvider(
  provider: string,
  modelId: string,
  messages: ChatMessage[],
  systemPrompt?: string,
  timeoutMs?: number
): Promise<ProviderResponse> {
  const handler = PROVIDER_MAP[provider];
  if (!handler) {
    throw new Error(`Unsupported provider: ${provider}`);
  }
  return handler(modelId, messages, systemPrompt, timeoutMs);
}
