/**
 * Document extract is untrusted input. It must never be typed as a system instruction.
 *
 * This is a **type-level trust boundary**, not a claim that prompt injection is solved.
 * The PI input adapter (ERA-2) wraps extracted text as UntrustedDocumentText only.
 */
export type UntrustedDocumentText = {
  readonly trust: "untrusted_document";
  readonly text: string;
};

export type SystemInstruction = {
  readonly trust: "system_instruction";
  readonly text: string;
};

export function asUntrustedDocumentText(text: string): UntrustedDocumentText {
  return { trust: "untrusted_document", text };
}

export function asSystemInstruction(text: string): SystemInstruction {
  return { trust: "system_instruction", text };
}

export function isUntrustedDocumentText(value: unknown): value is UntrustedDocumentText {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { trust?: unknown }).trust === "untrusted_document" &&
    typeof (value as { text?: unknown }).text === "string"
  );
}

export const DOCUMENT_TRUST_BOUNDARY = {
  documentTextIsUntrusted: true,
  promptInjectionSolved: false,
  extractedTextCannotAuthorizeActions: true,
  extractedTextCannotChangeTenantOrWorkspace: true,
  extractedTextCannotCloseFindings: true,
} as const;
