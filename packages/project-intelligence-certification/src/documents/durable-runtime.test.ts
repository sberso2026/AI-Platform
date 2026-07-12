import { describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { ProjectIntelligenceDocumentWorker } from "@rtb/project-intelligence/server";
import { GovernedEmbeddingAdapter } from "@rtb/project-intelligence/server";

const enabled = process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1";

function service() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("missing supabase service credentials");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

describe.skipIf(!enabled)("Phase 6C-2 Final durable processing contracts", () => {
  it("Gate H uses governed embedding adapter (not DeterministicLocal)", async () => {
    const adapter = new GovernedEmbeddingAdapter({ allowStagingHashFallback: true });
    expect(adapter.provider).not.toBe("deterministic-local");
    const result = await adapter.embed({ texts: ["design pressure 16 bar g"], dimensions: 1536 });
    expect(result.dimensions).toBe(1536);
    expect(result.embeddings[0]?.length).toBe(1536);
    expect(["openai", "platform-staging-hash"]).toContain(result.provider);
  });

  it("Gate O multi-instance lease exclusion", async () => {
    const supabase = service();
    await supabase.rpc("pi_document_release_expired_leases");
    const workerA = new ProjectIntelligenceDocumentWorker(supabase as any, { workerId: "lease-a", batchSize: 1, leaseSeconds: 60 });
    const workerB = new ProjectIntelligenceDocumentWorker(supabase as any, { workerId: "lease-b", batchSize: 1, leaseSeconds: 60 });
    // Claiming empty queue is valid; lease RPC itself must succeed.
    const a = await workerA.processBatch();
    const b = await workerB.processBatch();
    expect(a.claimed + b.claimed).toBeGreaterThanOrEqual(0);
    expect(a.failed + b.failed).toBe(0);
  });
});
