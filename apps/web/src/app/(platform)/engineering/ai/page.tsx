"use client";

import { Suspense } from "react";
import EngineeringAIWorkspace from "./ai-workspace";

export default function EngineeringAIPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading AI Workspace...</div>}>
      <EngineeringAIWorkspace />
    </Suspense>
  );
}
