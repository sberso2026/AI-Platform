import { describe, expect, it } from "vitest";
import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE } from "../digital-thread/fixture";
import { EngineeringLifecycleService } from "../lifecycle-intelligence/service";
import { createMemoryCanonicalSource } from "../lifecycle-intelligence/harvest";
import { crusherCanonicalHarvestRecords, readyFeedEvidence } from "../lifecycle-intelligence/fixture";
import type { CanonicalHarvestBundle, CanonicalHarvestRecord } from "../lifecycle-intelligence/harvest";
import { EngineeringDeliverableService } from "./service";
import { createMemoryDeliverableStore } from "./memory-store";
import { A9C_INTERFACE_PACKAGE_CODE, A9C_STRUCTURAL_ANALYSIS_CODE } from "./fixture";
import { EXAMPLE_FEED_DELIVERABLE_DEFINITIONS } from "./catalog";
import { mapDocumentStatus } from "./status-mapping";

function commerce(action: "analysis.read" | "analysis.write" | "settings.write") {
  return createTestCommerceExecutionContext({
    tenantId: CRUSHER_FEED_TENANT,
    workspaceId: CRUSHER_FEED_WORKSPACE,
    policy: { productKey: "engineering-os", action, seatRequired: true },
  });
}

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

function withDocuments(bundle: CanonicalHarvestBundle, records: CanonicalHarvestRecord[]): CanonicalHarvestBundle {
  return { ...bundle, records: [...bundle.records, ...records] };
}

function revBundle(effective: "1" | "2", rawStatus = "issued"): CanonicalHarvestBundle {
  const base = crusherCanonicalHarvestRecords(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE);
  const docs: CanonicalHarvestRecord[] = [
    rec("document", "doc-d-r1", effective === "1" ? rawStatus : "superseded", {
      documentNumber: "DOC-D",
      revision: "1",
      status: effective === "1" ? rawStatus : "superseded",
    }, { version: "1", superseded: effective !== "1" }),
    rec("configuration_item", "ci-doc-d", "frozen", {
      baselineId: "feed-frozen",
      baselineStatus: "frozen",
      objectType: "document",
      objectId: "doc-d-r1",
      revisionRef: "1",
    }, { version: "1" }),
  ];
  if (effective === "2") {
    docs.push(
      rec("document", "doc-d-r2", rawStatus, {
        documentNumber: "DOC-D",
        revision: "2",
        status: rawStatus,
      }, { version: "2", superseded: false }),
    );
  }
  return withDocuments(base, docs);
}

