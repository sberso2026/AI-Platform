"use client";

import { Suspense } from "react";
import AskEngineeringPageClient from "@/components/engineering/ask-engineering-shell";

export default function AskEngineeringPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-muted-foreground" data-testid="ask-loading">
          Loading Ask Engineering OS…
        </div>
      }
    >
      <AskEngineeringPageClient />
    </Suspense>
  );
}
