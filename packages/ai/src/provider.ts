/** Failure categories the runtime exposes. Never carries prompts, user text or credentials. */
export type AiErrorCode = "upstream" | "refused" | "invalid_output" | "timeout";

export class AiError extends Error {
  readonly code: AiErrorCode;
  readonly status: number | undefined;

  constructor(code: AiErrorCode, message: string, status?: number) {
    super(message);
    this.name = "AiError";
    this.code = code;
    this.status = status;
  }
}

export interface AiUsage {
  readonly inputTokens: number;
  readonly outputTokens: number;
}

export interface StructuredRequest {
  /** Provider model ID. Always configuration, never hard-coded in product logic. */
  readonly model: string;
  /** Trusted instructions written by us. */
  readonly system: string;
  /** Untrusted content (e.g. what a visitor typed). Passed as data, never as instructions. */
  readonly user: string;
  readonly schemaName: string;
  /** JSON Schema the provider must conform to. */
  readonly schema: Record<string, unknown>;
  readonly maxOutputTokens: number;
  readonly signal?: AbortSignal;
}

export interface StructuredResult {
  /** Parsed JSON from the model. Still untrusted: callers validate it before use. */
  readonly data: unknown;
  readonly usage: AiUsage;
}

/** Provider abstraction: product logic depends on this, not on a vendor SDK. */
export interface AiProvider {
  readonly name: string;
  generateStructured(request: StructuredRequest): Promise<StructuredResult>;
}
