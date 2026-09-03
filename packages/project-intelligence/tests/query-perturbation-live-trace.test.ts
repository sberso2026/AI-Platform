import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { DeterministicLocalEmbeddingAdapter } from "../src/documents/embedding-adapter";
import { InMemoryDocumentIndexAdapter } from "../src/documents/index-adapter";
import { planEngineeringQuery } from "../src/documents/query-plan";
import { ProjectIntelligenceDocumentRetrievalService } from "../src/documents/retrieval-service";

function loadEnv(file: string): Record<string, string> {
  const env: Record<string, string> = {};
  try {
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx < 1) continue;
      env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1).replace(/^"|"$/g, "");
    }
  } catch {
    return env;
  }
  return env;
}

const env = { ...loadEnv(resolve("../../apps/web/.env.local")), ...process.env };
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const TENANT = "8195e176-5f9f-449a-a1d3-2aedaf403989";
const WORKSPACE = "776aab04-e2eb-4a2a-855f-e04a81f0a0ce";
const CONVEYOR = "008ff87c-ede6-4007-b94d-480ef54a77e0";
const CONTROL = "what is the minimum sheet metal guard thickness";
const PERTURBED = "in the design of sheet metal guard, what is the minimum sheet metal guard thickness?";

const GOLD_BODY = /sheet metal guards shall be not less than 1\.5\s*mm thick/i;
const LIVE = process.env.RUN_LIVE_RETRIEVAL_TRACE === "1";

function isGold(row: Record<string, unknown>): boolean {
  return GOLD_BODY.test(String(row.content ?? ""));
}

