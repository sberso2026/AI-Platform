import type { SupabaseClient } from "@rtb/database";
import type { PromptStatus } from "@rtb/types";

export class PromptRegistryService {
  constructor(private readonly supabase: SupabaseClient) {}

  async listPrompts(tenantId: string) {
    const { data, error } = await this.supabase
      .from("prompts")
      .select("*, prompt_versions(*)")
      .eq("tenant_id", tenantId)
      .order("name");
    if (error) throw new Error(`Failed to list prompts: ${error.message}`);
    return data ?? [];
  }

  async getActiveVersion(tenantId: string, promptKey: string) {
    const { data: prompt } = await this.supabase
      .from("prompts")
      .select("id, is_safety_critical")
      .eq("tenant_id", tenantId)
      .eq("prompt_key", promptKey)
      .maybeSingle();
    if (!prompt) return null;

    const { data: version } = await this.supabase
      .from("prompt_versions")
      .select("*")
      .eq("prompt_id", prompt.id as string)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return version ? { prompt, version } : null;
  }

  async selectForAgent(tenantId: string, agentSlug: string) {
    const key = agentSlug || "platform-assistant";
    const result = await this.getActiveVersion(tenantId, key);
    if (result) return result;

    return this.getActiveVersion(tenantId, "platform-assistant");
  }

  async ensureActivePrompt(input: {
    tenantId: string;
    promptKey: string;
    name: string;
    content: string;
    description?: string;
    agentType?: string;
    version?: string;
    createdBy?: string;
  }) {
    const active = await this.getActiveVersion(input.tenantId, input.promptKey);
    if (active) return active;

    const { data: existing } = await this.supabase
      .from("prompts")
      .select("id, is_safety_critical")
      .eq("tenant_id", input.tenantId)
      .eq("prompt_key", input.promptKey)
      .maybeSingle();

    let promptId = existing?.id as string | undefined;
    if (!promptId) {
      const created = await this.createPrompt({
        tenantId: input.tenantId,
        promptKey: input.promptKey,
        name: input.name,
        content: input.content,
        description: input.description,
        agentType: input.agentType,
        createdBy: input.createdBy,
      });
      promptId = created.prompt.id as string;
      const version = await this.activateVersion(input.tenantId, promptId, created.version.id as string);
      return { prompt: created.prompt, version };
    }

    const { data: latest } = await this.supabase
      .from("prompt_versions")
      .select("*")
      .eq("prompt_id", promptId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!latest) {
      const { data: version, error } = await this.supabase
        .from("prompt_versions")
        .insert({
          prompt_id: promptId,
          version: input.version ?? "1.0.0",
          content: input.content,
          status: "draft",
          created_by: input.createdBy ?? null,
        })
        .select()
        .single();
      if (error || !version) throw new Error(`Failed to create prompt version: ${error?.message}`);
      return { prompt: existing, version: await this.activateVersion(input.tenantId, promptId, version.id as string) };
    }

    return { prompt: existing, version: await this.activateVersion(input.tenantId, promptId, latest.id as string) };
  }

  async createPrompt(input: {
    tenantId: string;
    promptKey: string;
    name: string;
    content: string;
    description?: string;
    agentType?: string;
    isSafetyCritical?: boolean;
    createdBy?: string;
  }) {
    const { data: prompt, error } = await this.supabase
      .from("prompts")
      .insert({
        tenant_id: input.tenantId,
        prompt_key: input.promptKey,
        name: input.name,
        description: input.description ?? null,
        agent_type: input.agentType ?? null,
        status: "draft",
        is_safety_critical: input.isSafetyCritical ?? false,
        created_by: input.createdBy ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(`Failed to create prompt: ${error.message}`);

    const { data: version, error: vError } = await this.supabase
      .from("prompt_versions")
      .insert({
        prompt_id: prompt.id,
        version: "1.0.0",
        content: input.content,
        status: "draft",
        created_by: input.createdBy ?? null,
      })
      .select()
      .single();
    if (vError) throw new Error(`Failed to create prompt version: ${vError.message}`);

    return { prompt, version };
  }

  async activateVersion(tenantId: string, promptId: string, versionId: string) {
    const { data: prompt } = await this.supabase
      .from("prompts")
      .select("is_safety_critical")
      .eq("id", promptId)
      .eq("tenant_id", tenantId)
      .single();

    if (prompt?.is_safety_critical) {
      const { data: approval } = await this.supabase
        .from("prompt_approvals")
        .select("status")
        .eq("prompt_version_id", versionId)
        .eq("status", "approved")
        .limit(1);
      if (!approval?.length) {
        throw new Error("Safety-critical prompt requires approval before activation");
      }
    }

    await this.supabase
      .from("prompt_versions")
      .update({ status: "deprecated" as PromptStatus })
      .eq("prompt_id", promptId)
      .eq("status", "active");

    const { data, error } = await this.supabase
      .from("prompt_versions")
      .update({ status: "active" })
      .eq("id", versionId)
      .select()
      .single();
    if (error) throw new Error(`Failed to activate prompt version: ${error.message}`);

    await this.supabase.from("prompts").update({ status: "active" }).eq("id", promptId);
    return data;
  }

  async logUsage(input: {
    tenantId: string;
    promptId: string;
    promptVersionId: string;
    agentId?: string;
    runId?: string;
  }) {
    const { data, error } = await this.supabase
      .from("prompt_usage_logs")
      .insert({
        tenant_id: input.tenantId,
        prompt_id: input.promptId,
        prompt_version_id: input.promptVersionId,
        agent_id: input.agentId ?? null,
        run_id: input.runId ?? null,
      })
      .select()
      .single();
    if (error) throw new Error(`Failed to log prompt usage: ${error.message}`);
    return data;
  }
}
