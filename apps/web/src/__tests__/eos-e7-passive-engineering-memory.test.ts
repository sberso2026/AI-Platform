/**
 * Phase E7 smoke — passive engineering memory exports + ownership lock.
 */
import { describe, expect, it } from "vitest";
import {
  PhaseE7PassiveMemoryComplete,
  PhaseE7NoSecondMemoryStore,
  PhaseE7ReusesPlatformMemory,
  EngineeringMemoryCaptureService,
  EngineeringMemoryRetrievalService,
  getPhaseE7Declaration,
  phaseE7Ready,
  duplicateMemoryFrameworkDetected,
  duplicateKnowledgeGraphDetected,
} from "@rtb/engineering-os";

describe("eos-e7-passive-engineering-memory", () => {
  it("exports E7 readiness and Platform Memory ownership lock", async () => {
    expect(phaseE7Ready).toBe(true);
    expect(PhaseE7PassiveMemoryComplete).toBe(true);
    expect(PhaseE7NoSecondMemoryStore).toBe(true);
    expect(PhaseE7ReusesPlatformMemory).toBe(true);
    expect(duplicateMemoryFrameworkDetected).toBe(false);
    expect(duplicateKnowledgeGraphDetected).toBe(false);
    expect(getPhaseE7Declaration().platformMemoryOwner).toBe("platform_kernel");

    const capture = new EngineeringMemoryCaptureService();
    const { record } = await capture.capture({
      tenantId: "t-web",
      projectId: "p1",
      subject: {
        objectType: "DECISION",
        objectId: "dec-web",
        tenantId: "t-web",
        projectId: "p1",
        authority: "ENGINEERING_OS",
        provenance: {
          sourceType: "decision",
          sourceId: "dec-web",
          mechanism: "SYSTEM",
          timestamp: new Date().toISOString(),
        },
      },
      summary: "Web smoke approved decision",
      evidenceRefs: ["dec-web"],
      sourceType: "decision",
      sourceId: "dec-web",
      authorityStatus: "APPROVED",
      createdBy: "u1",
      memoryClass: "PROJECT_MEMORY",
    });
    expect(record?.provenance.containsCot).toBe(false);

    const retrieval = new EngineeringMemoryRetrievalService(capture.getStore());
    const { hits } = await retrieval.retrieve({
      tenantId: "t-web",
      userId: "u1",
      projectId: "p1",
      query: "approved decision",
    });
    expect(hits.length).toBeGreaterThan(0);
  });
});
