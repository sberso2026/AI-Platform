import { catalogNodeByKey, nodeKey, traverseThread } from "../digital-thread/traversal";
import type { ThreadAuthorization, ThreadCatalogNode, ThreadGraphInput, ThreadRelation } from "../digital-thread/types";
import { enabledAssuranceRules } from "./catalog";
import { fingerprintAssuranceCondition } from "./fingerprint";
import { isLowMaterialityInformational, mapObjectMateriality, maturityApplies } from "./maturity";
import type {
  AssuranceDetection,
  AssuranceEvaluationInput,
  AssuranceEvidenceStep,
  AssuranceMateriality,
  AssuranceRelatedObject,
  AssuranceRule,
  InterfaceInformationFact,
} from "./types";

const INCOMPLETE_INTERFACE_STATUSES = new Set(["REQUIRED", "REQUESTED", "INCOMPLETE", "REJECTED", "SUPERSEDED"]);
const MATERIAL_ASSUMPTION = new Set(["HIGH", "CRITICAL"]);

function authForGraph(input: AssuranceEvaluationInput): ThreadAuthorization {
  return {
    tenantId: input.tenantId,
    allowedWorkspaceIds: [input.workspaceId],
    role: "member",
    nodeAccess: new Map(
      input.graph.nodes
        .filter((node) => node.tenantId === input.tenantId && node.workspaceId === input.workspaceId)
        .map((node) => [nodeKey(node.objectType, node.objectId), { tenantId: node.tenantId, workspaceId: node.workspaceId }]),
    ),
  };
}

function inWorkspace(input: AssuranceEvaluationInput, node: ThreadCatalogNode): boolean {
  return node.tenantId === input.tenantId && node.workspaceId === input.workspaceId;
}

function label(graph: ThreadGraphInput, type: string, id: string): string {
  const node = catalogNodeByKey(graph.nodes, type, id);
  return node?.objectCode ?? id;
}

function digitalThreadPath(
  input: AssuranceEvaluationInput,
  auth: ThreadAuthorization,
  rootType: string,
  rootId: string,
  through?: { objectType: string; objectId: string },
): { steps: AssuranceEvidenceStep[]; text: string } {
  const traversal = traverseThread(
    input.graph,
    {
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      root: { objectType: rootType, objectId: rootId },
      direction: "both",
      maxDepth: 3,
    },
    auth,
  );
  const match = through
    ? traversal.paths.find((path) =>
        path.steps.some((step) => step.objectType === through.objectType && step.objectId === through.objectId),
      )
    : traversal.paths[0];
  const steps = (match?.steps ?? [{ objectType: rootType, objectId: rootId, depth: 0 }]).map((step) => ({
    objectType: step.objectType,
    objectId: step.objectId,
    objectCode: catalogNodeByKey(input.graph.nodes, step.objectType, step.objectId)?.objectCode ?? null,
    relationship: step.relationship ?? null,
  }));
  return {
    steps,
    text: steps
      .map((step) => `${step.objectType}:${step.objectCode ?? step.objectId}${step.relationship ? `(${step.relationship})` : ""}`)
      .join(" → "),
  };
}

