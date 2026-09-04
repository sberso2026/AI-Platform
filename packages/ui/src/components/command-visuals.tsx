import * as React from "react";
import { cn } from "../lib/utils";
import { BRANDING } from "../lib/typography";

export type IntelligenceCoreStatus = "online" | "degraded" | "offline";

export function EngineeringIntelligenceCore({
  size = "md",
  status = "online",
  projectConnected,
  evidenceAvailable,
  systemHealthy,
  className,
}: {
  size?: "sm" | "md" | "lg";
  status?: IntelligenceCoreStatus;
  projectConnected?: boolean;
  evidenceAvailable?: boolean;
  systemHealthy?: boolean;
  className?: string;
}) {
  const dim = size === "lg" ? 168 : size === "sm" ? 72 : 120;
  const accent =
    status === "offline" ? "var(--eos-danger)" : status === "degraded" ? "var(--eos-warning)" : "var(--eos-accent)";
  const statusLabel =
    status === "online" ? "ONLINE" : status === "degraded" ? "ACTIVE" : "OFFLINE";

  return (
    <div
      className={cn("flex min-w-0 items-center gap-4", className)}
      data-testid="engineering-intelligence-core"
      role="status"
      aria-label={`${BRANDING.intelligenceCore}: Engineering AI ${statusLabel}`}
    >
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 120 120"
        className={cn(status === "online" && size !== "sm" && "eos-ai-pulse")}
        aria-hidden
      >
        <circle cx="60" cy="60" r="56" fill="none" stroke="rgba(56,189,248,0.12)" strokeWidth="1" />
        <g className={status === "online" && size !== "sm" ? "eos-core-spin" : undefined}>
          <circle
            cx="60"
            cy="60"
            r="48"
            fill="none"
            stroke={accent}
            strokeWidth="2"
            strokeDasharray="18 10"
            opacity="0.85"
          />
          <circle
            cx="60"
            cy="60"
            r="38"
            fill="none"
            stroke="var(--eos-teal)"
            strokeWidth="1.5"
            strokeDasharray="8 14"
            opacity="0.7"
          />
        </g>
        <circle cx="60" cy="60" r="26" fill="rgba(8,16,28,0.92)" stroke={accent} strokeWidth="1.5" />
        <text
          x="60"
          y="57"
          textAnchor="middle"
          fill="var(--eos-text-primary)"
          fontSize="11"
          fontWeight="700"
          fontFamily="Segoe UI, sans-serif"
        >
          RTB
        </text>
        <text
          x="60"
          y="72"
          textAnchor="middle"
          fill="var(--eos-accent)"
          fontSize="8"
          fontWeight="600"
          fontFamily="Segoe UI, sans-serif"
        >
          AI
        </text>
      </svg>
      {size !== "sm" ? (
        <div className="min-w-0 space-y-1.5 text-[0.8125rem] leading-tight">
          <p className="font-semibold tracking-[0.12em] text-[color:var(--eos-ai)]">ENGINEERING AI</p>
          <p className="text-[1.125rem] font-semibold text-[color:var(--eos-text-primary)]">{statusLabel}</p>
          {projectConnected != null ? (
            <p className="text-[color:var(--eos-text-secondary)]">
              PROJECT CONTEXT {projectConnected ? "CONNECTED" : "NOT SELECTED"}
            </p>
          ) : null}
          {evidenceAvailable != null ? (
            <p className="text-[color:var(--eos-text-secondary)]">
              EVIDENCE {evidenceAvailable ? "AVAILABLE" : "UNAVAILABLE"}
            </p>
          ) : null}
          {systemHealthy != null ? (
            <p className="text-[color:var(--eos-text-secondary)]">
              SYSTEM {systemHealthy ? "HEALTHY" : "REVIEW"}
            </p>
          ) : null}
        </div>
      ) : (
        <span className="sr-only">
          {BRANDING.intelligenceCore}. Engineering AI {statusLabel}
        </span>
      )}
    </div>
  );
}

export type HealthLevel = "HEALTHY" | "ATTENTION" | "CRITICAL" | "UNKNOWN";

const HEALTH_FILL: Record<HealthLevel, number> = {
  HEALTHY: 0.92,
  ATTENTION: 0.58,
  CRITICAL: 0.28,
  UNKNOWN: 0.12,
};

