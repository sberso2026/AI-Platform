"use client";

import { BRANDING, EngineeringIntelligenceCore, cn } from "@rtb/ui";

type EosAiStatus = "online" | "degraded" | "offline";

export function EosAiCore({
  compact = false,
  size,
  status = "online",
  projectLabel,
  evidenceAvailable,
  systemHealthy,
  className,
}: {
  compact?: boolean;
  size?: "sm" | "md" | "lg";
  status?: EosAiStatus;
  projectLabel?: string;
  evidenceAvailable?: boolean;
  systemHealthy?: boolean;
  className?: string;
}) {
  const resolvedSize = size ?? (compact ? "sm" : "md");
  return (
    <div className={cn("min-w-0", className)} data-testid="eos-ai-core">
      <EngineeringIntelligenceCore
        size={resolvedSize}
        status={status}
        projectConnected={projectLabel ? true : compact ? undefined : false}
        evidenceAvailable={evidenceAvailable}
        systemHealthy={systemHealthy}
      />
      <span className="sr-only">
        Engineering AI Online. {BRANDING.intelligenceCore}
        {projectLabel ? `. ${projectLabel}` : ""}
      </span>
    </div>
  );
}
