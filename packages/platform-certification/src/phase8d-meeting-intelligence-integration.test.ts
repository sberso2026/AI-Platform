/**
 * Phase 8D Meeting Intelligence integration unit tests.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  assertNoDuplicateDomainOwnership,
  ENGINEERING_DOMAIN_ENTITY_KINDS,
} from "@rtb/types";
import { defaultEngineeringModuleRegistry } from "@rtb/engineering-os";
import {
  MEETING_INGESTION_SOURCE_STATUS,
  MEETING_INTELLIGENCE_SHARED_SERVICES,
  MEETING_PROVIDER_NEUTRAL_CONTRACT,
  PROJECT_INTELLIGENCE_MODULE_KEY,
  assertMeetingFindingsHandoffCannotMutateCore,
  assertMeetingIntelligenceSharedServices,
  assertNoMeetingPrivateInfrastructure,
  assertProjectIntelligenceSharedStack,
  assertProviderNeutralMeetingReadiness,
  createMeetingFindingsHandoff,
} from "@rtb/project-intelligence";

const ROOT = resolve(import.meta.dirname, "../../..");

describe("Phase 8D Meeting Intelligence integration", () => {
  it("documents reconciliation, ownership, privacy and baselines", () => {
    expect(
      existsSync(resolve(ROOT, "docs/migration/PROJECT_INTELLIGENCE_MEETING_PHASE_8D_RECONCILIATION.md")),
    ).toBe(true);
    expect(
      existsSync(resolve(ROOT, "docs/architecture/PROJECT_INTELLIGENCE_MEETING_DATA_OWNERSHIP.md")),
    ).toBe(true);
    expect(
      existsSync(resolve(ROOT, "docs/security/PROJECT_INTELLIGENCE_MEETING_PRIVACY_RUNTIME.md")),
    ).toBe(true);
    expect(
      existsSync(resolve(ROOT, "docs/integrations/MICROSOFT_TEAMS_CONNECTOR_STATUS.md")),
    ).toBe(true);
    expect(
      existsSync(resolve(ROOT, "docs/integrations/MEETING_PROVIDER_STRATEGY.md")),
    ).toBe(true);
    expect(
      existsSync(resolve(ROOT, "docs/testing/PROJECT_INTELLIGENCE_MEETING_PRODUCTION_BASELINE.md")),
    ).toBe(true);
    const recon = readFileSync(
      resolve(ROOT, "docs/migration/PROJECT_INTELLIGENCE_MEETING_PHASE_8D_RECONCILIATION.md"),
      "utf8",
    );
    expect(recon.toLowerCase()).not.toMatch(/cortex/);
    expect(recon).toMatch(/Do not rebuild/i);
    expect(recon).toMatch(/conditionally_deferred/);
  });

  it("keeps meeting_intelligence registered under Project Intelligence", () => {
    const mod = defaultEngineeringModuleRegistry.get(PROJECT_INTELLIGENCE_MODULE_KEY)!;
    expect(mod.features?.some((f) => f.id === "meeting_intelligence")).toBe(true);
    expect(
      mod.features?.find((f) => f.id === "meeting_intelligence")?.capabilities?.some(
        (c) => c.id === "meeting.intelligence.read",
      ),
    ).toBe(true);
  });

  it("consumes shared Engineering services without private infrastructure", () => {
    expect(() => assertMeetingIntelligenceSharedServices()).not.toThrow();
    expect(() => assertProjectIntelligenceSharedStack()).not.toThrow();
    expect(() =>
      assertNoMeetingPrivateInfrastructure({
        implementsPrivateAudit: false,
        implementsPrivateNotification: false,
        implementsPrivateAiRuntime: false,
        implementsPrivateApprovalEngine: false,
      }),
    ).not.toThrow();
    expect(MEETING_INTELLIGENCE_SHARED_SERVICES.length).toBeGreaterThanOrEqual(10);
  });

  it("formalizes provider-neutral ingestion with Teams live deferred", () => {
    expect(() => assertProviderNeutralMeetingReadiness()).not.toThrow();
    expect(MEETING_PROVIDER_NEUTRAL_CONTRACT.productionTeamsProviderReady).toBe(false);
    expect(MEETING_INGESTION_SOURCE_STATUS.microsoft_teams_live).toBe("conditionally_deferred");
    expect(MEETING_INGESTION_SOURCE_STATUS.zoom).toBe("unavailable");
    expect(MEETING_INGESTION_SOURCE_STATUS.google_meet).toBe("unavailable");
  });

  it("forbids competing Engineering Core ownership", () => {
    expect(() =>
      assertNoDuplicateDomainOwnership(
        ENGINEERING_DOMAIN_ENTITY_KINDS.map((entity) => ({
          entity,
          owner: "engineering-os-core",
        })),
      ),
    ).not.toThrow();
  });

  it("emits typed Findings Intelligence handoff that cannot mutate Core", () => {
    const handoff = createMeetingFindingsHandoff({
      id: "mf1",
      meetingSessionId: "m1",
      title: "Finding",
      confidence: 0.6,
      transcriptReferences: ["s1"],
      traceId: "t1",
    });
    expect(() => assertMeetingFindingsHandoffCannotMutateCore(handoff)).not.toThrow();
    expect(handoff.mayMutateEngineeringCore).toBe(false);
  });

  it("exposes meeting-intelligence-ready inside Project Intelligence shell", () => {
    const page = readFileSync(
      resolve(
        ROOT,
        "apps/web/src/app/(platform)/engineering/apps/project-intelligence/meetings/page.tsx",
      ),
      "utf8",
    );
    const shell = readFileSync(
      resolve(ROOT, "apps/web/src/components/engineering/project-intelligence-shell.tsx"),
      "utf8",
    );
    expect(page).toContain('data-testid="meeting-intelligence-ready"');
    expect(page).toContain('data-testid="project-intelligence-meetings-ready"');
    expect(page).toMatch(/Teams live is not production-ready/i);
    expect(shell).toContain('data-testid="project-intelligence-shell"');
    expect(shell).toContain("Meeting Intelligence");
  });

  it("preserves durable processing and lifecycle markers", () => {
    const migration = readFileSync(
      resolve(
        ROOT,
        "supabase/migrations/20260714120000_batch_39_project_intelligence_meeting_processing.sql",
      ),
      "utf8",
    );
    const stateMachine = readFileSync(
      resolve(ROOT, "packages/project-intelligence/src/meetings/meeting-state-machine.ts"),
      "utf8",
    );
    const proposals = readFileSync(
      resolve(ROOT, "packages/project-intelligence/src/meetings/proposal-extraction-service.ts"),
      "utf8",
    );
    expect(migration).toMatch(/SKIP LOCKED/);
    expect(stateMachine).toMatch(/TRANSITIONS/);
    expect(proposals).toMatch(/createMeetingFindingsHandoff/);
  });
});
