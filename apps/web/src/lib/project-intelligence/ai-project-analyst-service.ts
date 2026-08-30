import { AuditService } from "@rtb/platform-core";
import {
  AI_PROJECT_ANALYST_AGENT_SLUG,
  analystCapabilityDescriptor,
  answerAnalystQuestion,
  type AnalystAnswer,
} from "@rtb/project-intelligence";
import type { CommerceHandlerContext } from "@/lib/commerce/engineering-api";
import { composeProjectCommandCentre } from "./command-centre-service";

export function getAnalystCapability() {
  return analystCapabilityDescriptor();
}

export async function runProjectAnalyst(
  context: CommerceHandlerContext,
  projectId: string,
  question: string,
): Promise<AnalystAnswer> {
  const view = await composeProjectCommandCentre(context, projectId);
  let aiAvailable = false;
  let aiProvider: string | undefined;
  let aiModel: string | undefined;
  let aiSummaryText: string | undefined;

  try {
    const flag = await context.ctx.kernel.intelligence.features.evaluate({
      tenantId: context.ctx.tenantId,
      featureKey: "platform_intelligence",
      userId: context.ctx.userId,
    });
    const agent = await context.ctx.kernel.aiDirector.getAgentBySlug(
      context.ctx.tenantId,
      AI_PROJECT_ANALYST_AGENT_SLUG,
    );
    if (flag && agent?.isActive) {
      const result = await context.ctx.kernel.aiDirector.run({
        tenantId: context.ctx.tenantId,
        workspaceId: context.ctx.workspaceId,
        userId: context.ctx.userId,
        agentId: agent.id,
        message: question,
        context: {
          operating_system: "engineering",
          capability: "project_intelligence.ai_project_analyst",
          project_id: projectId,
          advisory_only: true,
          mutation_enabled: false,
        },
      });
      aiAvailable = true;
      aiProvider = result.run.model_provider;
      aiModel = result.run.model_name;
      aiSummaryText = result.message;
    }
  } catch {
    aiAvailable = false;
  }

  const answer = answerAnalystQuestion({
    view,
    question,
    aiAvailable,
    aiProvider,
    aiModel,
    aiSummaryText,
  });

  try {
    const audit = new AuditService(context.ctx.supabase);
    await audit.log({
      tenantId: context.ctx.tenantId,
      workspaceId: context.ctx.workspaceId,
      userId: context.ctx.userId,
      action: "project_intelligence.ai_project_analyst.execute",
      resourceType: "project",
      resourceId: projectId,
      metadata: {
        capability: "project_intelligence.ai_project_analyst",
        intent: answer.intent,
        tools: answer.toolsUsed,
        aiAvailable: answer.aiAvailable,
        success: true,
        refused: answer.refused,
      },
    });
  } catch {
    // Existing Platform audit is best-effort.
  }

  return answer;
}
