"use client";

import { KernelInfoPage } from "@/components/platform/kernel-admin-page";

export default function AIDirectorPage() {
  return (
    <KernelInfoPage
      title="AI Director"
      description="Foundation AI orchestration layer — intent classification, agent routing, tool execution, human review"
      sections={[
        {
          title: "Capabilities",
          description: "Core AI Director services",
          items: [
            "Intent classification via KeywordIntentClassifier",
            "Agent registry and routing",
            "Mock model adapter (production: OpenAI, Anthropic, Gemini)",
            "Human review routing for engineering decisions",
            "Confidence scoring and evidence references",
            "Immutable agent run logging",
          ],
        },
        {
          title: "Rules",
          description: "Safety and governance",
          items: [
            "No autonomous engineering approval",
            "Every agent run is logged",
            "Critical outputs require human review",
            "All outputs support audit traceability",
          ],
        },
      ]}
    />
  );
}
