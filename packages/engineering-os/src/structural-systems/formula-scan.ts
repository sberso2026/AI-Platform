/**
 * Detects accidental structural-analysis or resistance implementations.
 * Prohibition prose in markdown is ignored. Executable tokens are not.
 */

const IMPLEMENTATION_TOKENS = [
  ["stiffness", "Matrix"].join(""),
  ["assemble", "Stiffness"].join(""),
  ["assemble", "Element"].join(""),
  ["p", "Delta"].join(""),
  ["eigen", "value"].join(""),
  ["modal", "Frequency"].join(""),
  ["shell", "Element"].join(""),
  ["plate", "Element"].join(""),
  ["resistance", "Formula"].join(""),
] as const;

function codeFences(markdown: string): string[] {
  const fences: string[] = [];
  const pattern = /```[\s\S]*?```/g;
  for (const match of markdown.matchAll(pattern)) fences.push(match[0]);
  return fences;
}

export function scanAnalysisFormulaBypass(path: string, source: string): string[] {
  const inspected = path.endsWith(".md") ? codeFences(source).join("\n") : source;
  return IMPLEMENTATION_TOKENS.filter((token) => inspected.includes(token)).map((token) => `${path}:${token}`);
}
