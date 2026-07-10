"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, Badge, Button, Input } from "@rtb/ui";

export default function IssuesPage() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [title, setTitle] = useState("");
  const [issueType, setIssueType] = useState("technical");
  const [impact, setImpact] = useState("");

  const reload = () =>
    fetch("/api/engineering/issues")
      .then((r) => r.json())
      .then((j) => setItems(Array.isArray(j.data) ? j.data : []));

  useEffect(() => {
    reload();
  }, []);

  return (
      <>
        <Header
        title="Issue Register"
        description="Engineering issues requiring investigation — may promote to Decision, Risk, or Action"
      />
              <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        <form
          className="mb-6 flex flex-wrap gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            await fetch("/api/engineering/issues", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ title, issueType, impact }),
            });
            setTitle("");
            setImpact("");
            reload();
          }}
        >
          <Input
            className="min-w-[220px] flex-1"
            placeholder="Issue title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <select
            className="h-10 rounded-md border border-input bg-transparent px-3 text-sm"
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
          >
            <option value="technical">Technical</option>
            <option value="safety">Safety</option>
            <option value="quality">Quality</option>
            <option value="design">Design</option>
            <option value="constructability">Constructability</option>
          </select>
          <Input
            className="w-48"
            placeholder="Impact"
            value={impact}
            onChange={(e) => setImpact(e.target.value)}
          />
          <Button type="submit" size="sm">
            Raise Issue
          </Button>
        </form>

        <div className="grid gap-2">
          {items.map((item) => (
            <Card key={item.id as string}>
              <CardContent className="flex justify-between gap-4 p-4 text-sm">
                <div>
                  <p className="font-medium">
                    {(item.issue_number as string) ?? ""} — {(item.title as string) ?? ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    type: {(item.issue_type as string) ?? "—"} · impact:{" "}
                    {(item.impact as string) ?? "—"}
                  </p>
                </div>
                <div className="flex gap-2">
                  {item.priority ? <Badge variant="outline">{item.priority as string}</Badge> : null}
                  <Badge variant="secondary">{(item.status as string) ?? "open"}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
          {items.length === 0 && (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                No issues raised yet.
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      </>
  );
}