function detection(
  input: AssuranceEvaluationInput,
  rule: AssuranceRule,
  opts: {
    root: ThreadCatalogNode;
    related?: ThreadCatalogNode | null;
    contextKey?: string | null;
    conditionType?: AssuranceDetection["conditionType"];
    explanation: string;
    wouldResolveIf: string;
    evidencePath: AssuranceEvidenceStep[];
    digitalThreadPath: string;
    relatedObjects: AssuranceRelatedObject[];
    materiality?: AssuranceMateriality;
    requiredByAt?: string | null;
    discipline?: string | null;
  },
): AssuranceDetection {
  const materiality = opts.materiality ?? mapObjectMateriality(opts.root.materiality);
  const fingerprint = fingerprintAssuranceCondition({
    ruleId: rule.ruleId,
    workspaceId: input.workspaceId,
    rootObjectType: opts.root.objectType,
    rootObjectId: opts.root.objectId,
    relatedObjectType: opts.related?.objectType ?? null,
    relatedObjectId: opts.related?.objectId ?? null,
    contextKey: opts.contextKey ?? null,
  });
  return {
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: opts.root.projectId ?? null,
    fingerprint,
    ruleId: rule.ruleId,
    ruleVersion: rule.ruleVersion,
    conditionCode: `${rule.ruleId}:${rule.ruleVersion}`,
    conditionType: opts.conditionType ?? rule.conditionType,
    assuranceDomain: rule.assuranceDomain,
    rootObjectType: opts.root.objectType,
    rootObjectId: opts.root.objectId,
    relatedObjectType: opts.related?.objectType ?? null,
    relatedObjectId: opts.related?.objectId ?? null,
    discipline: opts.discipline ?? opts.root.discipline ?? null,
    lifecycleStage: opts.root.status ?? null,
    materiality,
    explanation: opts.explanation,
    wouldResolveIf: opts.wouldResolveIf,
    evidencePath: opts.evidencePath,
    digitalThreadPath: opts.digitalThreadPath,
    relatedObjects: opts.relatedObjects,
    priorityFactors: {
      materiality,
      objectCriticality: mapObjectMateriality(opts.root.materiality),
      overdue: Boolean(opts.requiredByAt && Date.parse(opts.requiredByAt) < Date.parse(input.now ?? new Date().toISOString())),
      requiredByAt: opts.requiredByAt ?? null,
      ageDays: 0,
    },
    requiredByAt: opts.requiredByAt ?? null,
    contextKey: opts.contextKey ?? null,
  };
}

function linksFrom(graph: ThreadGraphInput, type: string, id: string, relationship?: string): ThreadRelation[] {
  return graph.links.filter(
    (link) => link.fromType === type && link.fromId === id && (!relationship || link.relationship === relationship),
  );
}

function linksTo(graph: ThreadGraphInput, type: string, id: string, relationship?: string): ThreadRelation[] {
  return graph.links.filter(
    (link) => link.toType === type && link.toId === id && (!relationship || link.relationship === relationship),
  );
}

function evaluateRequirement(input: AssuranceEvaluationInput, rule: AssuranceRule, node: ThreadCatalogNode, out: AssuranceDetection[]) {
  if (rule.ruleId !== "A8C-REQ-001" || !maturityApplies(node, rule.applicableMaturity)) return;
  const allocations = linksFrom(input.graph, "requirement", node.objectId, "ALLOCATED_TO");
  if (!allocations.length) {
    out.push(
      detection(input, rule, {
        root: node,
        explanation: `Requirement ${label(input.graph, node.objectType, node.objectId)} has no governed ALLOCATED_TO relationship.`,
        wouldResolveIf: "Add a governed ALLOCATED_TO relationship to a System, Asset, or Interface in this workspace.",
        evidencePath: [
          { objectType: node.objectType, objectId: node.objectId, objectCode: node.objectCode, note: "no ALLOCATED_TO" },
        ],
        digitalThreadPath: `${node.objectType}:${node.objectCode ?? node.objectId} (no ALLOCATED_TO)`,
        relatedObjects: [],
      }),
    );
    return;
  }
  for (const link of allocations) {
    const target = catalogNodeByKey(input.graph.nodes, link.toType, link.toId);
    if (!target || !inWorkspace(input, target)) {
      out.push(
        detection(input, rule, {
          root: node,
          related: target ?? {
            tenantId: input.tenantId,
            workspaceId: "inaccessible",
            objectType: link.toType,
            objectId: link.toId,
          },
          contextKey: `${link.toType}:${link.toId}`,
          conditionType: "TRACEABILITY_GAP",
          explanation: `Requirement ${label(input.graph, node.objectType, node.objectId)} is ALLOCATED_TO ${link.toType} ${link.toId}, which is not visible in the authorized workspace.`,
          wouldResolveIf: "Allocate to an authorized in-workspace target, or restore authorized access to the existing target.",
          evidencePath: [
            { objectType: "requirement", objectId: node.objectId, objectCode: node.objectCode, relationship: "ALLOCATED_TO" },
            { objectType: link.toType, objectId: link.toId, note: "target not visible in authorized workspace" },
          ],
          digitalThreadPath: `requirement:${node.objectCode ?? node.objectId} —ALLOCATED_TO→ ${link.toType}:${link.toId} (inaccessible)`,
          relatedObjects: [{ objectType: link.toType, objectId: link.toId, role: "inaccessible_allocation_target" }],
        }),
      );
    }
  }
}

