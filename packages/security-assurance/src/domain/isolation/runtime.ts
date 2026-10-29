import { createSecurityAssuranceFoundation } from "../foundation";
import { IsolationAssuranceEngine } from "./engine";
import { IsolationProbeRegistry } from "./probe-registry";
import {
  DEFAULT_ISOLATION_RELEASE_GATE,
  evaluateReleaseGate,
  ISOLATION_EXECUTION_MODES,
} from "./release-gate";

export function createIsolationAssuranceRuntime() {
  const foundation = createSecurityAssuranceFoundation();
  const probes = new IsolationProbeRegistry();
  const engine = new IsolationAssuranceEngine(
    probes,
    foundation.evidence,
    foundation.findings,
    foundation.posture,
    foundation.timeline,
  );
  return {
    foundation,
    probes,
    engine,
    releaseGate: DEFAULT_ISOLATION_RELEASE_GATE,
    executionModes: ISOLATION_EXECUTION_MODES,
    evaluateReleaseGate,
    reuses: {
      ...foundation.reuses,
      enforcementAuthority: false,
      mutatesAuthorization: false,
      mutatesRls: false,
      implementsOwnAiStack: false,
      duplicateKnowledgeGraph: false,
      duplicateEventBus: false,
      duplicateExecutionHost: false,
      workflowEngine: true,
      isolationReviewAction: "security_assurance.isolation_review",
    },
  };
}

export type IsolationAssuranceRuntime = ReturnType<
  typeof createIsolationAssuranceRuntime
>;
