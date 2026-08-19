import {
  BUSINESS_CONTEXT_GRAPH_ONTOLOGY_VERSION,
  type BusinessContextDataQuality,
  type BusinessContextDiagnosticFinding,
} from "@rtb/types";
import { identityFromContent, parseCanonicalRef } from "./identity";
import type { GraphSnapshot } from "./graph-port";

export function emptyQuality(): BusinessContextDataQuality {
  return {
    projectionFreshnessHours: null,
    sourceCoverageBps: 0,
    unresolvedRefs: 0,
    orphanRateBps: 0,
    relationshipEvidenceCoverageBps: 0,
    domainCoverage: [],
    staleProjections: 0,
    schemaVersionMismatches: 0,
  };
}

export function diagnoseSnapshot(input: {
  snapshot: GraphSnapshot;
  expectedSourceCount: number;
  unresolvedCount: number;
  staleAfterHours: number;
  now?: Date;
}): { findings: BusinessContextDiagnosticFinding[]; quality: BusinessContextDataQuality } {
  const now = input.now ?? new Date();
  const findings: BusinessContextDiagnosticFinding[] = [];
  const { snapshot } = input;
  const nodeIds = new Set(snapshot.nodes.map((n) => n.id));
  const refs = new Map<string, number>();
  const domains = new Set<string>();
  let stale = 0;
  let schemaMismatch = 0;
  let evidenced = 0;

  for (const node of snapshot.nodes) {
    const identity = identityFromContent(node.content ?? {}, node.title);
    if (!identity) {
      findings.push({
        code: "missing_source_entity",
        severity: "warning",
        message: `Node ${node.id} is missing canonical identity content`,
        repaired: false,
      });
      continue;
    }
    domains.add(identity.domain);
    const count = (refs.get(identity.canonicalRef) ?? 0) + 1;
    refs.set(identity.canonicalRef, count);
    if (count > 1) {
      findings.push({
        code: "duplicate_canonical_ref",
        severity: "critical",
        message: `Duplicate canonical ref ${identity.canonicalRef}`,
        canonicalRef: identity.canonicalRef,
        repaired: false,
      });
    }
    const parsed = parseCanonicalRef(identity.canonicalRef);
    if (parsed && parsed.tenantId !== identity.tenantId) {
      findings.push({
        code: "cross_tenant_violation",
        severity: "critical",
        message: "Canonical ref tenant does not match node identity",
        canonicalRef: identity.canonicalRef,
        repaired: false,
      });
    }
    if ((node.metadata?.ontologyVersion ?? identity.ontologyVersion) !== BUSINESS_CONTEXT_GRAPH_ONTOLOGY_VERSION) {
      schemaMismatch += 1;
      findings.push({
        code: "schema_version_mismatch",
        severity: "warning",
        message: `Schema version mismatch on ${identity.canonicalRef}`,
        canonicalRef: identity.canonicalRef,
        repaired: false,
      });
    }
    const hours = (now.getTime() - new Date(identity.effectiveAt).getTime()) / 3_600_000;
    if (Number.isFinite(hours) && hours > input.staleAfterHours) {
      stale += 1;
      findings.push({
        code: "stale_projection",
        severity: "watch",
        message: `Stale projection ${identity.canonicalRef}`,
        canonicalRef: identity.canonicalRef,
        repaired: false,
      });
    }
  }

  let orphanedRels = 0;
  for (const edge of snapshot.edges) {
    if (!nodeIds.has(edge.from_node_id) || !nodeIds.has(edge.to_node_id)) {
      orphanedRels += 1;
      findings.push({
        code: "orphaned_relationship",
        severity: "warning",
        message: `Orphaned relationship ${edge.id}`,
        repaired: false,
      });
      continue;
    }
    const meta = edge.metadata ?? {};
    if (meta.sourceDomain && meta.sourceEntityRef) evidenced += 1;
    else {
      findings.push({
        code: "unresolved_link",
        severity: "warning",
        message: `Relationship ${edge.id} is missing evidence`,
        repaired: false,
      });
    }
  }

  const connected = new Set<string>();
  for (const edge of snapshot.edges) {
    connected.add(edge.from_node_id);
    connected.add(edge.to_node_id);
  }
  let orphanedNodes = 0;
  for (const node of snapshot.nodes) {
    if (!connected.has(node.id) && snapshot.nodes.length > 1) {
      orphanedNodes += 1;
      findings.push({
        code: "orphaned_node",
        severity: "info",
        message: `Orphaned node ${node.title}`,
        canonicalRef: String(node.source_ref ?? ""),
        repaired: false,
      });
    }
  }

  if (input.unresolvedCount > 0) {
    findings.push({
      code: "unresolved_link",
      severity: "warning",
      message: `${input.unresolvedCount} unresolved relationship target(s)`,
      repaired: false,
    });
  }

  const coverage =
    input.expectedSourceCount <= 0
      ? 0
      : Math.round((snapshot.nodes.length / input.expectedSourceCount) * 10_000);
  const evidenceCoverage =
    snapshot.edges.length === 0 ? 10_000 : Math.round((evidenced / snapshot.edges.length) * 10_000);
  const orphanRate =
    snapshot.nodes.length === 0 ? 0 : Math.round((orphanedNodes / snapshot.nodes.length) * 10_000);
  const latest = snapshot.nodes
    .map((n) => String(n.content?.effectiveAt ?? n.updated_at ?? ""))
    .filter(Boolean)
    .sort()
    .at(-1);
  const freshnessHours = latest ? (now.getTime() - new Date(latest).getTime()) / 3_600_000 : null;

  return {
    findings,
    quality: {
      projectionFreshnessHours: freshnessHours === null || !Number.isFinite(freshnessHours) ? null : freshnessHours,
      sourceCoverageBps: Math.min(coverage, 10_000),
      unresolvedRefs: input.unresolvedCount + orphanedRels,
      orphanRateBps: orphanRate,
      relationshipEvidenceCoverageBps: evidenceCoverage,
      domainCoverage: [...domains].sort(),
      staleProjections: stale,
      schemaVersionMismatches: schemaMismatch,
    },
  };
}