function evaluateDecisionEvidence(input: AssuranceEvaluationInput, rule: AssuranceRule, node: ThreadCatalogNode, out: AssuranceDetection[]) {
  if (rule.ruleId !== "A8C-DEC-001" || !maturityApplies(node, rule.applicableMaturity)) return;
  if (isLowMaterialityInformational(node)) return;
  const supported = input.graph.links.some(
    (link) =>
      link.fromType === "decision" &&
      link.fromId === node.objectId &&
      (link.relationship === "SUPPORTED_BY" || link.relationship === "BASED_ON"),
  );
  if (supported) return;
  out.push(
    detection(input, rule, {
      root: node,
      explanation: `Decision ${label(input.graph, node.objectType, node.objectId)} has no governed SUPPORTED_BY or BASED_ON evidence.`,
      wouldResolveIf: "Link supporting Analysis Result, Assumption, or other governed evidence with SUPPORTED_BY or BASED_ON.",
      evidencePath: [
        { objectType: node.objectType, objectId: node.objectId, objectCode: node.objectCode, note: "no SUPPORTED_BY/BASED_ON" },
      ],
      digitalThreadPath: `${node.objectType}:${node.objectCode ?? node.objectId} (no supporting evidence)`,
      relatedObjects: [],
    }),
  );
}

function evaluateStaleDecision(
  input: AssuranceEvaluationInput,
  rule: AssuranceRule,
  node: ThreadCatalogNode,
  auth: ThreadAuthorization,
  out: AssuranceDetection[],
) {
  if (rule.ruleId !== "A8C-DEC-002" || !maturityApplies(node, rule.applicableMaturity)) return;
  const supports = linksFrom(input.graph, "decision", node.objectId, "SUPPORTED_BY").filter(
    (link) => link.toType === "analysis_result",
  );
  for (const link of supports) {
    const result = catalogNodeByKey(input.graph.nodes, "analysis_result", link.toId);
    if (!result || !inWorkspace(input, result) || result.stale !== true) continue;
    const reasons = (result.staleReasons ?? []).join(", ") || "canonical bounded-context staleness";
    const path = digitalThreadPath(input, auth, "decision", node.objectId, {
      objectType: "analysis_result",
      objectId: result.objectId,
    });
    const reqChange = result.staleReasons?.includes("STALE_REQUIREMENT_CHANGED")
      ? input.graph.links.find(
          (rel) =>
            rel.toType === "requirement" &&
            (rel.fromId === result.objectId || rel.fromId === result.provenance?.sourceAnalysisId),
        )
      : undefined;
    const evidence: AssuranceEvidenceStep[] = [
      { objectType: "decision", objectId: node.objectId, objectCode: node.objectCode, relationship: "SUPPORTED_BY" },
      {
        objectType: "analysis_result",
        objectId: result.objectId,
        objectCode: result.objectCode,
        note: `STALE because ${reasons}`,
      },
    ];
    if (reqChange) {
      evidence.push({
        objectType: reqChange.toType,
        objectId: reqChange.toId,
        objectCode: catalogNodeByKey(input.graph.nodes, reqChange.toType, reqChange.toId)?.objectCode,
        relationship: reqChange.relationship,
        note: "Requirement change that made the Analysis Result stale",
      });
    }
    out.push(
      detection(input, rule, {
        root: node,
        related: result,
        contextKey: result.objectId,
        explanation: `Active Decision ${label(input.graph, "decision", node.objectId)} is SUPPORTED_BY Analysis Result ${label(input.graph, "analysis_result", result.objectId)}, which is stale (${reasons}). This does not declare the Decision incorrect.`,
        wouldResolveIf: "Refresh or replace the supporting Analysis Result, or disposition this condition with engineering rationale.",
        evidencePath: evidence,
        digitalThreadPath: path.text || evidence.map((step) => `${step.objectType}:${step.objectCode ?? step.objectId}`).join(" → "),
        relatedObjects: [
          { objectType: "analysis_result", objectId: result.objectId, objectCode: result.objectCode, role: "stale_supporting_evidence" },
        ],
      }),
    );
  }
}

