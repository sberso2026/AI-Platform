import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";

type PdfParseCtor = {
  setWorker: (src?: string) => string;
};

type PdfJsWorkerModule = {
  WorkerMessageHandler?: unknown;
};

function tryResolve(req: NodeRequire, specifier: string): string | null {
  try {
    const resolved = req.resolve(specifier);
    return existsSync(resolved) ? resolved : null;
  } catch {
    return null;
  }
}

export function resolvePdfJsWorkerFile(): string | null {
  const specifiers = [
    "pdfjs-dist/legacy/build/pdf.worker.mjs",
    "pdf-parse/dist/worker/pdf.worker.mjs",
    "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
  ];
  const requirers: NodeRequire[] = [];
  try {
    requirers.push(createRequire(import.meta.url));
  } catch {
    // Bundled serverless chunks may not resolve from import.meta.url.
  }
  try {
    requirers.push(createRequire(`${process.cwd()}/package.json`));
  } catch {
    // Ignore missing cwd package.json.
  }
  for (const req of requirers) {
    for (const specifier of specifiers) {
      const resolved = tryResolve(req, specifier);
      if (resolved) return resolved;
    }
  }
  return null;
}

/**
 * pdf.js Node disables real workers and fake-imports workerSrc.
 * Next/Vercel bundles pdf-parse into `.next/server/chunks`, so the default
 * `./pdf.worker.mjs` resolves to a missing sibling file. Load the worker
 * into `globalThis.pdfjsWorker` first so fake-worker setup skips that import.
 */
export async function configurePdfJsWorker(PDFParse: PdfParseCtor): Promise<string> {
  const globalScope = globalThis as typeof globalThis & { pdfjsWorker?: PdfJsWorkerModule };
  if (!globalScope.pdfjsWorker?.WorkerMessageHandler) {
    try {
      globalScope.pdfjsWorker = (await import("pdfjs-dist/legacy/build/pdf.worker.mjs")) as PdfJsWorkerModule;
    } catch {
      // File-URL setWorker remains the fallback when the module graph cannot load the worker.
    }
  }

  const workerFile = resolvePdfJsWorkerFile();
  if (workerFile) {
    return PDFParse.setWorker(pathToFileURL(workerFile).href);
  }
  if (globalScope.pdfjsWorker?.WorkerMessageHandler) {
    return "in-process-pdfjsWorker";
  }
  return PDFParse.setWorker();
}
