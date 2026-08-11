/**
 * Governed tool invocation — validate, execute, provenance, fail-closed.
 * Never fabricates EngineeringToolResult from LLM output.
 */

import { createHash } from "node:crypto";
import type {
  EngineeringTool,
  EngineeringToolInvocationRequest,
  EngineeringToolResult,
} from "./contracts";
import { rejectLlmFabricatedToolResult } from "./contracts";
import {
  REFERENCE_TOOL_EXECUTORS,
  type ToolExecutor,
} from "./catalog";
import { EngineeringToolDiscoveryService } from "./discovery";

function stableHash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex").slice(0, 16);
}

function freezeResult(result: EngineeringToolResult): EngineeringToolResult {
  // Cast after freeze: runtime immutability; type keeps mutable array shapes for callers.
  return Object.freeze({
    ...result,
    inputs: Object.freeze({ ...result.inputs }),
    units: result.units ? Object.freeze({ ...result.units }) : undefined,
    output: result.output ? Object.freeze({ ...result.output }) : null,
    assumptions: Object.freeze([...result.assumptions]),
    applicableRuleRefs: Object.freeze([...result.applicableRuleRefs]),
    evidenceRefs: Object.freeze([...result.evidenceRefs]),
    limitations: Object.freeze([...result.limitations]),
    warnings: Object.freeze([...result.warnings]),
    provenance: Object.freeze({ ...result.provenance }),
    immutable: true as const,
    reviewRequired: true as const,
  }) as EngineeringToolResult;
}

function blockedResult(
  tool: EngineeringTool,
  request: EngineeringToolInvocationRequest,
  status: EngineeringToolResult["status"],
  outputKind: EngineeringToolResult["outputKind"],
  authorityStatus: EngineeringToolResult["authorityStatus"],
  limitations: string[],
  durationMs: number,
): EngineeringToolResult {
  const executedAt = new Date().toISOString();
  return freezeResult({
    invocationId: `inv:${tool.toolId}:${executedAt}:${stableHash(request.inputs)}`,
    toolId: tool.toolId,
    toolVersion: tool.version,
    inputs: { ...request.inputs },
    units: request.units ? { ...request.units } : undefined,
    assumptions: [],
    output: null,
    outputKind,
    status,
    applicableRuleRefs: tool.applicableCodes ?? [],
    evidenceRefs: request.evidenceRefs ?? [],
    provenance: {
      mechanism: "GOVERNED_TOOL",
      toolId: tool.toolId,
      toolVersion: tool.version,
      executor: "engineering_os_e6",
      platformRegistryOwner: "platform_intelligence",
      llmGenerated: false,
      inputHash: stableHash(request.inputs),
      outputHash: null,
    },
    executedAt,
    durationMs,
    limitations,
    warnings: tool.certification === "EXPERIMENTAL" ? ["Tool is EXPERIMENTAL."] : [],
    authorityStatus,
    reviewRequired: true,
    immutable: true,
  });
}

export type PlatformToolRegistryBridge = {
  /** Optional permission check against Platform Tool Registry — ownership stays there. */
  hasPermission?: (input: {
    tenantId: string;
    toolKey: string;
    principalType: string;
    principalId: string;
  }) => Promise<boolean>;
  logUsage?: (input: {
    tenantId: string;
    toolKey: string;
    status: string;
    durationMs: number;
  }) => Promise<void>;
};

export class EngineeringToolInvocationService {
  private readonly executors: Record<string, ToolExecutor>;

  constructor(
    private readonly discovery: EngineeringToolDiscoveryService = new EngineeringToolDiscoveryService(),
    executors: Record<string, ToolExecutor> = REFERENCE_TOOL_EXECUTORS,
    private readonly platformBridge: PlatformToolRegistryBridge = {},
  ) {
    this.executors = executors;
  }

  /**
   * Attempt to build a tool result from LLM text — always rejected.
   */
  rejectFabricatedResultFromLlm(): never {
    return rejectLlmFabricatedToolResult();
  }

