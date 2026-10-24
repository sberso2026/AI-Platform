/**
 * EOS-A8B forbids Platform KG writeback into Engineering Core.
 * Inferred / AI edges must not create engineering_object_links.
 */

export const GRAPH_WRITEBACK_TO_ENGINEERING_CORE = false;
export const AI_INFERRED_THREAD_EDGES = false;
export const PI_KG_DUAL_WRITE_ENGINEERING_THREAD = false;

export const PROHIBITED_WRITEBACK_TABLES = [
  "engineering_object_links",
] as const;

export const PROHIBITED_PI_KG_TABLES = [
  "project_intelligence_knowledge_nodes",
  "project_intelligence_knowledge_edges",
] as const;

export function assertProjectionSourceHasNoWriteback(source: string): void {
  const normalized = source.replace(/\s+/g, " ");
  if (/from\(\s*["']engineering_object_links["']\s*\)\.(insert|upsert)/.test(normalized)) {
    throw new Error("KG writeback to engineering_object_links is prohibited in EOS-A8B");
  }
  if (/from\(\s*["']project_intelligence_knowledge_(nodes|edges)["']\s*\)/.test(normalized)) {
    throw new Error("Engineering Digital Thread must not dual-write PI KG in EOS-A8B");
  }
}
