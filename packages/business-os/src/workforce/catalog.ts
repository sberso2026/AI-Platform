import {
  BUSINESS_WORKFORCE_READ_TOOLS,
  type BusinessWorkforceAuthorityClass,
} from "@rtb/types";

export type WorkforceCatalogEntry = {
  slug: string;
  name: string;
  description: string;
  authority: BusinessWorkforceAuthorityClass;
  moduleCapability: string;
  toolAllowlist: readonly string[];
  contextScope: readonly string[];
  permissions: readonly string[];
  maxHandoffs: number;
  maxToolCalls: number;
  maxRuntimeMs: number;
  maxTokens: number;
  advisory: boolean;
};

export const BUSINESS_WORKFORCE_CATALOG: readonly WorkforceCatalogEntry[] = [
  {
    slug: "business-observer",
    name: "Business Observer",
    description: "Read-only observation of bounded BOS-10 context.",
    authority: "observe",
    moduleCapability: "business_context",
    toolAllowlist: BUSINESS_WORKFORCE_READ_TOOLS,
    contextScope: ["customer", "opportunity", "proposal", "work", "profit_fact", "risk", "decision", "action"],
    permissions: ["business_os.ai_workforce.view"],
    maxHandoffs: 1,
    maxToolCalls: 4,
    maxRuntimeMs: 15_000,
    maxTokens: 2_000,
    advisory: true,
  },
  {
    slug: "business-advisor",
    name: "Business Advisor",
    description: "Advisory recommendations over bounded BOS-10 context. Not execution.",
    authority: "recommend",
    moduleCapability: "ai_workforce",
    toolAllowlist: BUSINESS_WORKFORCE_READ_TOOLS,
    contextScope: ["customer", "opportunity", "proposal", "work", "profit_fact", "risk", "decision", "action"],
    permissions: ["business_os.ai_workforce.view"],
    maxHandoffs: 2,
    maxToolCalls: 6,
    maxRuntimeMs: 20_000,
    maxTokens: 3_000,
    advisory: true,
  },
  {
    slug: "business-preparer",
    name: "Business Preparer",
    description: "Prepares run-local drafts only. Does not mutate canonical BOS records.",
    authority: "prepare",
    moduleCapability: "ai_workforce",
    toolAllowlist: BUSINESS_WORKFORCE_READ_TOOLS,
    contextScope: ["customer", "opportunity", "proposal", "work", "decision", "action"],
    permissions: ["business_os.ai_workforce.view", "business_os.ai_workforce.run"],
    maxHandoffs: 2,
    maxToolCalls: 6,
    maxRuntimeMs: 20_000,
    maxTokens: 3_000,
    advisory: true,
  },
  {
    slug: "business-execution-requester",
    name: "Business Execution Requester",
    description: "Requests human-approved execution. Cannot approve itself or write canonical records.",
    authority: "request_execution",
    moduleCapability: "ai_workforce",
    toolAllowlist: BUSINESS_WORKFORCE_READ_TOOLS,
    contextScope: ["customer", "work", "decision", "action", "risk"],
    permissions: ["business_os.ai_workforce.view", "business_os.ai_workforce.run"],
    maxHandoffs: 1,
    maxToolCalls: 8,
    maxRuntimeMs: 30_000,
    maxTokens: 4_000,
    advisory: false,
  },
  {
    slug: "business-approved-executor",
    name: "Business Approved Executor",
    description: "Executes only after independent human approval. Demo authorizes no write tools.",
    authority: "execute_with_approval",
    moduleCapability: "ai_workforce",
    toolAllowlist: BUSINESS_WORKFORCE_READ_TOOLS,
    contextScope: ["customer", "work", "decision", "action"],
    permissions: ["business_os.ai_workforce.view", "business_os.ai_workforce.run"],
    maxHandoffs: 1,
    maxToolCalls: 8,
    maxRuntimeMs: 30_000,
    maxTokens: 4_000,
    advisory: false,
  },
];

export function catalogEntry(slug: string): WorkforceCatalogEntry | undefined {
  return BUSINESS_WORKFORCE_CATALOG.find((row) => row.slug === slug);
}

export function defaultAuthority(): BusinessWorkforceAuthorityClass {
  return "recommend";
}

export function authorityRequiresApproval(authority: BusinessWorkforceAuthorityClass): boolean {
  return authority === "request_execution" || authority === "execute_with_approval";
}

export function authorityIsAdvisory(authority: BusinessWorkforceAuthorityClass): boolean {
  return authority === "observe" || authority === "recommend" || authority === "prepare";
}

export function minAuthority(
  a: BusinessWorkforceAuthorityClass,
  b: BusinessWorkforceAuthorityClass,
): BusinessWorkforceAuthorityClass {
  const rank: Record<BusinessWorkforceAuthorityClass, number> = {
    observe: 0,
    recommend: 1,
    prepare: 2,
    request_execution: 3,
    execute_with_approval: 4,
  };
  return rank[a] <= rank[b] ? a : b;
}