const HEALTH_COLOR: Record<HealthLevel, string> = {
  HEALTHY: "var(--eos-success)",
  ATTENTION: "var(--eos-warning)",
  CRITICAL: "var(--eos-danger)",
  UNKNOWN: "var(--eos-text-secondary)",
};

export function ProjectHealthIndicator({
  level,
  domains = [],
  className,
}: {
  level: HealthLevel;
  domains?: Array<{ label: string; state: "green" | "amber" | "red" | "unknown" }>;
  className?: string;
}) {
  const radius = 42;
  const c = 2 * Math.PI * radius;
  const filled = HEALTH_FILL[level] * c;
  return (
    <div className={cn("flex min-w-0 items-center gap-4", className)} data-testid="project-health-indicator">
      <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden>
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={HEALTH_COLOR[level]}
          strokeWidth="10"
          strokeDasharray={`${filled} ${c}`}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
        />
        <text x="60" y="56" textAnchor="middle" fill="var(--eos-text-primary)" fontSize="11" fontWeight="700">
          {level === "UNKNOWN" ? "UNK" : level === "ATTENTION" ? "ATTN" : level === "CRITICAL" ? "CRIT" : "OK"}
        </text>
        <text x="60" y="72" textAnchor="middle" fill="var(--eos-text-secondary)" fontSize="8">
          HEALTH
        </text>
      </svg>
      <div className="min-w-0">
        <p className="text-[0.8125rem] font-semibold tracking-[0.12em] text-[color:var(--eos-text-secondary)]">
          PROJECT HEALTH
        </p>
        <p className="mt-1 text-[1.75rem] font-bold leading-none text-[color:var(--eos-text-primary)]">{level}</p>
        {domains.length ? (
          <ul className="mt-3 space-y-1 text-[0.8125rem]">
            {domains.map((domain) => (
              <li key={domain.label} className="flex items-center gap-2 text-[color:var(--eos-text-secondary)]">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    domain.state === "green" && "bg-[color:var(--eos-success)]",
                    domain.state === "amber" && "bg-[color:var(--eos-warning)]",
                    domain.state === "red" && "bg-[color:var(--eos-danger)]",
                    domain.state === "unknown" && "bg-[color:var(--eos-text-secondary)]",
                  )}
                  aria-hidden
                />
                {domain.label}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

export function RadialStatus({
  label,
  value,
  tone = "cyan",
}: {
  label: string;
  value: string;
  tone?: "cyan" | "success" | "warning" | "danger" | "ai";
}) {
  const color =
    tone === "success"
      ? "var(--eos-success)"
      : tone === "warning"
        ? "var(--eos-warning)"
        : tone === "danger"
          ? "var(--eos-danger)"
          : tone === "ai"
            ? "var(--eos-ai)"
            : "var(--eos-accent)";
  return (
    <div className="flex items-center gap-3" data-testid="radial-status">
      <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden>
        <circle cx="22" cy="22" r="16" fill="none" stroke="rgba(148,163,184,0.2)" strokeWidth="3" />
        <circle cx="22" cy="22" r="16" fill="none" stroke={color} strokeWidth="3" strokeDasharray="70 100" />
      </svg>
      <div>
        <p className="text-[0.8125rem] text-[color:var(--eos-text-secondary)]">{label}</p>
        <p className="text-[1.125rem] font-semibold">{value}</p>
      </div>
    </div>
  );
}

export function SegmentGauge({
  segments,
}: {
  segments: Array<{ label: string; value: number; tone?: "success" | "warning" | "danger" | "cyan" }>;
}) {
  const total = segments.reduce((sum, item) => sum + Math.max(0, item.value), 0);
  return (
    <div data-testid="segment-gauge" className="space-y-2">
      <div className="flex h-2.5 overflow-hidden rounded-full bg-[color:var(--eos-bg-secondary)]">
        {segments.map((item) => (
          <span
            key={item.label}
            className={cn(
              item.tone === "success" && "bg-[color:var(--eos-success)]",
              item.tone === "warning" && "bg-[color:var(--eos-warning)]",
              item.tone === "danger" && "bg-[color:var(--eos-danger)]",
              (!item.tone || item.tone === "cyan") && "bg-[color:var(--eos-accent)]",
            )}
            style={{ width: total > 0 ? `${(Math.max(0, item.value) / total) * 100}%` : undefined }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-3 text-[0.8125rem] text-[color:var(--eos-text-secondary)]">
        {segments.map((item) => (
          <span key={item.label}>
            {item.label} {item.value}
          </span>
        ))}
      </div>
    </div>
  );
}

export function SignalBar({ value, max = 100, tone = "cyan" }: { value: number; max?: number; tone?: "cyan" | "warning" | "danger" | "success" }) {
  const width = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className="h-2 rounded-full bg-[color:var(--eos-bg-secondary)]" data-testid="signal-bar" aria-hidden>
      <div
        className={cn(
          "h-full rounded-full",
          tone === "warning" && "bg-[color:var(--eos-warning)]",
          tone === "danger" && "bg-[color:var(--eos-danger)]",
          tone === "success" && "bg-[color:var(--eos-success)]",
          tone === "cyan" && "bg-[color:var(--eos-accent)]",
        )}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

export function MiniTrend({ direction }: { direction?: "up" | "down" | "flat" }) {
  if (!direction) {
    return <span className="text-[0.8125rem] text-[color:var(--eos-text-secondary)]">Current</span>;
  }
  return (
    <span className="text-[0.8125rem]" data-testid="mini-trend">
      {direction === "up" ? "↑" : direction === "down" ? "↓" : "→"}
    </span>
  );
}

export function LiveSignal({
  label,
  value,
  testId,
  trend,
  state,
}: {
  label: string;
  value: string;
  testId?: string;
  trend?: "up" | "down" | "flat";
  state?: string;
}) {
  return (
    <div className="eos-command-panel h-full px-4 py-4" data-testid={testId} data-state={state} data-eos-card="signal">
      <p className="text-[0.8125rem] font-medium tracking-[0.08em] text-[color:var(--eos-text-secondary)]">{label}</p>
      <p className="mt-2 text-[2.25rem] font-bold leading-none tracking-tight">{value}</p>
      <p className="mt-2 text-[0.8125rem] text-[color:var(--eos-text-secondary)]">
        <MiniTrend direction={trend} />
      </p>
    </div>
  );
}

export function AttentionQueue({
  count,
  items,
  emptyTitle = "No attention items",
  emptyDescription,
  viewAllHref,
}: {
  count?: number;
  items: Array<{
    id: string;
    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "INFO";
    title: string;
    due?: string;
    href?: string;
    testId?: string;
  }>;
  emptyTitle?: string;
  emptyDescription?: string;
  viewAllHref?: string;
}) {
  return (
    <div data-testid="attention-queue">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className="text-[0.8125rem] font-semibold tracking-[0.12em] text-[color:var(--eos-text-secondary)]">
          ATTENTION REQUIRED
        </p>
        <p className="text-[1.75rem] font-bold leading-none">{String(count ?? items.length).padStart(2, "0")}</p>
      </div>
      {items.length === 0 ? (
        <p className="text-[0.9375rem] text-[color:var(--eos-text-secondary)]">
          {emptyTitle}
          {emptyDescription ? ` ${emptyDescription}` : ""}
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              data-testid={item.testId}
              className="border-b border-[color:var(--eos-border)] py-2 last:border-0"
            >
              <p className="text-[0.75rem] font-semibold tracking-[0.1em] text-[color:var(--eos-warning)]">{item.severity}</p>
              <p className="mt-0.5 text-[0.9375rem] font-medium">{item.title}</p>
              {item.due ? <p className="text-[0.8125rem] text-[color:var(--eos-text-secondary)]">{item.due}</p> : null}
            </li>
          ))}
        </ul>
      )}
      {viewAllHref ? (
        <a className="mt-3 inline-flex text-[0.9375rem] text-[color:var(--eos-accent)] hover:underline" href={viewAllHref}>
          View all
        </a>
      ) : null}
    </div>
  );
}

export function SeverityDistribution({
  items,
}: {
  items: Array<{ label: string; value: number; tone?: "danger" | "warning" | "cyan" | "success" }>;
}) {
  const max = Math.max(1, ...items.map((item) => item.value));
  return (
    <ul className="space-y-2" data-testid="severity-distribution">
      {items.map((item) => (
        <li key={item.label}>
          <div className="mb-1 flex justify-between text-[0.8125rem]">
            <span>{item.label}</span>
            <span>{item.value}</span>
          </div>
          <SignalBar value={item.value} max={max} tone={item.tone === "cyan" ? "cyan" : item.tone} />
        </li>
      ))}
    </ul>
  );
}

export function MilestoneTimeline({
  items,
}: {
  items: Array<{ id: string; title: string; date?: string; status?: string; deltaDays?: number }>;
}) {
  if (items.length === 0) {
    return <p className="text-[0.9375rem] text-[color:var(--eos-text-secondary)]">No published milestone evidence.</p>;
  }
  return (
    <ol className="relative space-y-3 border-l border-[color:var(--eos-border)] pl-4" data-testid="milestone-timeline">
      {items.map((item) => (
        <li key={item.id} className="relative">
          <span className="absolute -left-[1.35rem] top-1.5 h-2.5 w-2.5 rounded-full bg-[color:var(--eos-accent)]" />
          <p className="font-medium">{item.title}</p>
          <p className="text-[0.8125rem] text-[color:var(--eos-text-secondary)]">
            {[item.status, item.date, typeof item.deltaDays === "number" ? `${item.deltaDays}d published delta` : null]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </li>
      ))}
    </ol>
  );
}

export function EvidenceChain({
  nodes,
}: {
  nodes: Array<{ label: string; value?: string; href?: string }>;
}) {
  return (
    <ol className="flex flex-wrap items-stretch gap-2" data-testid="evidence-chain">
      {nodes.map((node, index) => (
        <li key={node.label} className="flex items-center gap-2">
          <div className="eos-command-panel min-w-[7.5rem] px-3 py-2">
            <p className="text-[0.75rem] tracking-[0.08em] text-[color:var(--eos-text-secondary)]">{node.label}</p>
            {node.value ? <p className="text-[1.125rem] font-semibold">{node.value}</p> : null}
          </div>
          {index < nodes.length - 1 ? (
            <span className="text-[color:var(--eos-accent)]" aria-hidden>
              ↓
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

export function DecisionQueue({
  items,
}: {
  items: Array<{ id: string; title: string; status?: string; due?: string }>;
}) {
  if (!items.length) {
    return <p className="text-[0.9375rem] text-[color:var(--eos-text-secondary)]">No published decisions requiring attention.</p>;
  }
  return (
    <ul className="space-y-2" data-testid="decision-queue">
      {items.map((item) => (
        <li key={item.id} className="border-b border-[color:var(--eos-border)] py-2 last:border-0">
          <p className="font-medium">{item.title}</p>
          <p className="text-[0.8125rem] text-[color:var(--eos-text-secondary)]">
            {[item.status, item.due].filter(Boolean).join(" · ")}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function ActivityPulse({ active }: { active?: boolean }) {
  return (
    <span
      className={cn("inline-flex h-2.5 w-2.5 rounded-full bg-[color:var(--eos-accent)]", active && "eos-ai-pulse")}
      data-testid="activity-pulse"
      aria-hidden
    />
  );
}

export function ProjectSelectCommandSurface({
  title = "PROJECT INTELLIGENCE",
  description = "Select a project to activate intelligence.",
  testId,
  selector,
}: {
  title?: string;
  description?: string;
  testId?: string;
  selector?: React.ReactNode;
}) {
  return (
    <CommandSurfaceShell testId={testId} title={title} description={description} selector={selector} />
  );
}

function CommandSurfaceShell({
  testId,
  title,
  description,
  selector,
}: {
  testId?: string;
  title: string;
  description: string;
  selector?: React.ReactNode;
}) {
  return (
    <div className="eos-command-panel p-6" data-testid={testId}>
      <p className="text-[0.8125rem] font-semibold tracking-[0.14em] text-[color:var(--eos-accent)]">{title}</p>
      <p className="mt-2 text-[1.5rem] font-semibold">{description}</p>
      {selector ? <div className="mt-5 max-w-md">{selector}</div> : null}
      <p className="mt-5 text-[0.9375rem] text-[color:var(--eos-text-secondary)]">
        Available after selection: Schedule intelligence, Cost signals, Risk & change, Engineering evidence, Decision
        support, AI project brief.
      </p>
    </div>
  );
}