function evaluateAnalysisReview(input: AssuranceEvaluationInput, rule: AssuranceRule, node: ThreadCatalogNode, out: AssuranceDetection[]) {
  if (rule.ruleId !== "A8C-ANL-001" || !maturityApplies(node, rule.applicableMaturity)) return;
  const requiresReview =
    node.reviewRequired === true || String(node.acceptanceState ?? node.status ?? "").toUpperCase() === "UNREVIEWED";
  if (!requiresReview) return;
  const reviewed = linksTo(input.graph, "analysis_result", node.objectId, "REVIEWS").length > 0;
  if (reviewed) return;
  out.push(
    detection(input, rule, {
      root: node,
      conditionType: "ANALYSIS_RESULT_NOT_REVIEWED",
      explanation: `Analysis Result ${label(input.graph, node.objectType, node.objectId)} requires review but has no REVIEWS relation from a Review Package.`,
      wouldResolveIf: "Complete a governed Engineering Review Package that REVIEWS this Analysis Result.",
      evidencePath: [
        { objectType: node.objectType, objectId: node.objectId, objectCode: node.objectCode, note: "review required; no REVIEWS" },
      ],
      digitalThreadPath: `${node.objectType}:${node.objectCode ?? node.objectId} (no REVIEWS)`,
      relatedObjects: [],
    }),
  );
}

function evaluateStaleAcceptedAnalysis(input: AssuranceEvaluationInput, rule: AssuranceRule, node: ThreadCatalogNode, out: AssuranceDetection[]) {
  if (rule.ruleId !== "A8C-ANL-002" || !maturityApplies(node, rule.applicableMaturity)) return;
  const accepted = String(node.acceptanceState ?? node.status ?? "").toUpperCase() === "ACCEPTED";
  if (!accepted || node.stale !== true) return;
  const reasons = (node.staleReasons ?? []).join(", ") || "canonical bounded-context staleness";
  out.push(
    detection(input, rule, {
      root: node,
      explanation: `Accepted Analysis Result ${label(input.graph, node.objectType, node.objectId)} became stale (${reasons}). Analysis is not rerun by Assurance.`,
      wouldResolveIf: "Re-evaluate the Analysis Request with current inputs, or record a governed superseding result.",
      evidencePath: [
        { objectType: node.objectType, objectId: node.objectId, objectCode: node.objectCode, note: `ACCEPTED and STALE: ${reasons}` },
      ],
      digitalThreadPath: `${node.objectType}:${node.objectCode ?? node.objectId} STALE (${reasons})`,
      relatedObjects: [],
    }),
  );
}