describe("EOS-A9D Deliverable governance and document status", () => {
  const read = commerce("analysis.read");
  const write = commerce("analysis.write");
  const admin = commerce("settings.write");

  it("keeps templates non-authoritative until project adoption", async () => {
    const started = Date.now();
    const service = EngineeringDeliverableService.memoryForTests();
    const listed = await service.list(read, CRUSHER_FEED_TENANT, "proj-crusher-feed");
    expect(listed.expected).toEqual([]);
    expect(listed.templates.some((row) => row.code === A9C_STRUCTURAL_ANALYSIS_CODE && !row.adopted)).toBe(true);
    expect(listed.missing).toBe(0);
    const lifecycle = EngineeringLifecycleService.memoryForTests(
      undefined,
      createMemoryCanonicalSource(crusherCanonicalHarvestRecords(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE)),
      service,
    );
    const assignment = await lifecycle.assign(write, CRUSHER_FEED_TENANT, {
      projectId: "proj-crusher-feed",
      scopeType: "PROJECT",
      scopeId: "proj-crusher-feed",
      stage: "FEED",
      actorId: "engineer-a1",
    });
    const gate = await lifecycle.evaluateGate(write, CRUSHER_FEED_TENANT, {
      assignmentId: assignment.id,
      gateId: "FEED_EXIT",
      evidenceMode: "TEST_FIXTURE",
      evidence: readyFeedEvidence(),
    });
    expect(gate.criteria.find((row) => row.type === "REQUIRED_DELIVERABLES_PRESENT")?.applicability).toBe("NOT_APPLICABLE");
    expect(Date.now() - started).toBeLessThan(5000);
  });

  it("adopts a template into a project expectation without mutating the catalog", async () => {
    const service = EngineeringDeliverableService.memoryForTests();
    const before = service.catalog().definitions.length;
    await expect(service.adoptTemplate(write, CRUSHER_FEED_TENANT, {
      projectId: "proj-crusher-feed",
      code: A9C_STRUCTURAL_ANALYSIS_CODE,
      actorId: "engineer-a1",
    })).rejects.toThrow();
    const adopted = await service.adoptTemplate(admin, CRUSHER_FEED_TENANT, {
      projectId: "proj-crusher-feed",
      code: A9C_STRUCTURAL_ANALYSIS_CODE,
      actorId: "eng-admin",
    });
    expect(adopted.adoptedFromTemplate).toBe(true);
    expect(adopted.origin).toBe("PROJECT_CONFIGURATION");
    expect(service.catalog().definitions.length).toBe(before);
    const listed = await service.list(read, CRUSHER_FEED_TENANT, "proj-crusher-feed");
    expect(listed.expected).toHaveLength(1);
    expect(listed.templates.find((row) => row.code === A9C_STRUCTURAL_ANALYSIS_CODE)?.adopted).toBe(true);
  });

  it("creates a project-specific definition without changing global templates", async () => {
    const service = EngineeringDeliverableService.memoryForTests();
    const before = EXAMPLE_FEED_DELIVERABLE_DEFINITIONS.map((row) => row.code);
    const created = await service.createProjectExpectation(admin, CRUSHER_FEED_TENANT, {
      projectId: "proj-crusher-feed",
      actorId: "eng-admin",
      definition: {
        definitionId: "EOS-DLV-PROJ-SYN-001",
        definitionVersion: "v1",
        code: "PROJ-SYN-001",
        name: "Project-specific synthetic deliverable",
        purpose: "Synthetic A9D project definition",
        artifactClasses: ["document"],
        responsibleDiscipline: "PROCESS",
        contributingDisciplines: ["MECHANICAL"],
        lifecycleStages: ["FEED"],
        multidisciplinary: true,
        requiredRoles: ["PRIMARY"],
        coordinationRequired: false,
        analysisRequired: false,
        reviewRequired: true,
        traceabilityRequired: false,
        configurationRequired: false,
        rationale: "Not present in EXAMPLE catalog",
      },
    });
    expect(created.definition.origin).toBe("PROJECT_CONFIGURED");
    expect(created.expectation.definitionCode).toBe("PROJ-SYN-001");
    expect(EXAMPLE_FEED_DELIVERABLE_DEFINITIONS.map((row) => row.code)).toEqual(before);
  });

  it("maps synthetic project codes and leaves unknown and IFC-like codes UNMAPPED until configured", async () => {
    const service = EngineeringDeliverableService.memoryForTests();
    await service.configureStatusMapping(admin, CRUSHER_FEED_TENANT, {
      projectId: "proj-crusher-feed",
      sourceSystem: "project",
      rawStatusCode: "X1",
      semantic: "FOR_REVIEW",
      mappingVersion: "v1",
      actorId: "eng-admin",
    });
    await service.configureStatusMapping(admin, CRUSHER_FEED_TENANT, {
      projectId: "proj-crusher-feed",
      sourceSystem: "project",
      rawStatusCode: "X2",
      semantic: "FOR_COORDINATION",
      mappingVersion: "v1",
      actorId: "eng-admin",
    });
    await service.configureStatusMapping(admin, CRUSHER_FEED_TENANT, {
      projectId: "proj-crusher-feed",
      sourceSystem: "project",
      rawStatusCode: "X3",
      semantic: "FOR_CONSTRUCTION_USE",
      mappingVersion: "v1",
      actorId: "eng-admin",
    });
    const mapped = await service.getEffectiveStatusMapping(read, CRUSHER_FEED_TENANT, { projectId: "proj-crusher-feed", rawStatusCode: "X3" });
    expect(mapped.semantic).toBe("FOR_CONSTRUCTION_USE");
    const zz = await service.getEffectiveStatusMapping(read, CRUSHER_FEED_TENANT, { projectId: "proj-crusher-feed", rawStatusCode: "ZZ" });
    expect(zz.semantic).toBe("UNMAPPED");
    const ifc = await service.getEffectiveStatusMapping(read, CRUSHER_FEED_TENANT, { projectId: "proj-crusher-feed", rawStatusCode: "IFC" });
    expect(ifc.semantic).toBe("UNMAPPED");
    expect(mapDocumentStatus("IFC", []).semantic).toBe("UNMAPPED");
    await expect(service.configureStatusMapping(write, CRUSHER_FEED_TENANT, {
      rawStatusCode: "X9",
      semantic: "FOR_REVIEW",
      mappingVersion: "v1",
      sourceSystem: "project",
      actorId: "engineer-a1",
    })).rejects.toThrow();
  });

  it("resolves exact, current-effective, and baseline-pinned revisions from Document/Configuration authority", async () => {
    const bundle = revBundle("2");
    const service = EngineeringDeliverableService.memoryForTests(bundle);
    const expectation = await service.adoptTemplate(admin, CRUSHER_FEED_TENANT, {
      projectId: "proj-crusher-feed",
      code: "MECH-DS-FEED",
      purpose: "FOR_CONSTRUCTION_USE",
      actorId: "eng-admin",
    });
    const exact = await service.bind(write, CRUSHER_FEED_TENANT, {
      expectationId: expectation.id,
      artifactClass: "document",
      artifactId: "DOC-D",
      artifactRole: "PRIMARY",
      revisionRef: "1",
      revisionPolicy: "EXACT_REVISION",
      actorId: "engineer-a1",
    });
    expect(exact.revisionPolicy).toBe("EXACT_REVISION");
    const resolved = await service.resolveRevision(read, CRUSHER_FEED_TENANT, expectation.id, bundle);
    expect(resolved[0].policy).toBe("EXACT_REVISION");
    expect(resolved[0].resolvedRevision).toBe("1");

    const currentService = EngineeringDeliverableService.memoryForTests(bundle);
    const currentExp = await currentService.adoptTemplate(admin, CRUSHER_FEED_TENANT, {
      projectId: "proj-crusher-feed",
      code: "MECH-DS-FEED",
      actorId: "eng-admin",
    });
    await currentService.bind(write, CRUSHER_FEED_TENANT, {
      expectationId: currentExp.id,
      artifactClass: "document",
      artifactId: "DOC-D",
      artifactRole: "PRIMARY",
      revisionPolicy: "CURRENT_EFFECTIVE_REVISION",
      actorId: "engineer-a1",
    });
    const current = await currentService.resolveRevision(read, CRUSHER_FEED_TENANT, currentExp.id, bundle);
    expect(current[0].resolvedRevision).toBe("2");

    const pinnedService = EngineeringDeliverableService.memoryForTests(bundle);
    const pinnedExp = await pinnedService.adoptTemplate(admin, CRUSHER_FEED_TENANT, {
      projectId: "proj-crusher-feed",
      code: "MECH-DS-FEED",
      actorId: "eng-admin",
    });
    await pinnedService.bind(write, CRUSHER_FEED_TENANT, {
      expectationId: pinnedExp.id,
      artifactClass: "document",
      artifactId: "DOC-D",
      artifactRole: "PRIMARY",
      revisionPolicy: "BASELINE_PINNED_REVISION",
      actorId: "engineer-a1",
    });
    const pinned = await pinnedService.resolveRevision(read, CRUSHER_FEED_TENANT, pinnedExp.id, bundle);
    expect(pinned[0].resolvedRevision).toBe("1");
    expect(pinned[0].baselineRevisionMatch).toBe(true);
  });

  it("stales a current-effective assessment when Document domain changes the effective revision", async () => {
    const first = revBundle("1");
    const service = EngineeringDeliverableService.memoryForTests(first);
    const expectation = await service.adoptTemplate(admin, CRUSHER_FEED_TENANT, {
      projectId: "proj-crusher-feed",
      code: "MECH-DS-FEED",
      actorId: "eng-admin",
    });
    await service.bind(write, CRUSHER_FEED_TENANT, {
      expectationId: expectation.id,
      artifactClass: "document",
      artifactId: "DOC-D",
      artifactRole: "PRIMARY",
      revisionPolicy: "CURRENT_EFFECTIVE_REVISION",
      actorId: "engineer-a1",
    });
    const assessed = await service.evaluate(write, CRUSHER_FEED_TENANT, {
      expectationId: expectation.id,
      evidenceMode: "TEST_FIXTURE",
      bundle: first,
    });
    expect(assessed.assessment.stale).toBe(false);
    const second = await service.evaluate(write, CRUSHER_FEED_TENANT, {
      expectationId: expectation.id,
      evidenceMode: "TEST_FIXTURE",
      bundle: revBundle("2"),
    });
    const previous = await service.getDetail(read, CRUSHER_FEED_TENANT, expectation.id);
    expect(second.assessment.evidenceFingerprint).not.toBe(assessed.assessment.evidenceFingerprint);
    expect(previous?.latest?.id).toBe(second.assessment.id);
    const store = (service as unknown as { store: { getAssessment(id: string): Promise<{ stale: boolean; evidenceFingerprint: string } | null> } }).store;
    const historic = await store.getAssessment(assessed.assessment.id);
    expect(historic?.stale).toBe(true);
    expect(historic?.evidenceFingerprint).toBe(assessed.assessment.evidenceFingerprint);
  });

  it("fails closed for unmapped status and does not treat mapped construction status as approval", async () => {
    const bundle = withDocuments(revBundle("2"), [
      rec("document", "doc-zz", "issued", { documentNumber: "DOC-ZZ", revision: "1", status: "ZZ" }, { version: "1" }),
    ]);
    bundle.records = bundle.records.map((row) =>
      row.objectId === "doc-d-r2" ? { ...row, state: "ZZ", fields: { ...row.fields, status: "ZZ" } } : row,
    );
    const service = EngineeringDeliverableService.memoryForTests(bundle);
    const expectation = await service.adoptTemplate(admin, CRUSHER_FEED_TENANT, {
      projectId: "proj-crusher-feed",
      code: "MECH-DS-FEED",
      purpose: "FOR_CONSTRUCTION_USE",
      actorId: "eng-admin",
    });
    await service.bind(write, CRUSHER_FEED_TENANT, {
      expectationId: expectation.id,
      artifactClass: "document",
      artifactId: "DOC-D",
      artifactRole: "PRIMARY",
      revisionPolicy: "CURRENT_EFFECTIVE_REVISION",
      actorId: "engineer-a1",
    });
    const unmapped = await service.evaluate(write, CRUSHER_FEED_TENANT, {
      expectationId: expectation.id,
      evidenceMode: "TEST_FIXTURE",
      bundle,
    });
    expect(unmapped.assessment.dimensions.find((row) => row.dimension === "CONTENT")?.state).toBe("UNKNOWN");
    expect(unmapped.assessment.assuranceSignals.some((row) => row.conditionType === "UNMAPPED_REQUIRED_DOCUMENT_STATUS")).toBe(true);
    expect(unmapped.assessment.readiness).not.toBe("READY_FOR_CONFIGURED_PURPOSE");

    const ifcBundle = withDocuments(revBundle("2"), []);
    ifcBundle.records = ifcBundle.records.map((row) =>
      row.objectId === "doc-d-r2" ? { ...row, state: "IFC", fields: { ...row.fields, status: "IFC" } } : row,
    );
    const ifcEval = await service.evaluate(write, CRUSHER_FEED_TENANT, {
      expectationId: expectation.id,
      evidenceMode: "TEST_FIXTURE",
      bundle: ifcBundle,
    });
    expect(ifcEval.assessment.dimensions.find((row) => row.dimension === "CONTENT")?.actual).toContain("UNMAPPED");

    await service.configureStatusMapping(admin, CRUSHER_FEED_TENANT, {
      projectId: "proj-crusher-feed",
      sourceSystem: "project",
      rawStatusCode: "X3",
      semantic: "FOR_CONSTRUCTION_USE",
      mappingVersion: "v1",
      actorId: "eng-admin",
    });
    const mappedBundle = revBundle("2", "X3");
    mappedBundle.records = mappedBundle.records.map((row) =>
      row.objectId === "doc-d-r2" ? { ...row, state: "X3", fields: { ...row.fields, status: "X3" } } : row,
    );
    const mappedOnly = await service.evaluate(write, CRUSHER_FEED_TENANT, {
      expectationId: expectation.id,
      evidenceMode: "TEST_FIXTURE",
      bundle: mappedBundle,
    });
    expect(mappedOnly.assessment.dimensions.find((row) => row.dimension === "REVIEW")?.state).not.toBe("SATISFIED");
    expect(mappedOnly.assessment.readiness).not.toBe("READY_FOR_CONFIGURED_PURPOSE");

    await service.bind(write, CRUSHER_FEED_TENANT, {
      expectationId: expectation.id,
      artifactClass: "review_package",
      artifactId: "rev-feed-exit",
      artifactRole: "REVIEW",
      actorId: "engineer-a1",
    });
    const withReview = await service.evaluate(write, CRUSHER_FEED_TENANT, {
      expectationId: expectation.id,
      evidenceMode: "TEST_FIXTURE",
      bundle: mappedBundle,
    });
    expect(withReview.assessment.dimensions.find((row) => row.dimension === "CONFIGURATION")?.state).toBe("NOT_SATISFIED");

    const constructionReady = {
      ...mappedBundle,
      records: [
        ...mappedBundle.records.filter((row) => row.objectType !== "configuration_item"),
        rec("configuration_item", "ci-doc-d2", "frozen", {
          baselineId: "feed-frozen",
          baselineStatus: "frozen",
          objectType: "document",
          objectId: "doc-d-r2",
          revisionRef: "2",
        }, { version: "2" }),
      ],
    };
    const ready = await service.evaluate(write, CRUSHER_FEED_TENANT, {
      expectationId: expectation.id,
      evidenceMode: "TEST_FIXTURE",
      bundle: constructionReady,
    });
    expect(ready.assessment.readiness).toBe("READY_FOR_CONFIGURED_PURPOSE");
    expect(ready.humanApproved).toBe(false);
  });

  it("stales assessments when a status mapping version changes and keeps Review independent of document status", async () => {
    const bundle = crusherCanonicalHarvestRecords(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE);
    const service = EngineeringDeliverableService.memoryForTests(bundle);
    const expectation = await service.instantiate(write, CRUSHER_FEED_TENANT, {
      projectId: "proj-crusher-feed",
      code: A9C_STRUCTURAL_ANALYSIS_CODE,
      actorId: "engineer-a1",
    });
    await service.bind(write, CRUSHER_FEED_TENANT, {
      expectationId: expectation.id,
      artifactClass: "analysis_result",
      artifactId: "anl-struct",
      artifactRole: "PRIMARY",
      actorId: "engineer-a1",
    });
    const first = await service.evaluate(write, CRUSHER_FEED_TENANT, {
      expectationId: expectation.id,
      evidenceMode: "TEST_FIXTURE",
      bundle,
    });
    await service.configureStatusMapping(admin, CRUSHER_FEED_TENANT, {
      projectId: "proj-crusher-feed",
      sourceSystem: "project",
      rawStatusCode: "X1",
      semantic: "FOR_REVIEW",
      mappingVersion: "v1",
      actorId: "eng-admin",
    });
    await service.configureStatusMapping(admin, CRUSHER_FEED_TENANT, {
      projectId: "proj-crusher-feed",
      sourceSystem: "project",
      rawStatusCode: "X1",
      semantic: "FOR_CONSTRUCTION_USE",
      mappingVersion: "v2",
      actorId: "eng-admin",
    });
    const store = (service as unknown as { store: { getAssessment(id: string): Promise<{ stale: boolean } | null> } }).store;
    const historic = await store.getAssessment(first.assessment.id);
    expect(historic?.stale).toBe(true);
    expect(first.assessment.dimensions.find((row) => row.dimension === "REVIEW")?.state).toBe("NOT_SATISFIED");
  });

  it("does not let schedule completion or document status approve a lifecycle gate", async () => {
    const bundle = crusherCanonicalHarvestRecords(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE);
    const deliverables = EngineeringDeliverableService.memoryForTests(bundle);
    const expectation = await deliverables.adoptTemplate(admin, CRUSHER_FEED_TENANT, {
      projectId: "proj-crusher-feed",
      code: A9C_STRUCTURAL_ANALYSIS_CODE,
      scheduleStatus: "complete",
      actorId: "eng-admin",
    });
    const assessed = await deliverables.evaluate(write, CRUSHER_FEED_TENANT, {
      expectationId: expectation.id,
      evidenceMode: "TEST_FIXTURE",
      bundle,
    });
    expect(assessed.scheduleCompleteDoesNotSetMaturity).toBe(true);
    expect(assessed.assessment.readiness).toBe("INCOMPLETE");
    const lifecycle = EngineeringLifecycleService.memoryForTests(undefined, createMemoryCanonicalSource(bundle), deliverables);
    const assignment = await lifecycle.assign(write, CRUSHER_FEED_TENANT, {
      projectId: "proj-crusher-feed",
      scopeType: "PROJECT",
      scopeId: "proj-crusher-feed",
      stage: "FEED",
      actorId: "engineer-a1",
    });
    const gate = await lifecycle.evaluateGate(write, CRUSHER_FEED_TENANT, {
      assignmentId: assignment.id,
      gateId: "FEED_EXIT",
      evidenceMode: "TEST_FIXTURE",
      evidence: readyFeedEvidence(),
    });
    expect(gate.criteria.find((row) => row.type === "REQUIRED_DELIVERABLES_PRESENT")?.status).toBe("NOT_SATISFIED");
    expect(gate.readiness).not.toBe("READY_FOR_REVIEW");
  });

  it("preserves multidisciplinary ownership and Digital Thread through project status/revision governance", async () => {
    const bundle = crusherCanonicalHarvestRecords(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE);
    const service = EngineeringDeliverableService.memoryForTests(bundle);
    const expectation = await service.adoptTemplate(admin, CRUSHER_FEED_TENANT, {
      projectId: "proj-crusher-feed",
      code: A9C_INTERFACE_PACKAGE_CODE,
      actorId: "eng-admin",
    });
    await service.bind(write, CRUSHER_FEED_TENANT, {
      expectationId: expectation.id,
      artifactClass: "review_package",
      artifactId: "rev-feed-exit",
      artifactRole: "PRIMARY",
      actorId: "engineer-a1",
    });
    const assessed = await service.evaluate(write, CRUSHER_FEED_TENANT, {
      expectationId: expectation.id,
      evidenceMode: "TEST_FIXTURE",
      bundle,
    });
    expect(expectation.responsibleDiscipline).toBe("PROCESS");
    expect(expectation.contributingDisciplines).toEqual(expect.arrayContaining(["MECHANICAL", "STRUCTURAL"]));
    expect(assessed.assessment.digitalThread).toContain("deliverable_expectation:");
    expect(assessed.assessment.digitalThread).toContain("review_package:");
  });

  it("denies cross-workspace document binding without leaking hidden artifact fields", async () => {
    const chain: Record<string, unknown> = {};
    chain.select = () => chain;
    chain.eq = () => chain;
    chain.limit = () => ({ data: [], error: null });
    chain.insert = () => ({ error: null });
    const client = { from: () => chain };
    const service = new EngineeringDeliverableService(
      client as never,
      createMemoryDeliverableStore(),
      createMemoryCanonicalSource(crusherCanonicalHarvestRecords(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE)),
    );
    const expectation = await service.adoptTemplate(admin, CRUSHER_FEED_TENANT, {
      projectId: "proj-crusher-feed",
      code: "MECH-DS-FEED",
      actorId: "eng-admin",
    });
    await expect(
      service.bind(write, CRUSHER_FEED_TENANT, {
        expectationId: expectation.id,
        artifactClass: "document",
        artifactId: "hidden-ws-b-doc",
        artifactRole: "PRIMARY",
        actorId: "engineer-a1",
      }),
    ).rejects.toThrow("artifact_not_found");
  });
});
