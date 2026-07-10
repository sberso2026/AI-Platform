"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, Badge, Button, Input } from "@rtb/ui";

export default function TechnicalQueriesPage() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [question, setQuestion] = useState("");
  const [responseDue, setResponseDue] = useState("");

  const reload = () =>
    fetch("/api/engineering/technical-queries")
      .then((r) => r.json())
      .then((j) => setItems(Array.isArray(j.data) ? j.data : []));

  useEffect(() => {
    reload();
  }, []);

  return (
      <>
        <Header
        title="Technical Query Register"
        description="Engineering RFIs and technical queries with threaded discussion support"
      />
              <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        <form
          className="mb-6 grid gap-2 rounded border p-4 md:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            await fetch("/api/engineering/technical-queries", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ question, responseDue }),
            });
            setQuestion("");
            setResponseDue("");
            reload();
          }}
        >
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs text-muted-foreground">Question</label>
            <textarea
              className="min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Response due</label>
            <Input type="date" value={responseDue} onChange={(e) => setResponseDue(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button type="submit" size="sm">
              Submit TQ
            </Button>
          </div>
        </form>

        <div className="grid gap-2">
          {items.map((item) => (
            <Card key={item.id as string}>
              <CardContent className="flex justify-between gap-4 p-4 text-sm">
                <div>
                  <p className="font-medium">{(item.tq_number as string) ?? ""}</p>
                  <p className="mt-1">{(item.question as string) ?? (item.title as string) ?? ""}</p>
                  {item.response ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Response: {item.response as string}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-col items-end gap-2">
                  {item.response_due ? (
                    <Badge variant="outline">due {item.response_due as string}</Badge>
                  ) : null}
                  <Badge variant="secondary">{(item.status as string) ?? "open"}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
          {items.length === 0 && (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                No technical queries yet.
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      </>
  );
}
