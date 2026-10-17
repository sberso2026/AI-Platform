import type { D1fR1TopologyInput, D1fR2EvaluationInput, StructuralStandardContext } from "@rtb/types";
import { evaluateConnectionInterface, type D1fR4ConnectionInput, type D1fR4ConnectionResult } from "./connection-interface";
import { evaluateFoundationInterface, type D1fR5FoundationInput, type D1fR5FoundationResult } from "./foundation-interface";
import { evaluateAnalysisResultBinding, type D1fR2BindingResult } from "./result-binding";
import { evaluateStructuralSystemTopology } from "./runtime";
import { evaluateSystemMemberPlan, type D1fR3EvaluationInput, type D1fR3SystemResult } from "./system-evaluation";

export type D1fR6FixtureInput = {
  topology: D1fR1TopologyInput;
  analyses: readonly D1fR2EvaluationInput[];
  standardContext: StructuralStandardContext | null;
  evaluation: D1fR3EvaluationInput;
  connection: D1fR4ConnectionInput;
  foundation: D1fR5FoundationInput;
  alignFingerprints: boolean;
  linkResultFingerprints: boolean;
};

export type D1fR6Chain = {
  topologyFingerprint: string;
  analyses: readonly D1fR2BindingResult[];
  system: D1fR3SystemResult;
  connection: D1fR4ConnectionResult;
  foundation: D1fR5FoundationResult;
  crossProjectRejected: boolean;
  crossTenantRejected: boolean;
  crossWorkspaceRejected: boolean;
  topologyInvalidated: boolean;
  resultInvalidated: boolean;
  chainGoverning: boolean;
  provenance: readonly string[];
};

