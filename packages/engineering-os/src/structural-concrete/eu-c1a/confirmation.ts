import type { EuC1aHumanConfirmationInput } from "@rtb/types";
import {
  AI_EN1992_EDITION_AUTHORITY,
  DEFAULT_EU_CONCRETE_NATIONAL_ANNEX,
  EU_C1A_HUMAN_ENGINEERING_CONFIRMATION_REQUIRED,
  EU_C1A_NATIONAL_ANNEX_INFERRED_FROM_LOCATION,
  EU_CONCRETE_NATIONAL_ANNEX_INFERRED_FROM_USER_LOCATION,
  LLM_MEMORY_ONLY_RULE_ALLOWED,
  SILENT_EN1992_EDITION_INFERENCE,
} from "@rtb/types";

export const EU_C1A_HUMAN_CONFIRMATION_TEMPLATE: Omit<
  EuC1aHumanConfirmationInput,
  "standardGeneration" | "standardEdition" | "amendmentState" | "corrigendumState" | "technicalBasisIdentifier" | "authoritySourceIdentifier" | "confirmerRef" | "confirmedAt"
> & {
  standardGeneration: null;
  standardEdition: null;
  amendmentState: null;
  corrigendumState: null;
  technicalBasisIdentifier: null;
  authoritySourceIdentifier: null;
  confirmerRef: null;
  confirmedAt: null;
} = {
  standardFamily: "EN 1992",
  standardPart: "EN_1992_1_1",
  standardGeneration: null,
  standardEdition: null,
  amendmentState: null,
  corrigendumState: null,
  technicalBasisIdentifier: null,
  authoritySourceIdentifier: null,
  confirmerRef: null,
  confirmedAt: null,
  nationalAnnexRef: null,
  ndpSetConfirmed: false,
  materialStandardsConfirmed: false,
  copyrightedStandardTextNotCommitted: true,
};

export const EU_C1A_HUMAN_INPUT_FIELDS = [
  "standardFamily",
  "standardPart",
  "standardGeneration",
  "standardEdition",
  "amendmentState",
  "corrigendumState",
  "technicalBasisIdentifier",
  "authoritySourceIdentifier",
] as const;

export function assertEuC1aHumanConfirmationContract(): void {
  if (!EU_C1A_HUMAN_ENGINEERING_CONFIRMATION_REQUIRED) throw new Error("human engineering confirmation must remain required");
  if (LLM_MEMORY_ONLY_RULE_ALLOWED) throw new Error("LLM_MEMORY_ONLY rules are forbidden");
  if (SILENT_EN1992_EDITION_INFERENCE || AI_EN1992_EDITION_AUTHORITY) {
    throw new Error("edition must not be inferred by AI or silently");
  }
  if (DEFAULT_EU_CONCRETE_NATIONAL_ANNEX || EU_C1A_NATIONAL_ANNEX_INFERRED_FROM_LOCATION || EU_CONCRETE_NATIONAL_ANNEX_INFERRED_FROM_USER_LOCATION) {
    throw new Error("National Annex must not be defaulted or inferred from location");
  }
}

export function assertHumanConfirmedEuC1aProfile(input: EuC1aHumanConfirmationInput | null): asserts input is EuC1aHumanConfirmationInput {
  assertEuC1aHumanConfirmationContract();
  if (!input) throw new Error("HUMAN_CONFIRMATION_REQUIRED");
  if (!input.confirmerRef || !input.confirmedAt) throw new Error("HUMAN_CONFIRMATION_REQUIRED: confirmer");
  if (!input.standardEdition || input.standardEdition === "UNKNOWN_PENDING_CONFIRMATION") {
    throw new Error("HUMAN_CONFIRMATION_REQUIRED: standardEdition");
  }
  if (input.standardGeneration !== "FIRST_GENERATION" && input.standardGeneration !== "SECOND_GENERATION") {
    throw new Error("HUMAN_CONFIRMATION_REQUIRED: standardGeneration");
  }
  if (!input.amendmentState || input.amendmentState === "UNKNOWN_PENDING_CONFIRMATION") {
    throw new Error("HUMAN_CONFIRMATION_REQUIRED: amendmentState");
  }
  if (!input.technicalBasisIdentifier || !input.authoritySourceIdentifier) {
    throw new Error("HUMAN_CONFIRMATION_REQUIRED: technical basis and authority source");
  }
  if (!input.copyrightedStandardTextNotCommitted) throw new Error("copyrighted EN 1992 text must not be committed");
}
