/**
 * Cloud AI provider routing.
 * Transforms messages to each provider's format, calls the API, and returns
 * a standardised response. Never logs message content or AI responses.
 */

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
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
  systemPrompt?: string
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

  const url =
    "https://innerzero-resource.openai.azure.com/openai/deployments/DeepSeek-V3-2/chat/completions?api-version=2024-12-01-preview";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      messages: openaiMessages,
      max_tokens: 2048,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    throw new Error(`DeepSeek API error: ${res.status}`);
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
  systemPrompt?: string
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

  const body: Record<string, unknown> = { contents };
  if (systemPrompt) {
    body.systemInstruction = { parts: [{ text: systemPrompt }] };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    throw new Error(`Google AI error: ${res.status}`);
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
  systemPrompt?: string
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

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    throw new Error(`Anthropic API error: ${res.status}`);
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

export const PROVIDER_COSTS: Record<
  string,
  { input_per_1k: number; output_per_1k: number }
> = {
  // Azure DeepSeek V3.2: $0.27/1M input, $1.10/1M output → pence at ~£0.79/$1
  "DeepSeek-V3-2": { input_per_1k: 0.0213, output_per_1k: 0.0866 },
  // Google Gemini 2.5 Flash: $0.15/1M input, $0.60/1M output
  "gemini-2.5-flash": { input_per_1k: 0.0118, output_per_1k: 0.0472 },
  // Anthropic Claude Sonnet 4.6: $3/1M input, $15/1M output
  "claude-sonnet-4-6": { input_per_1k: 0.2362, output_per_1k: 1.1811 },
};

export function estimateCostPence(
  modelId: string,
  inputTokens: number,
  outputTokens: number
): number {
  const rates = PROVIDER_COSTS[modelId];
  if (!rates) return 0;
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
    systemPrompt?: string
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
  systemPrompt?: string
): Promise<ProviderResponse> {
  const handler = PROVIDER_MAP[provider];
  if (!handler) {
    throw new Error(`Unsupported provider: ${provider}`);
  }
  return handler(modelId, messages, systemPrompt);
}
