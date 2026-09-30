import { describe, expect, it } from "vitest";
import { CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE } from "../digital-thread/fixture";
import type { CanonicalHarvestRecord } from "../lifecycle-intelligence/harvest";
import { composeDeliverableThread } from "./fingerprint";
import { resolveArtifactRevision, revisionResolutionExplanation } from "./revision";
import type { DeliverableArtifactBinding } from "./types";

function rec(
  objectType: string,
  objectId: string,
  state: string,
  fields: Record<string, unknown>,
  extra: Partial<CanonicalHarvestRecord> = {},
): CanonicalHarvestRecord {
  return {
    tenantId: CRUSHER_FEED_TENANT,
    workspaceId: CRUSHER_FEED_WORKSPACE,
    projectId: "proj-crusher-feed",
    objectType,
    objectId,
    state,
    fields,
    ...extra,
  };
}

function binding(overrides: Partial<DeliverableArtifactBinding> = {}): DeliverableArtifactBinding {
  return {
    id: "bind-1",
    tenantId: CRUSHER_FEED_TENANT,
    workspaceId: CRUSHER_FEED_WORKSPACE,
    expectationId: "exp-1",
    artifactClass: "document",
    artifactId: "DOC-D",
    artifactRole: "PRIMARY",
    revisionPolicy: "CURRENT_EFFECTIVE_REVISION",
    boundBy: "engineer-a1",
    boundAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("EOS-A9E revision fail-closed and Digital Thread provenance", () => {
  it("fails closed with a distinct explanation for missing and ambiguous current-effective revisions", () => {
    const missing = resolveArtifactRevision({
      binding: binding(),
      records: [],
    });
    expect(missing.resolved).toBe(false);
    expect(missing.resolutionFailure).toBe("missing_document");
    expect(revisionResolutionExplanation(missing.resolutionFailure)).toMatch(/No matching document family/);
    expect(revisionResolutionExplanation(missing.resolutionFailure)).toMatch(/Lexical revision ordering is not used/);

    const ambiguous = resolveArtifactRevision({
      binding: binding({ artifactId: "DOC-AMB" }),
      records: [
        rec("document", "doc-amb-c", "issued", { documentNumber: "DOC-AMB", revision: "C", status: "issued" }, { version: "C" }),
        rec("document", "doc-amb-10", "issued", { documentNumber: "DOC-AMB", revision: "10", status: "issued" }, { version: "10" }),
      ],
    });
    expect(ambiguous.resolved).toBe(false);
    expect(ambiguous.resolvedRevision).toBeNull();
    expect(ambiguous.resolutionFailure).toBe("ambiguous_effective_revision");
    expect(revisionResolutionExplanation(ambiguous.resolutionFailure)).toMatch(/ambiguous/);
    expect(ambiguous.resolvedRevision).not.toBe("10");
  });

  it("does not invent a latest revision by lexical comparison", () => {
    const exactMissing = resolveArtifactRevision({
      binding: binding({ revisionPolicy: "EXACT_REVISION", revisionRef: "Z" }),
      records: [
        rec("document", "doc-d-r1", "issued", { documentNumber: "DOC-D", revision: "1", status: "issued" }, { version: "1" }),
        rec("document", "doc-d-r2", "issued", { documentNumber: "DOC-D", revision: "2", status: "issued" }, { version: "2" }),
      ],
    });
    expect(exactMissing.resolved).toBe(false);
    expect(exactMissing.resolutionFailure).toBe("exact_revision_not_found");
    expect(exactMissing.resolvedRevision).not.toBe("2");
  });

  it("composes Digital Thread with resolved revision, status mapping, baseline membership, and assessment provenance", () => {
    const thread = composeDeliverableThread({
      projectId: "proj-crusher-feed",
      stage: "DETAILED_DESIGN",
      expectationId: "exp-1",
      definitionCode: "MECH-DS-FEED",
      assessmentId: "assess-1",
      artifactIds: ["DOC-D"],
      documentId: "DOC-D",
      revision: "1",
      statusMapping: "X3:FOR_CONSTRUCTION_USE:v2",
      baselineId: "feed-frozen",
      baselineMembership: "match",
    });
    expect(thread).toContain("document_revision:1");
    expect(thread).toContain("document_status_mapping:X3:FOR_CONSTRUCTION_USE:v2");
    expect(thread).toContain("configuration_baseline:feed-frozen");
    expect(thread).toContain("baseline_membership:match");
    expect(thread).toContain("deliverable_assessment:assess-1");
  });
});
