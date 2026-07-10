import type { ModelAdapter, ModelProviderType } from "@rtb/types";

export class MockModelAdapter implements ModelAdapter {
  readonly providerType: ModelProviderType = "mock";

  async complete(params: {
    model: string;
    messages: { role: string; content: string }[];
    tools?: unknown[];
  }) {
    const userMessage =
      [...params.messages].reverse().find((m) => m.role === "user")?.content ?? "";

    const response = this.generateMockResponse(userMessage);

    return {
      content: response,
      confidence: 0.85,
      evidenceRefs: [
        {
          source_id: "platform-docs",
          source_type: "documentation",
          title: "RTB AI OS Platform Documentation",
          excerpt: "Platform kernel services documentation",
          score: 0.9,
        },
      ],
    };
  }

  private generateMockResponse(message: string): string {
    const lower = message.toLowerCase();

    if (lower.includes("status") || lower.includes("platform")) {
      return "RTB AI OS Platform Core is operational. All kernel services (AI Director, Event Bus, Jobs, Workflow, Knowledge Graph, Memory, Digital Twin, API Gateway, Notifications, Telemetry) are active. Phase 1.5 hardening is complete.";
    }
    if (lower.includes("operating system")) {
      return "Eight domain operating systems are planned: Business, Engineering, Industrial, Fleet, Infrastructure, Smart Building, Smart City, and Autonomous Systems. Engineering OS will be the first full domain OS in Phase 2.";
    }
    if (lower.includes("workflow")) {
      return "The Workflow Engine supports versioned definitions, human review steps, and approval workflows. Pre-seeded workflows include Human Review and Agent Answer Approval.";
    }
    if (lower.includes("tenant") || lower.includes("multi-tenancy")) {
      return "Multi-tenancy is enforced via PostgreSQL Row Level Security. Every kernel table is tenant-scoped with membership-based access control.";
    }

    return `I've processed your request through the AI Director (mock adapter). Your message: "${message}". In production, this will route to the appropriate model provider based on intent classification.`;
  }
}