  async invoke(request: EngineeringToolInvocationRequest): Promise<EngineeringToolResult> {
    const started = Date.now();
    const tool = this.discovery.getById(request.toolId);
    if (!tool) {
      const ghost: EngineeringTool = {
        toolId: request.toolId,
        name: "Unknown",
        capability: "unknown",
        toolType: "QUERY",
        inputSchema: { type: "object", properties: {} },
        outputSchema: { type: "object", properties: {} },
        version: "unknown",
        owner: "platform_intelligence",
        platformRegistryRef: "platform-intelligence:ai_tools",
        status: "UNAVAILABLE",
        authorityClass: "ADVISORY",
        permissions: [],
        executionMode: "UNAVAILABLE",
        timeoutMs: 0,
        certification: "UNCERTIFIED",
        failurePolicy: "REPORT_UNAVAILABLE",
        capabilityOnly: true,
      };
      return blockedResult(ghost, request, "BLOCKED", "FAILED", "BLOCKED", [
        "Tool not found in engineering capability catalog.",
      ], Date.now() - started);
    }

    // Permission (server-side) — deny by default
    const perms = request.permissions ?? [];
    const allowedByRequest =
      perms.includes("*") ||
      perms.includes("engineering_tool.execute") ||
      tool.permissions.some((p) => perms.includes(p));
    let allowedByPlatform = false;
    if (this.platformBridge.hasPermission) {
      allowedByPlatform = await this.platformBridge.hasPermission({
        tenantId: request.tenantId,
        toolKey: tool.toolId,
        principalType: "user",
        principalId: request.userId,
      });
    }
    if (!allowedByRequest && !allowedByPlatform) {
      return blockedResult(tool, request, "BLOCKED", "FAILED", "BLOCKED", [
        "permission_denied",
      ], Date.now() - started);
    }

    // Status / availability
    if (
      tool.capabilityOnly ||
      tool.status === "UNAVAILABLE" ||
      tool.executionMode === "UNAVAILABLE"
    ) {
      return blockedResult(tool, request, "BLOCKED", "FAILED", "BLOCKED", [
        "Tool capability unavailable — not implemented. No fabricated calculation was produced.",
      ], Date.now() - started);
    }
    if (tool.status === "DISABLED" || tool.status === "DEPRECATED") {
      return blockedResult(tool, request, "BLOCKED", "FAILED", "BLOCKED", [
        `Tool status ${tool.status}`,
      ], Date.now() - started);
    }

    // Certification / certified-use path
    if (request.requireCertifiedPath) {
      if (tool.certification === "UNCERTIFIED" || tool.certification === "EXPERIMENTAL") {
        return blockedResult(tool, request, "BLOCKED", "FAILED", "BLOCKED", [
          "Uncertified/experimental tool blocked from certified-use path.",
        ], Date.now() - started);
      }
    }
    if (tool.certification === "UNCERTIFIED" && tool.status === "UNCERTIFIED") {
      return blockedResult(tool, request, "BLOCKED", "FAILED", "BLOCKED", [
        "Uncertified tool cannot masquerade as certified.",
      ], Date.now() - started);
    }

    // Input validation
    const missing = (tool.inputSchema.required ?? []).filter(
      (key) =>
        request.inputs[key] === undefined ||
        request.inputs[key] === null ||
        request.inputs[key] === "",
    );
    if (missing.length) {
      return blockedResult(tool, request, "INCOMPLETE", "INCOMPLETE", "REQUIRES_HUMAN_REVIEW", [
        `Missing required inputs: ${missing.join(", ")}. Provide values before invocation.`,
      ], Date.now() - started);
    }

    // Unit validation
    for (const [key, schema] of Object.entries(tool.inputSchema.properties)) {
      if (!schema.unitRequired) continue;
      if (request.inputs[key] === undefined) continue;
      const unit = request.units?.[key];
      if (!unit || !String(unit).trim()) {
        return blockedResult(tool, request, "INCOMPLETE", "INCOMPLETE", "REQUIRES_HUMAN_REVIEW", [
          `Unit ambiguity: input "${key}" requires an explicit unit. Never invent units.`,
        ], Date.now() - started);
      }
    }

    const executor = this.executors[tool.toolId];
    if (!executor) {
      return blockedResult(tool, request, "FAILED", "FAILED", "FAILED", [
        "No governed executor registered for this tool.",
      ], Date.now() - started);
    }

    const timeoutMs = request.timeoutMs ?? tool.timeoutMs;
    try {
      const output = await Promise.race([
        executor({ inputs: request.inputs, units: request.units }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("tool_timeout")), timeoutMs),
        ),
      ]);

      const executedAt = new Date().toISOString();
      const durationMs = Date.now() - started;
      const result = freezeResult({
        invocationId: `inv:${tool.toolId}:${executedAt}:${stableHash(request.inputs)}`,
        toolId: tool.toolId,
        toolVersion: tool.version,
        inputs: { ...request.inputs },
        units: request.units ? { ...request.units } : undefined,
        assumptions: output.assumptions ?? [],
        output: output.output,
        outputKind: output.outputKind,
        status: "SUCCESS",
        applicableRuleRefs: tool.applicableCodes ?? [],
        evidenceRefs: request.evidenceRefs ?? [],
        provenance: {
          mechanism: "GOVERNED_TOOL",
          toolId: tool.toolId,
          toolVersion: tool.version,
          executor: "engineering_os_e6",
          platformRegistryOwner: "platform_intelligence",
          llmGenerated: false,
          inputHash: stableHash(request.inputs),
          outputHash: stableHash(output.output),
        },
        executedAt,
        durationMs,
        limitations: [
          "Tool output is advisory. Humans retain engineering authority. No autonomous approval.",
        ],
        warnings: [
          ...(output.warnings ?? []),
          ...(tool.certification === "EXPERIMENTAL"
            ? ["EXPERIMENTAL tool — visibly identified; not certified-path."]
            : []),
        ],
        authorityStatus: "REQUIRES_HUMAN_REVIEW",
        reviewRequired: true,
        immutable: true,
      });

      await this.platformBridge.logUsage?.({
        tenantId: request.tenantId,
        toolKey: tool.toolId,
        status: "SUCCESS",
        durationMs,
      });

      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "tool_error";
      const isTimeout = msg === "tool_timeout";
      await this.platformBridge.logUsage?.({
        tenantId: request.tenantId,
        toolKey: tool.toolId,
        status: isTimeout ? "TIMEOUT" : "FAILED",
        durationMs: Date.now() - started,
      });
      return blockedResult(
        tool,
        request,
        isTimeout ? "TIMEOUT" : "FAILED",
        "FAILED",
        "FAILED",
        [
          isTimeout
            ? "Tool timed out; failed safely without fabricated substitute."
            : `Tool error (${msg}); no fabricated engineering substitute was generated.`,
        ],
        Date.now() - started,
      );
    }
  }
}
