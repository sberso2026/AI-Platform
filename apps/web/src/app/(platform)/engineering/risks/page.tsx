"use client";

import { Fragment, useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, Badge, Button, Input } from "@rtb/ui";

export default function RisksPage() {
  const [risks, setRisks] = useState<Record<string, unknown>[]>([]);
  const [cells, setCells] = useState<Record<string, number>>({});
  const [title, setTitle] = useState("");
  const [probability, setProbability] = useState("3");
  const [consequence, setConsequence] = useState("3");

  const reload = () =>
    fetch("/api/engineering/risks?view=matrix")
      .then((r) => r.json())
      .then((j) => {
        setRisks(j.data?.risks ?? []);
        setCells(j.data?.cells ?? {});
      });

  useEffect(() => {
    reload();
  }, []);

  return (
      <>
        <Header
        title="Risk Register"
        description="Engineering risk matrix with probability × consequence scoring"
      />
              <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        <form
          className="mb-6 flex flex-wrap gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            await fetch("/api/engineering/risks", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title,
                probability: Number(probability),
                consequence: Number(consequence),
              }),
            });
            setTitle("");
            reload();
          }}
        >
          <Input className="min-w-[200px]" placeholder="Risk title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Input className="w-24" type="number" min={1} max={5} value={probability} onChange={(e) => setProbability(e.target.value)} />
          <Input className="w-24" type="number" min={1} max={5} value={consequence} onChange={(e) => setConsequence(e.target.value)} />
          <Button type="submit" size="sm">
            Add Risk
          </Button>
        </form>

        <Card className="mb-6">
          <CardContent className="p-4">
            <p className="mb-3 text-sm font-medium">Risk Matrix (P × C counts)</p>
            <div className="grid grid-cols-6 gap-1 text-center text-xs">
              <div />
              {[1, 2, 3, 4, 5].map((c) => (
                <div key={c} className="font-medium text-muted-foreground">
                  C{c}
                </div>
              ))}
              {[5, 4, 3, 2, 1].map((p) => (
                <Fragment key={`row-${p}`}>
                  <div className="font-medium text-muted-foreground">P{p}</div>
                  {[1, 2, 3, 4, 5].map((c) => {
                    const count = cells[`${p}x${c}`] ?? 0;
                    const score = p * c;
                    const tone =
                      score >= 15 ? "bg-destructive/20" : score >= 8 ? "bg-amber-500/20" : "bg-muted";
                    return (
                      <div key={`${p}-${c}`} className={`rounded p-2 ${tone}`}>
                        {count || "·"}
                      </div>
                    );
                  })}
                </Fragment>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-2">
          {risks.map((item) => (
            <Card key={item.id as string}>
              <CardContent className="flex justify-between p-4 text-sm">
                <div>
                  <p className="font-medium">
                    {(item.risk_number as string) ?? ""} — {(item.title as string) ?? ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    P{String(item.probability)} × C{String(item.consequence)} = score {String(item.score)}
                  </p>
                </div>
                <Badge variant={(item.score as number) >= 15 ? "destructive" : "secondary"}>
                  {item.status as string}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      </>
  );
}
