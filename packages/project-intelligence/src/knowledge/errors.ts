/**
 * Phase 8G — Knowledge Intelligence errors (nested HTTP contract codes).
 */
export class KnowledgeIntelligenceError extends Error {
  readonly code: string;
  readonly httpStatus: number;
  readonly details: Record<string, unknown>;

  constructor(
    code: string,
    message: string,
    httpStatus = 400,
    details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "KnowledgeIntelligenceError";
    this.code = code;
    this.httpStatus = httpStatus;
    this.details = details;
  }

  toNestedError(requestId: string) {
    return {
      error: {
        code: this.code,
        message: this.message,
        requestId,
        details: this.details,
      },
    };
  }
}