export function executeD1fCloseoutFixture(input: D1fR6FixtureInput): D1fR6Chain {
  const topology = evaluateStructuralSystemTopology(input.topology);
  const crossProjectRejected = [input.evaluation.plan.projectId, input.connection.projectId, input.foundation.projectId, ...input.analyses.map((row) => row.projectId)]
    .some((projectId) => projectId !== input.topology.projectId);
  const crossTenantRejected = input.analyses.some((row) => row.tenantId !== input.topology.tenantId);
  const crossWorkspaceRejected = input.analyses.some((row) => row.workspaceId !== input.topology.workspaceId);
  const fingerprint = input.alignFingerprints ? topology.topologyFingerprint : null;
  const analyses = input.analyses.map((row) => evaluateAnalysisResultBinding(
    fingerprint ? { ...row, sourceTopologyFingerprint: fingerprint, currentTopologyFingerprint: fingerprint } : {
      ...row,
      currentTopologyFingerprint: topology.topologyFingerprint,
    },
    input.standardContext,
  ));
  const byMember = new Map(analyses.map((row, index) => [input.analyses[index]?.physicalMemberId ?? row.physicalMemberId, { row, index }]));
  const evaluation: D1fR3EvaluationInput = {
    ...input.evaluation,
    currentTopologyFingerprint: fingerprint ?? input.evaluation.currentTopologyFingerprint,
    plan: { ...input.evaluation.plan, topologyFingerprint: fingerprint ?? input.evaluation.plan.topologyFingerprint },
    bindings: input.evaluation.bindings.map((binding) => {
      const match = byMember.get(binding.physicalMemberId);
      if (!match) return binding;
      const resultMismatch = input.linkResultFingerprints ? false : binding.resultSetFingerprint !== match.row.resultSetFingerprint;
      return {
        ...binding,
        topologyFingerprint: fingerprint ?? binding.topologyFingerprint,
        analysisModelFingerprint: match.row.analysisModelFingerprint,
        analysisRunFingerprint: match.row.analysisRunFingerprint,
        resultSetFingerprint: input.linkResultFingerprints ? match.row.resultSetFingerprint : binding.resultSetFingerprint,
        bindingFingerprint: input.linkResultFingerprints ? match.row.bindingFingerprint : binding.bindingFingerprint,
        completenessState: resultMismatch || match.row.completenessState === "STALE"
          ? "STALE"
          : match.row.canGovern ? binding.completenessState : "INCOMPLETE",
        authority: binding.authority,
      };
    }),
  };
  const system = evaluateSystemMemberPlan(evaluation);
  const connection = evaluateConnectionInterface({
    ...input.connection,
    currentTopologyFingerprint: fingerprint ?? topology.topologyFingerprint,
    physicalConnection: {
      ...input.connection.physicalConnection,
      topologyFingerprint: fingerprint ?? input.connection.physicalConnection.topologyFingerprint,
    },
    endActions: input.connection.endActions.map((action, index) => {
      const match = analyses[index] ?? analyses[0];
      const resultMismatch = Boolean(match) && !input.linkResultFingerprints && action.resultSetFingerprint !== match?.resultSetFingerprint;
      return {
        ...action,
        topologyFingerprint: fingerprint ?? action.topologyFingerprint,
        resultSetFingerprint: input.linkResultFingerprints && match ? match.resultSetFingerprint : action.resultSetFingerprint,
        bindingFingerprint: input.linkResultFingerprints && match ? match.bindingFingerprint : action.bindingFingerprint,
        analysisModelFingerprint: match ? match.analysisModelFingerprint : action.analysisModelFingerprint,
        completenessState: resultMismatch ? "STALE" : action.completenessState,
      };
    }),
  });
  const foundation = evaluateFoundationInterface({
    ...input.foundation,
    currentTopologyFingerprint: fingerprint ?? topology.topologyFingerprint,
    foundation: { ...input.foundation.foundation, topologyFingerprint: fingerprint ?? input.foundation.foundation.topologyFingerprint },
    reactions: input.foundation.reactions.map((reaction, index) => {
      const match = analyses[index] ?? analyses[0];
      const resultMismatch = Boolean(match) && !input.linkResultFingerprints && reaction.resultSetFingerprint !== match?.resultSetFingerprint;
      return {
        ...reaction,
        topologyFingerprint: fingerprint ?? reaction.topologyFingerprint,
        completenessState: resultMismatch ? "STALE" : reaction.completenessState,
      };
    }),
  });
  const topologyInvalidated = !input.alignFingerprints && input.analyses.some((row) => row.sourceTopologyFingerprint !== topology.topologyFingerprint);
  const resultInvalidated = !input.linkResultFingerprints && input.evaluation.bindings.some((binding, index) => {
    const match = byMember.get(binding.physicalMemberId);
    return Boolean(match) && binding.resultSetFingerprint !== analyses[index]?.resultSetFingerprint && binding.resultSetFingerprint !== match?.row.resultSetFingerprint;
  });
  const chainGoverning = !crossProjectRejected && !crossTenantRejected && !crossWorkspaceRejected && !topologyInvalidated && !resultInvalidated
    && topology.completenessState === "TOPOLOGY_COMPLETE_FOR_DECLARED_SCOPE"
    && analyses.every((row) => row.canGovern)
    && system.executedMemberCount === system.requiredMemberCount
    && system.members.some((member) => member.capabilityId === "D1D_EU_TENSION" && member.state === "MEMBER_SATISFIED_FOR_DECLARED_BOUNDED_SCOPE")
    && system.members.some((member) => member.capabilityId === "D1E_C9_BEAM" && member.underlyingResult !== null)
    && connection.completenessState === "CONNECTION_INTERFACE_COMPLETE_FOR_DECLARED_SCOPE"
    && foundation.completenessState === "FOUNDATION_INTERFACE_COMPLETE_FOR_DECLARED_SCOPE";
  return {
    topologyFingerprint: topology.topologyFingerprint,
    analyses,
    system,
    connection,
    foundation,
    crossProjectRejected,
    crossTenantRejected,
    crossWorkspaceRejected,
    topologyInvalidated: topologyInvalidated || system.overallState === "SYSTEM_STALE" || connection.completenessState === "CONNECTION_INTERFACE_STALE" || foundation.completenessState === "FOUNDATION_INTERFACE_STALE",
    resultInvalidated: resultInvalidated || system.members.some((member) => member.state === "MEMBER_STALE") || connection.completenessState === "CONNECTION_INTERFACE_STALE" || foundation.completenessState === "FOUNDATION_INTERFACE_STALE",
    chainGoverning,
    provenance: [
      topology.structuralSystemId,
      topology.topologyFingerprint,
      ...analyses.flatMap((row) => [row.analysisModelId, row.analysisRunId, row.resultSetId, row.bindingId]),
      system.systemEvaluationId,
      ...system.members.flatMap((member) => member.provenance),
      connection.connectionInterfaceResultId,
      connection.forceTransfer?.forceTransferContextId ?? "force-transfer-missing",
      foundation.foundationInterfaceResultId,
      foundation.supportReactionContext.supportReactionContextId,
    ],
  };
}
