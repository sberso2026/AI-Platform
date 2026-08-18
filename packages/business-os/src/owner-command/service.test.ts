import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@rtb/database";
import { AuditService } from "@rtb/platform-core";
import { createPlatformKernel } from "@rtb/platform-kernel";
import type { AgentRunResponse, BusinessKpi } from "@rtb/types";
import { computeBusinessHealth } from "./health";
import { OwnerCommandService } from "./service";

const kpi: BusinessKpi = {
  id: "k1",
  tenantId: "t",
  workspaceId: "w",
  key: "cash_runway_months",
  name: "Cash runway",
  category: "cash",
  unit: "months",
  value: 4.2,
  target: 9,
  warningThreshold: 6,
  criticalThreshold: 3,
  direction: "higher_is_better",
  status: "warning",
  measuredAt: "2026-08-18T09:00:00.000Z",
  sourceType: "demo",
  provenance: { live: false },
  isDemo: true,
  createdAt: "2026-08-18T09:00:00.000Z",
  updatedAt: "2026-08-18T09:00:00.000Z",
};

describe("OwnerCommandService daily brief", () => {
  const scope = {
    tenantId: "11111111-1111-4111-8111-111111111111",
    workspaceId: "22222222-2222-4222-8222-222222222222",
    userId: "33333333-3333-4333-8333-333333333333",
  };

  function service() {
    const supabase = { from: () => ({ insert: async () => ({ data: null, error: { message: "no" } }) }) } as unknown as SupabaseClient;
    const kernel = createPlatformKernel(supabase);
    const audit = new AuditService(supabase);
    const occ = new OwnerCommandService(supabase, kernel, audit);
    occ.repository.listKpis = async () => [kpi, { ...kpi, id: "k2", key: "b", status: "healthy", value: 1 }, { ...kpi, id: "k3", key: "c", status: "healthy", value: 1 }];
    occ.repository.listSignals = async () => [];
    occ.repository.listRecommendations = async () => [];
    occ.repository.listDecisions = async () => [];
    occ.repository.listActions = async () => [];
    return { occ, kernel };
  }

  it("requires a workspace", async () => {
    const { occ } = service();
    await expect(occ.brief({ tenantId: scope.tenantId, userId: scope.userId })).rejects.toThrow(
      "workspace_not_assigned",
    );
  });

  it("returns a deterministic brief when AI Director is unavailable", async () => {
    const { occ, kernel } = service();
    kernel.intelligence.policies.evaluate = vi.fn(async () => ({
      allowed: true,
      requiresReview: false,
      requiresApproval: false,
      actions: [],
      violations: [],
      evaluationIds: [],
    }));
    kernel.aiDirector.run = vi.fn(async () => {
      throw new Error("ai offline");
    });

    const result = await occ.brief(scope, { includeAi: true });
    expect(result.deterministic.health.overallStatus).toBe(computeBusinessHealth(await occ.repository.listKpis(scope)).overallStatus);
    expect(result.narrative?.unavailableReason).toBe("ai_director_unavailable");
    expect(result.narrative?.generatedBy).toBe("platform_ai_director");
    expect(result.narrative?.text).toBe("");
  });

  it("passes structured BOS evidence to AI Director and never uses a local model stack", async () => {
    const { occ, kernel } = service();
    kernel.intelligence.policies.evaluate = vi.fn(async () => ({
      allowed: true,
      requiresReview: false,
      requiresApproval: false,
      actions: [],
      violations: [],
      evaluationIds: [],
    }));
    kernel.aiDirector.run = vi.fn(async (request) => {
      expect(request.context?.evidence).toMatchObject({ kind: "business_os.daily_brief.evidence" });
      return {
        message: "Cash runway is in warning on demo evidence. Revenue is unknown.",
        requiresReview: true,
        run: {
          id: "run",
          tenant_id: scope.tenantId,
          agent_id: "director",
          status: "completed" as const,
          input: {},
          evidence_refs: [],
          requires_review: true,
          model_provider: "mock",
          model_name: "mock-director",
          created_at: "2026-08-18T09:00:00.000Z",
          updated_at: "2026-08-18T09:00:00.000Z",
        },
      } satisfies AgentRunResponse;
    });

    const result = await occ.brief(scope, { includeAi: true });
    expect(result.narrative?.text).toMatch(/demo evidence/i);
    expect(result.narrative?.modelProvenance).toBe("mock/mock-director");
    expect(result.narrative?.advisory).toBe(true);
    expect(kernel.aiDirector.run).toHaveBeenCalledOnce();
  });
});
