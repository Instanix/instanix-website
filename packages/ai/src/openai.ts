import { AiError, type AiProvider, type StructuredRequest, type StructuredResult } from "./provider";

interface OpenAiOptions {
  /** Read from server-side configuration only. Never sent to the browser or to a model. */
  readonly apiKey: string;
  readonly baseUrl?: string;
  readonly fetchImpl?: typeof fetch;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Pulls the structured text out of a Responses API payload. */
function extractOutputText(payload: unknown): string {
  if (!isRecord(payload) || !Array.isArray(payload.output)) {
    throw new AiError("invalid_output", "Provider response has no output");
  }
  for (const item of payload.output) {
    if (!isRecord(item) || item.type !== "message" || !Array.isArray(item.content)) continue;
    for (const part of item.content) {
      if (!isRecord(part)) continue;
      if (part.type === "refusal") throw new AiError("refused", "The model declined the request");
      if (part.type === "output_text" && typeof part.text === "string") return part.text;
    }
  }
  throw new AiError("invalid_output", "Provider response has no text output");
}

function readUsage(payload: unknown): { inputTokens: number; outputTokens: number } {
  const usage = isRecord(payload) && isRecord(payload.usage) ? payload.usage : {};
  return {
    inputTokens: typeof usage.input_tokens === "number" ? usage.input_tokens : 0,
    outputTokens: typeof usage.output_tokens === "number" ? usage.output_tokens : 0,
  };
}

/** OpenAI adapter on the Responses API with strict structured outputs (docs/03_AI_AGENT_RUNTIME.md). */
export function createOpenAiProvider({ apiKey, baseUrl = "https://api.openai.com/v1", fetchImpl = fetch }: OpenAiOptions): AiProvider {
  return {
    name: "openai",
    async generateStructured(request: StructuredRequest): Promise<StructuredResult> {
      let response: Response;
      try {
        response = await fetchImpl(`${baseUrl}/responses`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: request.model,
            instructions: request.system,
            input: request.user,
            max_output_tokens: request.maxOutputTokens,
            // Do not keep visitor text in the provider's response store.
            store: false,
            text: { format: { type: "json_schema", name: request.schemaName, schema: request.schema, strict: true } },
          }),
          ...(request.signal ? { signal: request.signal } : {}),
        });
      } catch (error) {
        if (error instanceof Error && (error.name === "AbortError" || error.name === "TimeoutError")) {
          throw new AiError("timeout", "The provider did not answer in time");
        }
        throw new AiError("upstream", "Could not reach the provider");
      }

      if (!response.ok) {
        // Status only: provider error bodies can echo request content.
        throw new AiError("upstream", `Provider returned HTTP ${response.status}`, response.status);
      }

      const payload: unknown = await response.json();
      const text = extractOutputText(payload);
      let data: unknown;
      try {
        data = JSON.parse(text);
      } catch {
        throw new AiError("invalid_output", "Provider output is not valid JSON");
      }
      return { data, usage: readUsage(payload) };
    },
  };
}