function evaluateInterface(
  input: AssuranceEvaluationInput,
  rule: AssuranceRule,
  node: ThreadCatalogNode,
  facts: readonly InterfaceInformationFact[],
  out: AssuranceDetection[],
) {
  if (rule.ruleId !== "A8C-IFC-001" || !maturityApplies(node, rule.applicableMaturity)) return;
  const relevant = facts.filter((fact) => fact.interfaceId === node.objectId);
  for (const fact of relevant) {
    if (!INCOMPLETE_INTERFACE_STATUSES.has(fact.status)) continue;
    const crossDiscipline =
      Boolean(fact.sourceDiscipline && fact.receivingDiscipline && fact.sourceDiscipline !== fact.receivingDiscipline);
    const downstream = input.graph.links.filter(
      (link) =>
        (link.relationship === "DEPENDS_ON" || link.relationship === "BASED_ON" || link.relationship === "USES") &&
        link.toType === "interface" &&
        link.toId === node.objectId,
    );
    out.push(
      detection(input, rule, {
        root: node,
        contextKey: fact.informationKey,
        conditionType: crossDiscipline ? "CROSS_DISCIPLINE_INFORMATION_GAP" : "INCOMPLETE_INTERFACE_INFORMATION",
        discipline: fact.receivingDiscipline ?? node.discipline ?? null,
        explanation: `Interface ${label(input.graph, "interface", node.objectId)} information '${fact.informationKey}' is ${fact.status}${
          crossDiscipline ? ` (${fact.sourceDiscipline} → ${fact.receivingDiscipline})` : ""
        }. Missing information is not fabricated.`,
        wouldResolveIf: "Provide and accept the required interface information, or disposition this condition with engineering rationale.",
        evidencePath: [
          { objectType: "interface", objectId: node.objectId, objectCode: node.objectCode, note: `${fact.informationKey}=${fact.status}` },
          ...downstream.map((link) => ({
            objectType: link.fromType,
            objectId: link.fromId,
            objectCode: catalogNodeByKey(input.graph.nodes, link.fromType, link.fromId)?.objectCode,
            relationship: link.relationship,
            note: "downstream attention candidate; not declared invalid",
          })),
        ],
        digitalThreadPath: `interface:${node.objectCode ?? node.objectId} information:${fact.informationKey}=${fact.status}`,
        relatedObjects: downstream.map((link) => ({
          objectType: link.fromType,
          objectId: link.fromId,
          objectCode: catalogNodeByKey(input.graph.nodes, link.fromType, link.fromId)?.objectCode,
          role: "downstream_attention_candidate",
        })),
      }),
    );
  }
}

function evaluateChange(input: AssuranceEvaluationInput, rule: AssuranceRule, node: ThreadCatalogNode, out: AssuranceDetection[]) {
  if (rule.ruleId !== "A8C-CHG-001" || !maturityApplies(node, rule.applicableMaturity)) return;
  const affects = linksFrom(input.graph, "change", node.objectId, "AFFECTS");
  if (!affects.length) return;
  const confirmed = input.graph.nodes.some(
    (impact) =>
      impact.objectType === "impact" &&
      String(impact.status ?? "").toLowerCase() === "confirmed" &&
      input.graph.links.some(
        (link) =>
          (link.relationship === "CAUSED_BY" && link.fromType === "impact" && link.fromId === impact.objectId && link.toId === node.objectId) ||
          (link.relationship === "AFFECTS" && link.fromType === "impact" && link.fromId === impact.objectId),
      ),
  );
  if (confirmed) return;
  out.push(
    detection(input, rule, {
      root: node,
      explanation: `Change ${label(input.graph, "change", node.objectId)} has discovered downstream dependencies (AFFECTS) without a confirmed Impact. Discovered dependencies are not confirmed impacts.`,
      wouldResolveIf: "Complete governed impact assessment and record a confirmed Impact, or disposition this condition.",
      evidencePath: [
        { objectType: "change", objectId: node.objectId, objectCode: node.objectCode, relationship: "AFFECTS" },
        ...affects.map((link) => ({
          objectType: link.toType,
          objectId: link.toId,
          objectCode: catalogNodeByKey(input.graph.nodes, link.toType, link.toId)?.objectCode,
          relationship: "AFFECTS",
          note: "DISCOVERED_DEPENDENCY / unassessed candidate",
        })),
      ],
      digitalThreadPath: `change:${node.objectCode ?? node.objectId} —AFFECTS→ ${affects
        .map((link) => `${link.toType}:${link.toId}`)
        .join(", ")} (no confirmed Impact)`,
      relatedObjects: affects.map((link) => ({
        objectType: link.toType,
        objectId: link.toId,
        objectCode: catalogNodeByKey(input.graph.nodes, link.toType, link.toId)?.objectCode,
        role: "unassessed_downstream_dependency",
      })),
    }),
  );
}

