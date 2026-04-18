/**
 * Cloud AI provider routing.
 * Transforms messages to each provider's format, calls the API, and returns
 * a standardised response. Never logs message content or AI responses.
 */

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export class ProviderUnavailableError extends Error {
  constructor(provider: string, reason: string) {
    super(`${provider} unavailable: ${reason}`);
    this.name = "ProviderUnavailableError";
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
  } catch {
    throw new ProviderUnavailableError("deepseek", "timeout or connection error");
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

  const data = await res.json();
  const choice = data.choices?.[0];

  return {
    content: choice?.message?.content ?? "",
    provider: "deepseek",
    model: modelId,
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
  } catch {
    throw new ProviderUnavailableError("google", "timeout or connection error");
  }

  if (!res.ok) {
    // Cascade on all non-2xx — see rationale in callDeepSeek.
    const bodyText = await res.text().catch(() => "");
    throw new ProviderUnavailableError(
      "google",
      `${res.status}: ${bodyText.slice(0, 200)}`
    );
  }

  const data = await res.json();
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
  } catch {
    throw new ProviderUnavailableError("anthropic", "timeout or connection error");
  }

  if (!res.ok) {
    // Cascade on all non-2xx — see rationale in callDeepSeek.
    const bodyText = await res.text().catch(() => "");
    throw new ProviderUnavailableError(
      "anthropic",
      `${res.status}: ${bodyText.slice(0, 200)}`
    );
  }

  const data = await res.json();
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
