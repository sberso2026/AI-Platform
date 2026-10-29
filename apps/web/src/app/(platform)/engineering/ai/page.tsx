"use client";

import { Suspense } from "react";
import AskEngineeringPageClient from "@/components/engineering/ask-engineering-shell";

/** Legacy AI Workspace deep link — same Ask shell (preserves /engineering/ai). */
export default function EngineeringAIPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-muted-foreground">Loading Ask Engineering OS…</div>
      }
    >
      <AskEngineeringPageClient />
    </Suspense>
  );
}
