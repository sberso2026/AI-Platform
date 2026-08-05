import { describe, expect, it } from "vitest";
import {
  MEETING_INGESTION_SOURCE_STATUS,
  MEETING_INTELLIGENCE_SHARED_SERVICES,
  MEETING_PROVIDER_NEUTRAL_CONTRACT,
  assertMeetingFindingsHandoffCannotMutateCore,
  assertMeetingIntelligenceSharedServices,
  assertNoMeetingPrivateInfrastructure,
  assertProviderNeutralMeetingReadiness,
  createMeetingFindingsHandoff,
} from "../src/index";

describe("Phase 8D meeting intelligence domain", () => {
  it("binds shared Engineering services without private stacks", () => {
    expect(() => assertMeetingIntelligenceSharedServices()).not.toThrow();
    expect(() =>
      assertNoMeetingPrivateInfrastructure({
        implementsPrivateAudit: false,
        implementsPrivateNotification: false,
        implementsPrivateAiRuntime: false,
        implementsPrivateApprovalEngine: false,
      }),
    ).not.toThrow();
    expect(MEETING_INTELLIGENCE_SHARED_SERVICES).toContain("audit");
    expect(MEETING_INTELLIGENCE_SHARED_SERVICES).toContain("notification");
    expect(MEETING_INTELLIGENCE_SHARED_SERVICES).toContain("document_references");
  });

  it("keeps provider-neutral readiness without Teams live", () => {
    expect(() => assertProviderNeutralMeetingReadiness()).not.toThrow();
    expect(MEETING_PROVIDER_NEUTRAL_CONTRACT.usableWithoutMicrosoftTeams).toBe(true);
    expect(MEETING_PROVIDER_NEUTRAL_CONTRACT.productionTeamsProviderReady).toBe(false);
    expect(MEETING_INGESTION_SOURCE_STATUS.manual_session).toBe("certified");
    expect(MEETING_INGESTION_SOURCE_STATUS.uploaded_transcript).toBe("certified");
    expect(MEETING_INGESTION_SOURCE_STATUS.microsoft_teams_fixture).toBe("certified");
    expect(MEETING_INGESTION_SOURCE_STATUS.microsoft_teams_live).toBe("conditionally_deferred");
    expect(MEETING_INGESTION_SOURCE_STATUS.uploaded_audio).not.toBe("certified");
    expect(MEETING_INGESTION_SOURCE_STATUS.uploaded_video).not.toBe("certified");
  });

  it("emits findings handoff that cannot mutate Core", () => {
    const handoff = createMeetingFindingsHandoff({
      id: "cand-m1",
      meetingSessionId: "mtg-1",
      title: "Site access conflict",
      confidence: 0.7,
      transcriptReferences: ["seg-1"],
      traceId: "trace-m1",
    });
    expect(() => assertMeetingFindingsHandoffCannotMutateCore(handoff)).not.toThrow();
    expect(handoff.mayMutateEngineeringCore).toBe(false);
    expect(handoff.targetFeatureKey).toBe("findings_intelligence");
  });
});
