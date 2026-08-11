"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button, Card, CardContent, Input } from "@rtb/ui";
import { Bot, Send, User } from "lucide-react";
import { cn } from "@rtb/ui";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import {
  buildAskHref,
  useEngineeringContext,
} from "@/hooks/use-engineering-context";
import { useExperiencePerf } from "@/hooks/use-experience-perf";
import { ENGINEERING_PROJECT_FILTER_KEY } from "@/hooks/use-engineering-project-filter";

type EvidenceItem = {
  sourceId: string;
  sourceType: string;
  title: string;
  sourceLocation: string;
  excerpt: string;
  authorityStatus?: string;
  revision?: string | null;
  conflicting?: boolean;
  supersededWarning?: boolean;
};

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  evidence?: EvidenceItem[];
  evidenceState?: string;
  scope?: string;
  limitations?: string[];
  retrievalMode?: string;
  abstained?: boolean;
}

const SCOPE_OPTIONS = [
  { id: "workspace", label: "All Engineering" },
  { id: "project", label: "Current Project" },
  { id: "asset", label: "Current Asset/Object" },
  { id: "document", label: "Current Document" },
] as const;

/**
 * Ask Engineering OS — E2 grounded evidence UI over existing /api/engineering/ai.
 */
export function AskEngineeringShell({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  useExperiencePerf("ask");
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { context, initFromDeepLink, setContext } = useEngineeringContext(pathname);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Ask Engineering OS. Answers are grounded in authorised Engineering OS records when evidence exists. Missing evidence produces abstention — not invented history.",
    },
  ]);
  const [input, setInput] = useState(searchParams.get("q") ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [scope, setScope] = useState<string>(
    searchParams.get("scope") ??
      (searchParams.get("documentId")
        ? "document"
        : searchParams.get("assetId")
          ? "asset"
          : searchParams.get("projectId")
            ? "project"
            : "workspace"),
  );

  useEffect(() => {
    initFromDeepLink({
      route: pathname,
      searchParams,
    });
    const q = searchParams.get("q");
    if (q) setInput(q);
  }, [pathname, searchParams, initFromDeepLink]);

  useEffect(() => {
    const projectFromFilter = (() => {
      try {
        const stored = sessionStorage.getItem(ENGINEERING_PROJECT_FILTER_KEY);
        if (!stored || stored === "all") return null;
        return stored;
      } catch {
        return null;
      }
    })();
    if (projectFromFilter && !context.projectId) {
      setContext({
        projectId: projectFromFilter,
        objectType: context.objectType ?? "project",
        objectId: context.objectId ?? projectFromFilter,
      });
      if (scope === "workspace") setScope("project");
    }
  }, [context.projectId, context.objectType, context.objectId, setContext, scope]);

  function applyScope(next: string) {
    setScope(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set("scope", next);
    if (next === "workspace") {
      params.delete("projectId");
      params.delete("assetId");
      params.delete("documentId");
      params.delete("objectId");
      params.delete("objectType");
      setContext({ projectId: null, objectId: null, objectType: null });
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

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
          projectId: scope === "workspace" ? undefined : context.projectId || undefined,
          assetId:
            context.objectType === "asset" ? context.objectId || undefined : undefined,
          documentId:
            context.objectType === "document" ? context.objectId || undefined : undefined,
          objectType: context.objectType || undefined,
          objectId: context.objectId || undefined,
          scope,
          sessionId: context.sessionId || undefined,
          agentSlug: "engineering-director",
        }),
      });
      const parsed = await parseApiJsonResponse<{
        message: string;
        requiresReview?: boolean;
        evidence?: EvidenceItem[];
        evidenceState?: string;
        scope?: string;
        limitations?: string[];
        retrievalMode?: string;
        grounded?: { abstained?: boolean };
        meta?: Record<string, unknown>;
      }>(res);

      if (res.status === 403 || res.status === 402) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "Ask is unavailable for this workspace (capability or entitlement).",
            evidenceState: "INSUFFICIENT",
            limitations: ["Capability unavailable"],
          },
        ]);
        return;
      }

      if (!parsed.ok || !parsed.data) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              parsed.errorMessage ??
              "The assistant backend could not complete this request. No fabricated answer was generated.",
            evidenceState: "INSUFFICIENT",
            limitations: ["Provider or API failure"],
          },
        ]);
        return;
      }

      const data = parsed.data;
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.requiresReview
            ? `${data.message}\n\nHuman review required — advisory only.`
            : data.message,
          evidence: data.evidence ?? [],
          evidenceState: data.evidenceState,
          scope: data.scope ?? scope,
          limitations: data.limitations ?? [],
          retrievalMode: data.retrievalMode,
          abstained: Boolean(data.grounded?.abstained ?? data.meta?.abstained),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: err instanceof Error ? err.message : "Request failed",
          evidenceState: "INSUFFICIENT",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  const scopeLabel =
    SCOPE_OPTIONS.find((s) => s.id === scope)?.label ??
    (context.projectId ? "Current Project" : "All Engineering");

  const body = (
    <main
      className="flex flex-1 flex-col overflow-hidden"
      data-testid="ask-engineering-os"
      data-retrieval-ready="e2"
    >
      <div
        className="flex flex-wrap items-center gap-2 border-b px-4 py-3 text-sm"
        data-testid="ask-context-bar"
      >
        <span className="text-muted-foreground" data-testid="ask-scope-indicator">
          Scope: {scopeLabel}
        </span>
        {SCOPE_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => applyScope(opt.id)}
            className={cn(
              "rounded-md border px-2 py-1 text-xs",
              scope === opt.id
                ? "border-slate-800 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-400",
            )}
            data-testid={`ask-scope-${opt.id}`}
          >
            {opt.label}
          </button>
        ))}
        <Link
          className="text-xs text-slate-800 underline-offset-2 hover:underline"
          href={buildAskHref({ projectId: null })}
          onClick={() => {
            setContext({ projectId: null, objectId: null, objectType: null });
            setScope("workspace");
          }}
        >
          Clear context
        </Link>
      </div>

      <div className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="space-y-2" data-testid="ask-message">
              <div
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                {message.role === "assistant" && (
                  <Bot className="mt-1 h-5 w-5 text-muted-foreground" />
                )}
                <Card
                  className={cn(
                    "max-w-[85%]",
                    message.role === "user" ? "bg-primary text-primary-foreground" : "",
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

              {message.role === "assistant" && message.evidenceState ? (
                <div className="space-y-2 pl-8" data-testid="ask-evidence-panel">
                  <p className="text-xs text-muted-foreground">
                    Evidence state: {message.evidenceState}
                    {message.retrievalMode ? ` · ${message.retrievalMode}` : ""}
                    {message.scope ? ` · scope ${message.scope}` : ""}
                  </p>
                  {(message.evidence?.length ?? 0) > 0 ? (
                    <ul className="space-y-2" data-testid="ask-evidence-list">
                      {message.evidence!.map((ev) => (
                        <li key={`${ev.sourceType}-${ev.sourceId}`}>
                          <Link
                            href={ev.sourceLocation}
                            className="block rounded-md border border-slate-200 bg-white px-3 py-2 text-sm hover:border-slate-400"
                            data-testid="ask-evidence-link"
                          >
                            <div className="font-medium text-slate-900">
                              {ev.title}
                              {ev.revision ? ` (rev ${ev.revision})` : ""}
                              {ev.authorityStatus ? ` · ${ev.authorityStatus}` : ""}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">{ev.excerpt}</p>
                            {ev.supersededWarning || ev.conflicting ? (
                              <p className="mt-1 text-xs text-amber-700">
                                {ev.conflicting
                                  ? "Conflicting evidence"
                                  : "One supporting source is superseded."}
                              </p>
                            ) : null}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground" data-testid="ask-no-evidence">
                      No clickable sources for this response.
                    </p>
                  )}
                  {(message.limitations?.length ?? 0) > 0 ? (
                    <ul
                      className="list-disc space-y-1 pl-4 text-xs text-muted-foreground"
                      data-testid="ask-limitations"
                    >
                      {message.limitations!.map((l) => (
                        <li key={l}>{l}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t bg-white px-4 py-3"
        data-testid="ask-input-form"
      >
        <div className="mx-auto flex max-w-3xl gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask from authorised Engineering OS evidence…"
            disabled={isLoading}
            data-testid="ask-input"
            className="text-base"
          />
          <Button type="submit" disabled={isLoading || !input.trim()} data-testid="ask-submit">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </main>
  );

  if (embedded) return body;

  return (
    <>
      <Header
        title="Ask Engineering OS"
        description="Grounded engineering answers with evidence and abstention"
      />
      {body}
    </>
  );
}

export default function AskEngineeringPageClient() {
  return <AskEngineeringShell />;
}