describe("live conveyor query perturbation trace", () => {
  it.skipIf(!LIVE || !supabaseUrl || !serviceKey)("ranks the gold clause for control and perturbed queries on the live corpus", async () => {
    const rows: Array<Record<string, unknown>> = [];
    for (const range of ["0-999", "1000-1999"]) {
      const chunkRes = await fetch(
        `${supabaseUrl}/rest/v1/project_intelligence_document_chunks?tenant_id=eq.${TENANT}&workspace_id=eq.${WORKSPACE}&engineering_document_id=eq.${CONVEYOR}&deleted_at=is.null&select=stable_chunk_id,content,section_path,page_start,page_end,chunk_index,source_revision,engineering_project_id,block_type,content_hash`,
        { headers: { apikey: serviceKey!, Authorization: `Bearer ${serviceKey}`, Range: range } },
      );
      const page = await chunkRes.json() as Array<Record<string, unknown>>;
      if (Array.isArray(page)) rows.push(...page);
    }
    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBeGreaterThan(10);
    const goldIds = new Set(rows.filter((row) => isGold(row)).map((row) => String(row.stable_chunk_id)));
    expect(goldIds.size, "gold 5.2.1 body chunk missing from live corpus").toBeGreaterThan(0);
    const goldRow = rows.find((row) => isGold(row))!;
    const goldId = String(goldRow.stable_chunk_id);
    const revision = String(goldRow!.source_revision ?? rows[0]?.source_revision ?? "A");
    const projectId = String(goldRow!.engineering_project_id ?? rows[0]?.engineering_project_id ?? "");

    const rpc = async (query: string) => {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/pi_document_lexical_search`, {
        method: "POST",
        headers: {
          apikey: serviceKey!,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          p_tenant_id: TENANT,
          p_workspace_id: WORKSPACE,
          p_query: query,
          p_limit: 20,
          p_project_ids: null,
          p_document_ids: [CONVEYOR],
          p_revisions: null,
        }),
      });
      const data = await response.json();
      return Array.isArray(data) ? data as Array<Record<string, unknown>> : [];
    };

    const controlRpc = await rpc(CONTROL);
    const perturbedRpc = await rpc(PERTURBED);
    const rpcGoldRank = (hits: Array<Record<string, unknown>>) => {
      const idx = hits.findIndex((row) => isGold(row) || String(row.stable_chunk_id) === goldId);
      return idx < 0 ? null : idx + 1;
    };

    const index = new InMemoryDocumentIndexAdapter();
    const embedder = new DeterministicLocalEmbeddingAdapter();
    const embedded = await embedder.embed({ texts: rows.map((row) => String(row.content ?? "")) });
    await index.upsert(rows.map((row, offset) => ({
      id: String(row.stable_chunk_id),
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      engineeringDocumentId: CONVEYOR,
      engineeringProjectId: projectId,
      revision,
      processingVersion: "1",
      chunkIndex: Number(row.chunk_index ?? offset),
      stableChunkId: String(row.stable_chunk_id),
      content: String(row.content ?? ""),
      contentHash: String(row.content_hash ?? row.stable_chunk_id),
      sectionPath: row.section_path ? String(row.section_path) : undefined,
      pageStart: row.page_start == null ? undefined : Number(row.page_start),
      pageEnd: row.page_end == null ? undefined : Number(row.page_end),
      blockType: (row.block_type as "paragraph") ?? "paragraph",
      embedding: embedded.embeddings[offset],
    })));
    const service = new ProjectIntelligenceDocumentRetrievalService(index, embedder);
    const retrieve = (query: string) => service.retrieve(
      { tenantId: TENANT, workspaceId: WORKSPACE, allowedProjectIds: projectId ? [projectId] : [], authorized: true },
      { query, filters: { engineeringDocumentIds: [CONVEYOR], revisions: [revision] }, limit: 12, scoreThreshold: 0 },
    );
    const control = await retrieve(CONTROL);
    const perturbed = await retrieve(PERTURBED);
    const controlGold = control.candidates?.find((row) => goldIds.has(row.chunkId));
    const perturbedGold = perturbed.candidates?.find((row) => goldIds.has(row.chunkId));
    const selectedGold = (result: typeof control) => result.hits.some((hit) => goldIds.has(hit.chunk.stableChunkId) || GOLD_BODY.test(hit.chunk.content));
    expect(selectedGold(control)).toBe(true);
    expect(selectedGold(perturbed)).toBe(true);
    expect(planEngineeringQuery(PERTURBED).distinctiveTerms).not.toContain("design");

    const report = {
      tenant: TENANT,
      workspace: WORKSPACE,
      project_id: projectId,
      document_id: CONVEYOR,
      document_revision: revision,
      indexed_chunk_count: rows.length,
      gold_chunk_id: goldId,
      QUERY_PERTURBATION_ROOT_CAUSE: "lexical_conjunction_and_generic_term_fallback_flood",
      live_rpc_control_gold_rank: rpcGoldRank(controlRpc),
      live_rpc_perturbed_gold_rank: rpcGoldRank(perturbedRpc),
      live_rpc_control_hit_count: controlRpc.length,
      live_rpc_perturbed_hit_count: perturbedRpc.length,
      CONTROL_CORRECT_CHUNK_RANK: controlGold?.rank ?? null,
      PERTURBED_CORRECT_CHUNK_RANK: perturbedGold?.rank ?? null,
      CONTROL_CORRECT_CHUNK_SCORE: controlGold?.combinedScore ?? null,
      PERTURBED_CORRECT_CHUNK_SCORE: perturbedGold?.combinedScore ?? null,
      control_plan: control.queryPlan,
      perturbed_plan: perturbed.queryPlan,
      control_candidates: control.candidates,
      perturbed_candidates: perturbed.candidates,
      control_selected: control.hits.map((hit) => ({
        chunkId: hit.chunk.stableChunkId,
        section: hit.chunk.sectionPath,
        page: hit.chunk.pageStart,
        score: hit.score,
        source: hit.source,
      })),
      perturbed_selected: perturbed.hits.map((hit) => ({
        chunkId: hit.chunk.stableChunkId,
        section: hit.chunk.sectionPath,
        page: hit.chunk.pageStart,
        score: hit.score,
        source: hit.source,
      })),
      vector_attempted: control.vectorAttempted && perturbed.vectorAttempted,
      vector_hit_count: { control: control.vectorHitCount, perturbed: perturbed.vectorHitCount },
    };
    writeFileSync(resolve("../../docs/pilot/EOS-AI-DOC-2/query-perturbation-live-trace.json"), JSON.stringify(report, null, 2));
  }, 120_000);
});