function evaluateConfiguration(input: AssuranceEvaluationInput, rule: AssuranceRule, node: ThreadCatalogNode, out: AssuranceDetection[]) {
  if (rule.ruleId !== "A8C-CFG-001" || !maturityApplies(node, rule.applicableMaturity)) return;
  const proven = Boolean(node.provenance?.createdAt || node.provenance?.createdBy);
  if (proven) return;
  out.push(
    detection(input, rule, {
      root: node,
      explanation: `Configuration Item ${label(input.graph, node.objectType, node.objectId)} lacks required snapshot provenance (created_at / created_by). Snapshot evidence is not full historical reconstruction.`,
      wouldResolveIf: "Record captured_at and captured_by (or equivalent provenance) on the Configuration Item snapshot.",
      evidencePath: [
        { objectType: node.objectType, objectId: node.objectId, objectCode: node.objectCode, note: "missing created_at/created_by" },
      ],
      digitalThreadPath: `${node.objectType}:${node.objectCode ?? node.objectId} (missing provenance)`,
      relatedObjects: [],
    }),
  );
}

function evaluateAssumption(input: AssuranceEvaluationInput, rule: AssuranceRule, node: ThreadCatalogNode, now: string, out: AssuranceDetection[]) {
  if (rule.ruleId !== "A8C-AST-001" || !maturityApplies(node, rule.applicableMaturity)) return;
  const usedBy = [
    ...linksFrom(input.graph, "assumption", node.objectId, "USED_BY"),
    ...input.graph.links.filter(
      (link) =>
        (link.relationship === "BASED_ON" || link.relationship === "USES") &&
        link.toType === "assumption" &&
        link.toId === node.objectId,
    ),
  ];
  const activeUsers = usedBy.filter((link) => {
    const otherType = link.fromType === "assumption" ? link.toType : link.fromType;
    const otherId = link.fromType === "assumption" ? link.toId : link.fromId;
    const other = catalogNodeByKey(input.graph.nodes, otherType, otherId);
    if (!other || !inWorkspace(input, other)) return false;
    const status = String(other.status ?? "").toLowerCase();
    return status !== "superseded" && status !== "retired" && status !== "withdrawn" && other.superseded !== true;
  });
  if (!activeUsers.length) return;
  const invalidated = String(node.validationStatus ?? "").toLowerCase() === "invalidated";
  const expired = Boolean(node.expiresAt && Date.parse(node.expiresAt) < Date.parse(now));
  const materiality = mapObjectMateriality(node.materiality);
  if (!invalidated && !(expired && MATERIAL_ASSUMPTION.has(materiality))) return;
  const reason = invalidated ? "invalidated" : `expired at ${node.expiresAt}`;
  out.push(
    detection(input, rule, {
      root: node,
      related: catalogNodeByKey(
        input.graph.nodes,
        activeUsers[0].fromType === "assumption" ? activeUsers[0].toType : activeUsers[0].fromType,
        activeUsers[0].fromType === "assumption" ? activeUsers[0].toId : activeUsers[0].fromId,
      ),
      materiality,
      requiredByAt: node.expiresAt ?? null,
      explanation: `Assumption ${label(input.graph, "assumption", node.objectId)} is ${reason} while still referenced by active engineering objects. Downstream engineering is not automatically declared invalid.`,
      wouldResolveIf: "Replace, revalidate, or explicitly accept residual risk on the Assumption, and review referencing Decisions/Analyses.",
      evidencePath: [
        { objectType: "assumption", objectId: node.objectId, objectCode: node.objectCode, note: reason },
        ...activeUsers.map((link) => {
          const type = link.fromType === "assumption" ? link.toType : link.fromType;
          const id = link.fromType === "assumption" ? link.toId : link.fromId;
          return {
            objectType: type,
            objectId: id,
            objectCode: catalogNodeByKey(input.graph.nodes, type, id)?.objectCode,
            relationship: link.relationship,
            note: "active user; review candidate",
          };
        }),
      ],
      digitalThreadPath: `assumption:${node.objectCode ?? node.objectId} (${reason}) used by ${activeUsers.length} active object(s)`,
      relatedObjects: activeUsers.map((link) => {
        const type = link.fromType === "assumption" ? link.toType : link.fromType;
        const id = link.fromType === "assumption" ? link.toId : link.fromId;
        return {
          objectType: type,
          objectId: id,
          objectCode: catalogNodeByKey(input.graph.nodes, type, id)?.objectCode,
          role: "downstream_review_candidate",
        };
      }),
    }),
  );
}

