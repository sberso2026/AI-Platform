/**
 * Governed tool discovery — context/intent → eligible tools.
 * No fabricated capabilities; unavailable tools stay unavailable.
 */

import type {
  EngineeringTool,
  EngineeringToolCandidate,
  EngineeringToolDiscoveryRequest,
} from "./contracts";
import { getDefaultEngineeringToolCatalog } from "./catalog";

function intentCapabilities(intent?: string | null): string[] {
  if (!intent) return [];
  const q = intent.toLowerCase();
  const caps: string[] = [];
  if (/\b(area|rectangle|geometry)\b/.test(q)) caps.push("estimate.geometry.area");
  if (/\b(compare|title)\b/.test(q)) caps.push("compare.document.title");
  if (/\b(estimate|material|length|bar)\b/.test(q)) caps.push("estimate.material.length");
  if (/\b(check|verify|keyword)\b/.test(q)) caps.push("check.evidence.keyword");
  if (/\b(structural|beam|member)\b/.test(q)) caps.push("calculate.structural");
  if (/\b(pressure.?vessel|pv)\b/.test(q)) caps.push("calculate.pressure_vessel");
  if (/\b(concrete)\b/.test(q)) caps.push("calculate.concrete");
  if (/\b(drawing)\b/.test(q)) caps.push("search.drawing");
  if (/\b(code|standard|as\/nzs|iso)\b/.test(q)) caps.push("search.code_standard");
  if (/\b(digital.?twin|twin)\b/.test(q)) caps.push("query.digital_twin");
  if (/\b(fea|finite.?element)\b/.test(q)) caps.push("query.fea");
  if (/\b(ndt)\b/.test(q)) caps.push("advise.ndt");
  if (/\b(inspection.?plan)\b/.test(q)) caps.push("plan.inspection");
  if (/\b(schedule.?risk)\b/.test(q)) caps.push("analyse.schedule_risk");
  if (/\b(cost.?forecast)\b/.test(q)) caps.push("forecast.cost");
  if (/\b(shm)\b/.test(q)) caps.push("analyse.shm");
  if (/\b(project.?risk)\b/.test(q)) caps.push("analyse.project_risk");
  if (/\b(specification)\b/.test(q)) caps.push("check.specification");
  return caps;
}

export class EngineeringToolDiscoveryService {
  constructor(private readonly catalog: EngineeringTool[] = getDefaultEngineeringToolCatalog()) {}

  listCatalog(): EngineeringTool[] {
    return [...this.catalog];
  }

  getById(toolId: string): EngineeringTool | null {
    return this.catalog.find((t) => t.toolId === toolId) ?? null;
  }

  discover(request: EngineeringToolDiscoveryRequest): EngineeringToolCandidate[] {
    const needed = [
      ...(request.capability ? [request.capability] : []),
      ...intentCapabilities(request.intent),
    ];
    const userPerms = new Set(request.permissions ?? ["engineering_tool.discover"]);

    return this.catalog
      .filter((tool) => {
        if (needed.length === 0) return !tool.capabilityOnly;
        return needed.some(
          (c) => tool.capability === c || tool.capability.startsWith(c.split(".")[0] + "."),
        ) || needed.includes(tool.capability);
      })
      .map((tool) => {
        const reasons: string[] = [];
        let eligible = true;

        if (tool.status === "DISABLED" || tool.status === "DEPRECATED") {
          eligible = false;
          reasons.push(`status_${tool.status.toLowerCase()}`);
        }
        if (tool.status === "UNAVAILABLE" || tool.capabilityOnly || tool.executionMode === "UNAVAILABLE") {
          eligible = false;
          reasons.push("capability_unavailable");
        }
        if (tool.status === "UNCERTIFIED") {
          eligible = false;
          reasons.push("uncertified");
        }
        if (request.requireCertifiedPath) {
          if (tool.certification !== "CERTIFIED" && tool.certification !== "VALIDATED") {
            eligible = false;
            reasons.push("blocked_uncertified_on_certified_path");
          }
          if (tool.certification === "EXPERIMENTAL") {
            eligible = false;
            reasons.push("experimental_blocked_on_certified_path");
          }
        }
        const allowed = tool.permissions.some((p) => userPerms.has(p) || userPerms.has("*"));
        if (!allowed) {
          eligible = false;
          reasons.push("permission_denied");
        }
        if (request.discipline && tool.discipline && tool.discipline !== request.discipline) {
          reasons.push("discipline_mismatch");
        }
        if (eligible) reasons.push("eligible");
        if (tool.certification === "EXPERIMENTAL" && eligible) {
          reasons.push("experimental_visible");
        }

        return { tool, eligible, reasons };
      });
  }

  eligibleTools(request: EngineeringToolDiscoveryRequest): EngineeringTool[] {
    return this.discover(request)
      .filter((c) => c.eligible)
      .map((c) => c.tool);
  }
}
