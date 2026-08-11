/**
 * Engineering Experience capability catalog (presentation + gating metadata).
 * Server entitlement checks remain authoritative.
 */

import {
  E1_EXPERIENCE_ROUTES,
  E1_SURFACE_CAPABILITY_GATES,
  filterVisiblePrimaryNavIds,
} from "@rtb/engineering-os";
import { ENGINEERING_CERTIFIED_V1_MODULES } from "./certified-modules";

export const ENGINEERING_EXPERIENCE_SURFACES = [
  {
    id: "home",
    navId: "eng-home",
    label: "Home",
    href: E1_EXPERIENCE_ROUTES.home,
    gate: E1_SURFACE_CAPABILITY_GATES.home,
  },
  {
    id: "ask",
    navId: "eng-ask",
    label: "Ask",
    href: E1_EXPERIENCE_ROUTES.ask,
    gate: E1_SURFACE_CAPABILITY_GATES.ask,
  },
  {
    id: "my",
    navId: "eng-my",
    label: "My Engineering",
    href: E1_EXPERIENCE_ROUTES.my,
    gate: E1_SURFACE_CAPABILITY_GATES.my,
  },
  {
    id: "explore",
    navId: "eng-explore",
    label: "Explore",
    href: E1_EXPERIENCE_ROUTES.explore,
    gate: E1_SURFACE_CAPABILITY_GATES.explore,
  },
  {
    id: "intelligence",
    navId: "eng-intelligence",
    label: "Intelligence",
    href: E1_EXPERIENCE_ROUTES.intelligence,
    gate: E1_SURFACE_CAPABILITY_GATES.intelligence,
  },
] as const;

/** Structured Explore destinations supported in current baseline. */
export const ENGINEERING_EXPLORE_GROUPS = [
  {
    id: "core",
    title: "Core records",
    items: [
      { id: "projects", label: "Projects", href: "/engineering/projects" },
      { id: "assets", label: "Assets", href: "/engineering/assets" },
      { id: "documents", label: "Documents", href: "/engineering/documents" },
    ],
  },
  {
    id: "registers",
    title: "Registers",
    items: [
      { id: "tqs", label: "TQs / RFIs", href: "/engineering/technical-queries" },
      { id: "decisions", label: "Decisions", href: "/engineering/decisions" },
      { id: "actions", label: "Actions", href: "/engineering/actions" },
      { id: "risks", label: "Risks", href: "/engineering/risks" },
      { id: "issues", label: "Issues", href: "/engineering/issues" },
      { id: "lessons", label: "Lessons", href: "/engineering/lessons" },
    ],
  },
  {
    id: "workspace",
    title: "Workspace tools",
    items: [
      { id: "search", label: "Search", href: "/engineering/search" },
      { id: "reports", label: "Reports", href: "/engineering/reports" },
      { id: "modules", label: "Modules", href: "/engineering/modules" },
      { id: "timeline", label: "Timeline", href: "/engineering/timeline" },
      { id: "activity", label: "Activity", href: "/engineering/activity" },
    ],
  },
] as const;

export const ENGINEERING_INTELLIGENCE_CATEGORIES = [
  {
    id: "project_intelligence",
    label: "Project Intelligence",
    description: "Documents, meetings, findings, and project decision support",
    applicationKey: "project_intelligence",
    href: "/engineering/apps/project-intelligence",
  },
  {
    id: "asset_intelligence",
    label: "Asset Intelligence",
    description: "Asset condition, criticality, and advisory signals",
    applicationKey: "asset_intelligence",
    href: "/engineering/apps/asset-intelligence",
  },
  {
    id: "inspection_intelligence",
    label: "Inspection Intelligence",
    description: "Inspection planning, field capture, and review",
    applicationKey: "inspection_intelligence",
    href: "/engineering/apps/inspection-intelligence",
  },
  {
    id: "project_controls",
    label: "Decision / Controls support",
    description: "Governed cost, schedule, and controls intelligence",
    applicationKey: "project_controls",
    href: "/engineering/apps/project-controls",
  },
  {
    id: "digital_twin",
    label: "Scenario / Twin intelligence",
    description: "Twin identity, state, and digital thread",
    applicationKey: "digital_twin",
    href: "/engineering/apps/digital-twin",
  },
  {
    id: "engineering_model_interoperability",
    label: "Model interoperability",
    description: "Federated model mappings and results",
    applicationKey: "engineering_model_interoperability",
    href: "/engineering/apps/model-interoperability",
  },
] as const;

export function resolveVisiblePrimaryNavIds(input: {
  productEntitled: boolean;
  entitledFeatureKeys: readonly string[];
}): string[] {
  return filterVisiblePrimaryNavIds(input);
}

export function entitledIntelligenceHrefs(
  entitledApplicationKeys: readonly string[],
): string[] {
  return ENGINEERING_CERTIFIED_V1_MODULES.filter((m) =>
    entitledApplicationKeys.includes(m.applicationKey),
  ).map((m) => m.href);
}