function evaluateOptimizationEvidence(
  input: AssuranceEvaluationInput,
  rule: AssuranceRule,
  node: ThreadCatalogNode,
  out: AssuranceDetection[],
) {
  if (rule.ruleId !== "A8D-OPT-001" || !maturityApplies(node, rule.applicableMaturity)) return;
  const supports = input.graph.links.filter(
    (link) =>
      link.fromType === "decision" &&
      link.fromId === node.objectId &&
      (link.relationship === "SUPPORTED_BY" || link.relationship === "BASED_ON") &&
      link.toType === "optimization_run",
  );
  const incomplete = new Set(["queued", "running", "failed", "cancelled"]);
  for (const link of supports) {
    const run = catalogNodeByKey(input.graph.nodes, "optimization_run", link.toId);
    if (!run || !inWorkspace(input, run)) continue;
    const status = String(run.status ?? "").toLowerCase();
    if (run.stale !== true && !incomplete.has(status)) continue;
    const reason = run.stale ? (run.staleReasons ?? []).join(", ") || "optimization context stale" : `run status ${status}`;
    out.push(
      detection(input, rule, {
        root: node,
        related: run,
        contextKey: run.objectId,
        explanation: `Decision ${label(input.graph, "decision", node.objectId)} references Optimization Run ${label(input.graph, "optimization_run", run.objectId)} that is ${reason}. This does not select a winner or declare the Decision incorrect.`,
        wouldResolveIf: "Replace the Optimization Run with a current succeeded evaluation, or disposition this condition with engineering rationale.",
        evidencePath: [
          { objectType: "decision", objectId: node.objectId, objectCode: node.objectCode, relationship: link.relationship },
          { objectType: "optimization_run", objectId: run.objectId, objectCode: run.objectCode, note: reason },
        ],
        digitalThreadPath: `decision:${node.objectCode ?? node.objectId} —${link.relationship}→ optimization_run:${run.objectCode ?? run.objectId} (${reason})`,
        relatedObjects: [
          { objectType: "optimization_run", objectId: run.objectId, objectCode: run.objectCode, role: "stale_or_incomplete_optimization_evidence" },
        ],
      }),
    );
  }
}

function matchesFilter(detectionRow: AssuranceDetection, input: AssuranceEvaluationInput): boolean {
  if (input.ruleFilter && detectionRow.ruleId !== input.ruleFilter) return false;
  if (!input.objectFilter) return true;
  const { objectType, objectId } = input.objectFilter;
  if (detectionRow.rootObjectType === objectType && detectionRow.rootObjectId === objectId) return true;
  if (detectionRow.relatedObjectType === objectType && detectionRow.relatedObjectId === objectId) return true;
  return detectionRow.relatedObjects.some((rel) => rel.objectType === objectType && rel.objectId === objectId);
}

