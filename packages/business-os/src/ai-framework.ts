/**
 * Business OS consumes Platform Intelligence (prompts, models, tools, policy).
 * It must not ship an independent AI stack.
 */
import { implementsOwnAiStack } from "./version";

export function assertSharedAiStackOnly(moduleKey = "business-os"): void {
  if (implementsOwnAiStack) {
    throw new Error(
      `Module ${moduleKey} must consume Platform Kernel AI Director — independent AI stacks are forbidden`,
    );
  }
}

export const BUSINESS_AI_DIRECTOR_POLICY = {
  usesPlatformAiDirector: true,
  usesPlatformPolicyEngine: true,
  usesPlatformToolRegistry: true,
  usesPlatformPromptRegistry: true,
  usesPlatformModelRegistry: true,
  noAutonomousApproval: true,
  externalWritesDisabled: true,
} as const;
