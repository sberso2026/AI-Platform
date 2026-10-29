export class EngineeringReviewError extends Error {
  readonly code: string;
  readonly details: Record<string, unknown>;

  constructor(code: string, message: string, details: Record<string, unknown> = {}) {
    super(message);
    this.name = "EngineeringReviewError";
    this.code = code;
    this.details = details;
  }
}

export function failClosed(
  code: string,
  message: string,
  details: Record<string, unknown> = {},
): never {
  throw new EngineeringReviewError(code, message, details);
}
