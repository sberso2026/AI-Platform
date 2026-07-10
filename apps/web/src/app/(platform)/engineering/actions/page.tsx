"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, Badge, Button, Input } from "@rtb/ui";

export default function ActionsPage() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [view, setView] = useState<"table" | "kanban">("table");
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

  const reload = () =>
    fetch("/api/engineering/actions")
      .then((r) => r.json())
      .then((j) => setItems(Array.isArray(j.data) ? j.data : []));

  useEffect(() => {
    reload();
  }, []);

  const columns = ["open", "in_progress", "completed", "cancelled"];

  return (
      <>
        <Header
        title="Action Register"
        description="Engineering actions with table and kanban views"
      />
              <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Button size="sm" variant={view === "table" ? "default" : "outline"} onClick={() => setView("table")}>
            Table
          </Button>
          <Button size="sm" variant={view === "kanban" ? "default" : "outline"} onClick={() => setView("kanban")}>
            Kanban
          </Button>
          <form
            className="ml-auto flex gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              await fetch("/api/engineering/actions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, dueDate }),
              });
              setTitle("");
              reload();
            }}
          >
            <Input placeholder="New action title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            <Button type="submit" size="sm">
              Add
            </Button>
          </form>
        </div>

        {view === "table" && (
          <div className="grid gap-2">
            {items.map((item) => (
              <Card key={item.id as string}>
                <CardContent className="flex justify-between p-4 text-sm">
                  <span>
                    {(item.action_number as string) ?? ""} — {(item.title as string) ?? ""}
                  </span>
                  <div className="flex gap-2">
                    {item.due_date ? <Badge variant="outline">{item.due_date as string}</Badge> : null}
                    <Badge>{item.status as string}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {view === "kanban" && (
          <div className="grid gap-3 md:grid-cols-4">
            {columns.map((col) => (
              <Card key={col}>
                <CardContent className="space-y-2 p-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">{col}</p>
                  {items
                    .filter((i) => (i.status as string) === col || (col === "open" && !columns.includes(i.status as string) && i.status === "open"))
                    .map((item) => (
                      <div key={item.id as string} className="rounded border p-2 text-xs">
                        {(item.action_number as string) ?? ""} {(item.title as string) ?? ""}
                      </div>
                    ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      </>
  );
}
