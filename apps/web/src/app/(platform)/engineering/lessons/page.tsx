"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, Badge, Button, Input } from "@rtb/ui";

export default function LessonsPage() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [title, setTitle] = useState("");
  const [lesson, setLesson] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [category, setCategory] = useState("design");

  const reload = () =>
    fetch("/api/engineering/lessons")
      .then((r) => r.json())
      .then((j) => setItems(Array.isArray(j.data) ? j.data : []));

  useEffect(() => {
    reload();
  }, []);

  return (
      <>
        <Header
        title="Lessons Learned Register"
        description="Capture engineering knowledge for AI retrieval and future decisions"
      />
              <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        <form
          className="mb-6 grid gap-2 rounded border p-4 md:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            await fetch("/api/engineering/lessons", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ title, lesson, recommendation, category }),
            });
            setTitle("");
            setLesson("");
            setRecommendation("");
            reload();
          }}
        >
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Category</label>
            <select
              className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="design">Design</option>
              <option value="construction">Construction</option>
              <option value="operations">Operations</option>
              <option value="safety">Safety</option>
              <option value="quality">Quality</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs text-muted-foreground">Lesson</label>
            <textarea
              className="min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              value={lesson}
              onChange={(e) => setLesson(e.target.value)}
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs text-muted-foreground">Recommendation</label>
            <textarea
              className="min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              value={recommendation}
              onChange={(e) => setRecommendation(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" size="sm">
              Capture Lesson
            </Button>
          </div>
        </form>

        <div className="grid gap-2">
          {items.map((item) => (
            <Card key={item.id as string}>
              <CardContent className="p-4 text-sm">
                <div className="mb-2 flex items-start justify-between gap-4">
                  <p className="font-medium">
                    {(item.lesson_number as string) ?? ""} — {(item.title as string) ?? ""}
                  </p>
                  <Badge variant="outline">{(item.category as string) ?? "—"}</Badge>
                </div>
                <p className="text-muted-foreground">{(item.lesson as string) ?? ""}</p>
                {item.recommendation ? (
                  <p className="mt-2 text-xs">
                    Recommendation: {item.recommendation as string}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ))}
          {items.length === 0 && (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                No lessons captured yet.
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      </>
  );
}
