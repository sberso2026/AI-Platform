"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, Badge, Button, Input } from "@rtb/ui";
import { Send, Bot, User } from "lucide-react";
import { cn } from "@rtb/ui";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  meta?: Record<string, unknown>;
}

const AGENTS = [
  { slug: "engineering-director", label: "AI Engineering Director" },
  { slug: "engineering-director", label: "Engineering Reviewer" },
  { slug: "engineering-director", label: "Document Reviewer" },
  { slug: "engineering-director", label: "Asset Engineer" },
  { slug: "engineering-director", label: "Risk Reviewer" },
];

export default function EngineeringAIWorkspace() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Engineering AI Workspace. Select project/asset/document context, then ask. Engineering decisions always require human review.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<Record<string, unknown>[]>([]);
  const [assets, setAssets] = useState<Record<string, unknown>[]>([]);
  const [documents, setDocuments] = useState<Record<string, unknown>[]>([]);
  const [disciplines, setDisciplines] = useState<Record<string, unknown>[]>([]);
  const [projectId, setProjectId] = useState(searchParams.get("projectId") ?? "");
  const [assetId, setAssetId] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [disciplineId, setDisciplineId] = useState("");
  const [agentSlug, setAgentSlug] = useState("engineering-director");

  useEffect(() => {
    Promise.all([
      fetch("/api/engineering/projects").then((r) => parseApiJsonResponse(r)),
      fetch("/api/engineering/assets").then((r) => parseApiJsonResponse(r)),
      fetch("/api/engineering/documents").then((r) => parseApiJsonResponse(r)),
      fetch("/api/engineering/disciplines").then((r) => parseApiJsonResponse(r)),
    ]).then(([p, a, d, disc]) => {
      setProjects(Array.isArray(p.data) ? (p.data as Record<string, unknown>[]) : []);
      setAssets(Array.isArray(a.data) ? (a.data as Record<string, unknown>[]) : []);
      setDocuments(Array.isArray(d.data) ? (d.data as Record<string, unknown>[]) : []);
      setDisciplines(
        Array.isArray(disc.data) ? (disc.data as Record<string, unknown>[]) : [],
      );
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/engineering/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          projectId: projectId || undefined,
          assetId: assetId || undefined,
          documentId: documentId || undefined,
          disciplineId: disciplineId || undefined,
          agentSlug,
        }),
      });
      const parsed = await parseApiJsonResponse<{
        message: string;
        requiresReview?: boolean;
        meta?: Record<string, unknown>;
        evidence?: Array<{ excerpt?: string; title?: string }>;
      }>(res);
      if (!parsed.ok || !parsed.data) {
        const technical = parsed.errorMessage ?? "AI run failed";
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: /unexpected error/i.test(technical)
              ? "Degraded mode: Engineering AI could not generate an answer. Retrieved authorised evidence is shown below. This is not generative reasoning."
              : technical,
            meta: { generationFailed: true },
          },
        ]);
        return;
      }

      const { message, requiresReview, meta, evidence } = parsed.data;
      const degraded = Boolean(meta?.generationFailed) && (evidence?.length ?? 0) > 0;
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: requiresReview
            ? `${message}\n\n⚠️ Human review required — no autonomous engineering approval.`
            : message,
          meta: {
            ...meta,
            generationFailed: Boolean(meta?.generationFailed) || degraded,
          },
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: err instanceof Error ? err.message : "Failed",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
      <>
        <Header
        title="Engineering AI Workspace"
        description="Engineering-specific command centre using AI Director with policy enforcement"
      />
              <main className="flex flex-1 flex-col overflow-hidden">
        <div className="grid gap-2 border-b p-4 md:grid-cols-5">
          <Select
            label="Project"
            value={projectId}
            onChange={setProjectId}
            options={projects.map((p) => ({
              value: p.id as string,
              label: `${p.project_code} — ${p.project_name}`,
            }))}
          />
          <Select
            label="Asset"
            value={assetId}
            onChange={setAssetId}
            options={assets.map((a) => ({
              value: a.id as string,
              label: `${a.asset_tag} — ${a.asset_name}`,
            }))}
          />
          <Select
            label="Document"
            value={documentId}
            onChange={setDocumentId}
            options={documents.map((d) => ({
              value: d.id as string,
              label: `${d.document_number} — ${d.title}`,
            }))}
          />
          <Select
            label="Discipline"
            value={disciplineId}
            onChange={setDisciplineId}
            options={disciplines.map((d) => ({
              value: d.id as string,
              label: d.name as string,
            }))}
          />
          <Select
            label="Agent"
            value={agentSlug}
            onChange={setAgentSlug}
            options={AGENTS.map((a) => ({ value: a.slug, label: a.label }))}
          />
        </div>

        <div className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                <div
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <Bot className="mt-1 h-5 w-5 text-muted-foreground" />
                  )}
                  <Card
                    className={cn(
                      "max-w-[85%]",
                      message.role === "user" ? "bg-primary text-primary-foreground" : ""
                    )}
                  >
                    <CardContent className="whitespace-pre-wrap p-3 text-sm">
                      {message.content}
                    </CardContent>
                  </Card>
                  {message.role === "user" && (
                    <User className="mt-1 h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                {message.meta && (
                  <div className="ml-8 flex flex-wrap gap-2">
                    {Boolean(message.meta.degradedToRetrievalOnly) || Boolean(message.meta.generationFailed) ? (
                      <Badge variant="warning" data-testid="ai-degradation">
                        Retrieval only — not generative analysis
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        model: {String(message.meta.modelRoute ?? "—")}
                      </Badge>
                    )}
                    {message.meta.grounded ? (
                      <Badge variant="outline">Grounded in project evidence</Badge>
                    ) : null}
                    <Badge variant="secondary">
                      confidence: {String(message.meta.confidence ?? "—")}
                    </Badge>
                    <Badge variant={message.meta.requiresReview ? "destructive" : "success"}>
                      review: {message.meta.requiresReview ? "required" : "not required"}
                    </Badge>
                    <Badge variant="outline">
                      prompt: {String(message.meta.promptVersionId ?? "—").slice(0, 8)}
                    </Badge>
                    <Badge variant="outline">
                      cost: {String(message.meta.costEventRef ?? "—").slice(0, 8)}
                    </Badge>
                    <Badge variant="outline">
                      trace: {String(message.meta.traceId ?? "—").slice(0, 8)}
                    </Badge>
                    <Badge variant="outline">policy: applied</Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="border-t p-4">
          <div className="mx-auto flex max-w-3xl gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Engineering AI..."
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </main>
      </>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="mb-1 block text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      <select
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-2 text-xs"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Any</option>
        {options.map((o) => (
          <option key={`${o.value}-${o.label}`} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
