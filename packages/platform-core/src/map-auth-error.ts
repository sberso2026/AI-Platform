/**
 * Maps Supabase / Auth provider errors to user-facing copy.
 * Never expose raw provider messages to end users.
 */

export type AuthErrorLike = {
  message?: string | null;
  status?: number | string | null;
  code?: string | null;
  name?: string | null;
} | null | undefined;

export const AUTH_ERROR_MESSAGES = {
  invalidCredentials:
    "Incorrect email or password. Please check your details and try again.",
  accountOrPassword:
    "We couldn’t find an account with those details, or the password is incorrect.",
  missingEmail: "Please enter your email address.",
  missingPassword: "Please enter your password.",
  weakPassword:
    "Password is too weak. Use at least 8 characters with a mix of letters and numbers.",
  emailTaken: "An account with this email already exists. Try signing in instead.",
  emailNotConfirmed:
    "Please confirm your email address before signing in. Check your inbox for a confirmation link.",
  rateLimited: "Too many attempts. Please wait a moment and try again.",
  network: "Unable to reach the authentication service. Check your connection and try again.",
  fallback: "Something went wrong. Please try again.",
  recoveryDispatched:
    "If an account exists for that email, a reset link has been sent.",
} as const;

function normalize(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase().replace(/[_-]+/g, " ");
}

function isInvalidCredentials(code: string, message: string, status: string): boolean {
  if (
    code.includes("invalid login") ||
    code.includes("invalid credentials") ||
    code === "invalid credentials" ||
    code === "invalid_credentials"
  ) {
    return true;
  }
  if (
    message.includes("invalid login credentials") ||
    message.includes("invalid credentials") ||
    message.includes("email or password is incorrect") ||
    message.includes("invalid email or password")
  ) {
    return true;
  }
  // Auth API often returns 400 for bad password / unknown user
  if (status === "400" && (message.includes("credentials") || message.includes("invalid"))) {
    return true;
  }
  return false;
}

/**
 * Convert an Auth/provider error into a safe UI string.
 * Callers should log the original error separately for diagnostics.
 */
export function mapAuthError(error: AuthErrorLike, context: "signin" | "signup" | "reset" = "signin"): string {
  if (!error) return AUTH_ERROR_MESSAGES.fallback;

  const code = normalize(error.code ?? error.name);
  const message = normalize(error.message);
  const status = String(error.status ?? "").trim();

  if (!code && !message && !status) return AUTH_ERROR_MESSAGES.fallback;

  if (
    code.includes("user not found") ||
    message.includes("user not found") ||
    message.includes("no user found")
  ) {
    return AUTH_ERROR_MESSAGES.accountOrPassword;
  }

  if (isInvalidCredentials(code, message, status)) {
    return AUTH_ERROR_MESSAGES.invalidCredentials;
  }

  if (
    code.includes("email not confirmed") ||
    message.includes("email not confirmed") ||
    message.includes("confirm your email")
  ) {
    return AUTH_ERROR_MESSAGES.emailNotConfirmed;
  }

  if (
    message.includes("email") &&
    (message.includes("required") || message.includes("missing") || message.includes("empty"))
  ) {
    return AUTH_ERROR_MESSAGES.missingEmail;
  }

  if (
    (message.includes("password") &&
      (message.includes("required") || message.includes("missing") || message.includes("empty"))) ||
    code.includes("missing password")
  ) {
    return AUTH_ERROR_MESSAGES.missingPassword;
  }

  if (
    code.includes("weak password") ||
    message.includes("weak password") ||
    message.includes("password should be at least") ||
    message.includes("password is too short")
  ) {
    return AUTH_ERROR_MESSAGES.weakPassword;
  }

  if (
    code.includes("user already registered") ||
    code.includes("email exists") ||
    message.includes("user already registered") ||
    message.includes("already been registered") ||
    message.includes("email address is already")
  ) {
    return AUTH_ERROR_MESSAGES.emailTaken;
  }

  if (
    status === "429" ||
    code.includes("over request") ||
    message.includes("rate limit") ||
    message.includes("too many requests")
  ) {
    return AUTH_ERROR_MESSAGES.rateLimited;
  }

  if (
    message.includes("failed to fetch") ||
    message.includes("network") ||
    message.includes("fetch error")
  ) {
    return AUTH_ERROR_MESSAGES.network;
  }

  // Signup-specific unknown failures still get a generic message
  if (context === "signup" || context === "reset" || context === "signin") {
    return AUTH_ERROR_MESSAGES.fallback;
  }

  return AUTH_ERROR_MESSAGES.fallback;
}

/**
 * Log provider auth failure details for diagnostics.
 * Uses a plain string (not the Error object) so Next.js / Turbopack
 * does not surface AuthApiError call stacks in the browser overlay.
 */
export function logAuthError(context: string, error: unknown): void {
  if (typeof console === "undefined") return;
  if (process.env.NODE_ENV === "production") return;

  const err =
    error && typeof error === "object"
      ? (error as { message?: unknown; status?: unknown; code?: unknown; name?: unknown })
      : null;
  const summary = [
    `[auth:${context}]`,
    err?.name != null ? String(err.name) : null,
    err?.code != null ? `code=${String(err.code)}` : null,
    err?.status != null ? `status=${String(err.status)}` : null,
    err?.message != null ? String(err.message) : typeof error === "string" ? error : null,
  ]
    .filter(Boolean)
    .join(" ");

  // warn + string only — avoid console.error(Error) which Next overlays as a crash
  console.warn(summary || `[auth:${context}] auth failure`);
}
