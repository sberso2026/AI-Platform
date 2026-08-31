/** pdfjs-dist evaluates DOMMatrix at import time on Node serverless. */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const g = globalThis as typeof globalThis & { DOMMatrix?: unknown };
  if (typeof g.DOMMatrix === "undefined") {
    g.DOMMatrix = class DOMMatrix {};
  }
}
