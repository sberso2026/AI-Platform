import type { BusinessAgentAuthorityLevel, BusinessRevenueAgentPassport } from "@rtb/types";
import { BUSINESS_DEVELOPMENT_AGENT_SLUG } from "@rtb/types";

export const BUSINESS_DEVELOPMENT_AGENT_PASSPORT: BusinessRevenueAgentPassport = {
  id: BUSINESS_DEVELOPMENT_AGENT_SLUG,
  name: "AI Business Development Agent",
  role: "AI Business Development Agent",
  purpose:
    "Review qualified opportunities and prepare internal research, engagement plans, outreach drafts, and proposal/pricing attention for human review. No external execution.",
  authorityMax: "A2",
  allowedTools: [
    "read_opportunity",
    "prepare_research_brief",
    "prepare_engagement_plan",
    "draft_communication",
    "draft_proposal_section",
    "identify_missing_qualification",
    "evaluate_pricing",
    "evaluate_bid",
  ],
  dataScope: [
    "tenant",
    "workspace",
    "growth_leads",
    "growth_opportunities",
    "revenue_engagement",
    "revenue_proposals",
    "revenue_pricing",
  ],
  prohibitedActions: [
    "external_send",
    "crm_write",
    "proposal_submit",
    "autonomous_approval",
    "contract_sign",
    "payment_execute",
    "scrape_bypass",
    "invent_contact",
    "invent_pricing",
    "invent_certification",
    "mark_requirement_satisfied_without_evidence",
  ],
  approvalRequirements: [
    "pricing_exception",
    "proposal_approval",
    "bid_decision",
    "communication_external",
    "engagement_approval",
  ],
  modelPolicy: {
    usesPlatformAiDirector: true,
    implementsOwnAiStack: false,
    noAutonomousApproval: true,
    externalWritesDisabled: true,
  },
  auditRequirements: ["all_drafts", "all_evaluations", "all_approvals"],
  killSwitch: { disabled: false },
  generatedContentMustRetainProvenance: true,
};

export type AgentActionKind = "read" | "recommend" | "prepare" | "send" | "approve_autonomous";

const ACTION_AUTHORITY: Record<AgentActionKind, BusinessAgentAuthorityLevel> = {
  read: "A0",
  recommend: "A1",
  prepare: "A2",
  send: "A3",
  approve_autonomous: "A4",
};

const AUTHORITY_RANK: Record<BusinessAgentAuthorityLevel, number> = {
  A0: 0,
  A1: 1,
  A2: 2,
  A3: 3,
  A4: 4,
};

export function requiredAuthority(action: AgentActionKind): BusinessAgentAuthorityLevel {
  return ACTION_AUTHORITY[action];
}

export function agentMay(
  action: AgentActionKind,
  passport: BusinessRevenueAgentPassport = BUSINESS_DEVELOPMENT_AGENT_PASSPORT,
): boolean {
  if (passport.killSwitch.disabled) return false;
  return AUTHORITY_RANK[ACTION_AUTHORITY[action]] <= AUTHORITY_RANK[passport.authorityMax];
}

export function assertAgentAction(
  action: AgentActionKind,
  passport: BusinessRevenueAgentPassport = BUSINESS_DEVELOPMENT_AGENT_PASSPORT,
): void {
  if (action === "send") throw new Error("external_send_forbidden");
  if (action === "approve_autonomous") throw new Error("autonomous_approval_forbidden");
  if (!agentMay(action, passport)) {
    throw new Error(`agent_authority_denied:${ACTION_AUTHORITY[action]}`);
  }
}

export function assertNotProhibited(
  action: string,
  passport: BusinessRevenueAgentPassport = BUSINESS_DEVELOPMENT_AGENT_PASSPORT,
): void {
  if (passport.prohibitedActions.includes(action)) {
    if (action === "external_send") throw new Error("external_send_forbidden");
    if (action === "autonomous_approval") throw new Error("autonomous_approval_forbidden");
    throw new Error(`agent_action_prohibited:${action}`);
  }
}
