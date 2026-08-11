"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
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

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  meta?: Record<string, unknown>;
  evidencePlaceholder?: boolean;
  actionAffordances?: string[];
}

/**
 * Ask Engineering OS — experience shell only.
 * Composes existing /api/engineering/ai; no E2 retrieval invention.
 */
export function AskEngineeringShell({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  useExperiencePerf("ask");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { context, initFromDeepLink, setContext } = useEngineeringContext(pathname);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Ask Engineering OS. Context follows your current project/object. Answers are advisory; humans retain engineering authority. Evidence and governed actions expand in later phases.",
      evidencePlaceholder: true,
      actionAffordances: ["open_source", "create_action", "attach_evidence"],
    },
  ]);
  const [input, setInput] = useState(searchParams.get("q") ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [capabilityState, setCapabilityState] = useState<
    "ready" | "unavailable" | "insufficient_context"
  >("ready");

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
    }
  }, [context.projectId, context.objectType, context.objectId, setContext]);

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
    setCapabilityState("ready");

    try {
      const res = await fetch("/api/engineering/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          projectId: context.projectId || undefined,
          assetId:
            context.objectType === "asset" ? context.objectId || undefined : undefined,
          documentId:
            context.objectType === "document" ? context.objectId || undefined : undefined,
          objectType: context.objectType || undefined,
          objectId: context.objectId || undefined,
          sessionId: context.sessionId || undefined,
          agentSlug: "engineering-director",
        }),
      });
      const parsed = await parseApiJsonResponse<{
        message: string;
        requiresReview?: boolean;
        meta?: Record<string, unknown>;
        reasonCode?: string;
      }>(res);

      if (res.status === 403 || res.status === 402) {
        setCapabilityState("unavailable");
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              "Ask is unavailable for this workspace (capability or entitlement). Use Explore for structured records, or contact an administrator.",
            evidencePlaceholder: true,
          },
        ]);
        return;
      }

      if (!parsed.ok || !parsed.data) {
        const insufficient =
          !context.projectId &&
          !context.objectId &&
          (parsed.errorMessage ?? "").toLowerCase().includes("context");
        setCapabilityState(insufficient ? "insufficient_context" : "unavailable");
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content:
              parsed.errorMessage ??
              "The current assistant backend could not answer this request. No fabricated response was generated.",
            evidencePlaceholder: true,
            actionAffordances: ["set_project_context", "open_explore"],
          },
        ]);
        return;
      }

      const { message, requiresReview, meta } = parsed.data;
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: requiresReview
            ? `${message}\n\nHuman review required — advisory only.`
            : message,
          meta,
          evidencePlaceholder: true,
          actionAffordances: ["open_source", "create_action"],
        },
      ]);
    } catch (err) {
      setCapabilityState("unavailable");
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: err instanceof Error ? err.message : "Request failed",
          evidencePlaceholder: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  const contextLabel = [
    context.projectId ? `Project ${context.projectId.slice(0, 8)}…` : "No project",
    context.objectType && context.objectId
      ? `${context.objectType} ${context.objectId.slice(0, 8)}…`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const body = (
    <main
      className="flex flex-1 flex-col overflow-hidden"
      data-testid="ask-engineering-os"
      data-capability-state={capabilityState}
    >
      <div
        className="flex flex-wrap items-center gap-3 border-b px-4 py-3 text-sm text-muted-foreground"
        data-testid="ask-context-bar"
      >
        <span data-testid="ask-context-summary">{contextLabel}</span>
        <Link
          className="text-slate-800 underline-offset-2 hover:underline"
          href="/engineering/explore"
        >
          Change context in Explore
        </Link>
        <Link
          className="text-slate-800 underline-offset-2 hover:underline"
          href={buildAskHref({ projectId: null })}
          onClick={() => setContext({ projectId: null, objectId: null, objectType: null })}
        >
          Clear object context
        </Link>
      </div>

      <div className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="space-y-2">
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
              {message.evidencePlaceholder && message.role === "assistant" ? (
                <p
                  className="pl-8 text-xs text-muted-foreground"
                  data-testid="ask-evidence-placeholder"
                >
                  Evidence / sources: pending E2 retrieval · Actions reserved for governed tools
                </p>
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
            placeholder="Ask about this project, asset, TQ, or decision…"
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
        description="Assistant-first workspace — advisory answers with engineering context"
      />
      {body}
    </>
  );
}

export default function AskEngineeringPageClient() {
  return <AskEngineeringShell />;
}
