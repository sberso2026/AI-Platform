/**
 * Phase 8A — Engineering AI framework.
 * Modules consume shared AI interfaces; they must not ship independent AI stacks.
 */

export type EngineeringAiCapabilityId =
  | "knowledge_retrieval"
  | "evidence_grounding"
  | "citations"
  | "human_approval"
  | "cost_controls"
  | "prompt_registry"
  | "capability_registry";

export const ENGINEERING_AI_CAPABILITY_IDS: EngineeringAiCapabilityId[] = [
  "knowledge_retrieval",
  "evidence_grounding",
  "citations",
  "human_approval",
  "cost_controls",
  "prompt_registry",
  "capability_registry",
];

export interface EngineeringAiCapabilityDescriptor {
  id: EngineeringAiCapabilityId;
  name: string;
  description: string;
  requiresHumanApproval: boolean;
}

export const ENGINEERING_AI_CAPABILITIES: EngineeringAiCapabilityDescriptor[] = [
  {
    id: "knowledge_retrieval",
    name: "Knowledge Retrieval",
    description: "Retrieve engineering knowledge with tenant isolation",
    requiresHumanApproval: false,
  },
  {
    id: "evidence_grounding",
    name: "Evidence Grounding",
    description: "Ground answers in registered engineering evidence",
    requiresHumanApproval: false,
  },
  {
    id: "citations",
    name: "Citations",
    description: "Emit citations for grounded engineering answers",
    requiresHumanApproval: false,
  },
  {
    id: "human_approval",
    name: "Human Approval",
    description: "Force human review before consequential actions",
    requiresHumanApproval: true,
  },
  {
    id: "cost_controls",
    name: "Cost Controls",
    description: "Budget and token cost controls for AI usage",
    requiresHumanApproval: false,
  },
  {
    id: "prompt_registry",
    name: "Prompt Registry",
    description: "Shared prompt registry for Engineering modules",
    requiresHumanApproval: false,
  },
  {
    id: "capability_registry",
    name: "Capability Registry",
    description: "Shared AI capability registry for Engineering modules",
    requiresHumanApproval: false,
  },
];

export interface EngineeringAiFramework {
  listCapabilities(): EngineeringAiCapabilityDescriptor[];
  assertSharedStackOnly(moduleKey: string, implementsOwnAiStack: boolean): void;
}

export function createEngineeringAiFramework(): EngineeringAiFramework {
  return {
    listCapabilities: () => ENGINEERING_AI_CAPABILITIES,
    assertSharedStackOnly(moduleKey, implementsOwnAiStack) {
      if (implementsOwnAiStack) {
        throw new Error(
          `Module ${moduleKey} must consume Engineering AI framework — independent AI stacks are forbidden`,
        );
      }
    },
  };
}