function evaluateInformation(
  input: AssuranceEvaluationInput,
  rule: AssuranceRule,
  node: ThreadCatalogNode,
  out: AssuranceDetection[],
) {
  const status = String(node.status ?? "").toUpperCase();
  const map: Record<string, { ruleId: string; conditionType: AssuranceDetection["conditionType"]; explanation: string }> = {
    CONFLICT: {
      ruleId: "A10A-INF-001",
      conditionType: "AMBIGUOUS_INFORMATION_AUTHORITY",
      explanation: `Engineering information ${label(input.graph, "engineering_information", node.objectId)} has competing governed sources for the same purpose. This is not a technical contradiction and is not a Finding.`,
    },
    AMBIGUOUS: {
      ruleId: "A10A-INF-001",
      conditionType: "AMBIGUOUS_INFORMATION_AUTHORITY",
      explanation: `Engineering information ${label(input.graph, "engineering_information", node.objectId)} has ambiguous authority. No automatic winner.`,
    },
    NO_AUTHORITATIVE_SOURCE: {
      ruleId: "A10A-INF-002",
      conditionType: "NO_AUTHORITATIVE_INFORMATION_SOURCE",
      explanation: `No authoritative information source resolved for ${label(input.graph, "engineering_information", node.objectId)}. Governance condition only.`,
    },
    NO_SOURCE: {
      ruleId: "A10A-INF-002",
      conditionType: "NO_AUTHORITATIVE_INFORMATION_SOURCE",
      explanation: `No information source is present for ${label(input.graph, "engineering_information", node.objectId)}.`,
    },
    SOURCE_STALE: {
      ruleId: "A10A-INF-003",
      conditionType: "STALE_AUTHORITATIVE_INFORMATION",
      explanation: `Authoritative information ${label(input.graph, "engineering_information", node.objectId)} is stale. Canonical stale reasons remain source-owned.`,
    },
    POLICY_NOT_CONFIGURED: {
      ruleId: "A10A-INF-004",
      conditionType: "INFORMATION_AUTHORITY_POLICY_MISSING",
      explanation: `No Information Authority Policy is configured for ${label(input.graph, "engineering_information", node.objectId)}.`,
    },
    SOURCE_SUPERSEDED: {
      ruleId: "A10A-INF-005",
      conditionType: "SUPERSEDED_INFORMATION_STILL_REFERENCED",
      explanation: `Superseded information ${label(input.graph, "engineering_information", node.objectId)} is still referenced. Decision reversal is not automatic.`,
    },
  };
  const match = map[status];
  if (!match || rule.ruleId !== match.ruleId) return;
  out.push(
    detection(input, rule, {
      root: node,
      conditionType: match.conditionType,
      explanation: match.explanation,
      wouldResolveIf: "Configure or disambiguate governed source authority. Do not treat this as engineering approval.",
      evidencePath: [{ objectType: "engineering_information", objectId: node.objectId, objectCode: node.objectCode, note: status }],
      digitalThreadPath: `engineering_information:${node.objectCode ?? node.objectId} (${status})`,
      relatedObjects: [],
    }),
  );
}

/** Deterministic Assurance evaluation over canonical Digital Thread data. Platform KG is not used. */
export function evaluateAssurance(input: AssuranceEvaluationInput): AssuranceDetection[] {
  const now = input.now ?? new Date().toISOString();
  const auth = authForGraph(input);
  const rules = enabledAssuranceRules(input.enabledRuleIds);
  const facts = input.interfaceInformation ?? [];
  const detections: AssuranceDetection[] = [];
  const workspaceNodes = input.graph.nodes.filter((node) => inWorkspace(input, node));

  for (const node of workspaceNodes) {
    for (const rule of rules) {
      if (!rule.applicableObjectTypes.includes(node.objectType)) continue;
      if (node.objectType === "requirement") evaluateRequirement(input, rule, node, detections);
      if (node.objectType === "decision") {
        evaluateDecisionEvidence(input, rule, node, detections);
        evaluateStaleDecision(input, rule, node, auth, detections);
      }
      if (node.objectType === "analysis_result") {
        evaluateAnalysisReview(input, rule, node, detections);
        evaluateStaleAcceptedAnalysis(input, rule, node, detections);
      }
      if (node.objectType === "interface") evaluateInterface(input, rule, node, facts, detections);
      if (node.objectType === "change") evaluateChange(input, rule, node, detections);
      if (node.objectType === "configuration_item") evaluateConfiguration(input, rule, node, detections);
      if (node.objectType === "assumption") evaluateAssumption(input, rule, node, now, detections);
      if (node.objectType === "decision") evaluateOptimizationEvidence(input, rule, node, detections);
      if (node.objectType === "engineering_information") evaluateInformation(input, rule, node, detections);
    }
  }

  const unique = new Map<string, AssuranceDetection>();
  for (const row of detections) {
    if (!matchesFilter(row, input)) continue;
    unique.set(row.fingerprint, row);
  }
  return [...unique.values()];
}
