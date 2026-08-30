export class AiProjectAnalystError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly details: Record<string, unknown>;

  constructor(message: string, code: string, statusCode = 400, details: Record<string, unknown> = {}) {
    super(message);
    this.name = "AiProjectAnalystError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function analystQuestionRequired(): AiProjectAnalystError {
  return new AiProjectAnalystError("question is required", "analyst_question_required", 400);
}

export function analystProjectRequired(): AiProjectAnalystError {
  return new AiProjectAnalystError("projectId is required", "analyst_project_required", 400);
}

export function analystInjectionRefused(): AiProjectAnalystError {
  return new AiProjectAnalystError(
    "Project content and user text cannot override analyst policy.",
    "analyst_injection_refused",
    400,
    { refused: true },
  );
}
