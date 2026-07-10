"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Button, Input, Card } from "@rtb/ui";
import { Send, Sparkles, Bot, User } from "lucide-react";
import { cn } from "@rtb/ui";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Welcome to the RTB AI OS Command Centre. I can help you navigate the platform, manage workspaces, query audit logs, and coordinate AI-assisted operations. What would you like to do?",
};

const SUGGESTED_PROMPTS = [
  "Show platform status",
  "List available operating systems",
  "Explain multi-tenancy setup",
  "Help me configure a new workspace",
];

export default function CommandCentrePage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
      const res = await fetch("/api/platform/ai-director", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Agent run failed");

      const { message: assistantMessage, requiresReview } = json.data;
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: requiresReview
            ? `${assistantMessage}\n\n⚠️ This response requires human review before it can be acted upon.`
            : assistantMessage,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: err instanceof Error ? err.message : "Failed to process request.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSuggestion(prompt: string) {
    setInput(prompt);
  }

  return (
      <>
        <Header
        title="Command Centre"
        description="AI-assisted platform operations and decision support"
      />
              <main className="flex flex-1 flex-col overflow-hidden">
        <div className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <Card
                  className={cn(
                    "max-w-[80%] p-4",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card"
                  )}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </Card>
                {message.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-4 w-4 text-primary animate-pulse" />
                </div>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">Processing...</p>
                </Card>
              </div>
            )}
          </div>
        </div>

        {messages.length === 1 && (
          <div className="border-t px-6 py-4">
            <div className="mx-auto flex max-w-3xl flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <Button
                  key={prompt}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestion(prompt)}
                >
                  <Sparkles className="mr-1 h-3 w-3" />
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="border-t bg-card p-4">
          <div className="mx-auto flex max-w-3xl gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the Command Centre anything..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={!input.trim() || isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </main>
      </>
  );
}
