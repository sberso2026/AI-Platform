# EOS-SHELL-JARVIS-2 component system

Presentation-only. Hosted in `@rtb/ui`. No second UI framework. No 3D.

## Command geometry

- `CommandPanel` — translucent Layer 2 panel, header rail, optional accent edge, clipped-corner linework
- `CommandPageTitle` — 34px command title hierarchy

## Intelligence identity (visual only)

- `EngineeringIntelligenceCore` — SVG concentric rings, RTB/AI mark, optional state labels. Not a runtime.
- `EosAiCore` — shell wrapper; keeps `data-testid="eos-ai-core"`

## Operational visuals

- `ProjectHealthIndicator` — HEALTHY / ATTENTION / CRITICAL / UNKNOWN from published classification
- `LiveSignal` / `MiniTrend` — current values; trend only when a direction is supplied
- `AttentionQueue` / `DecisionQueue`
- `RadialStatus`, `SegmentGauge`, `SignalBar`, `SeverityDistribution`
- `MilestoneTimeline`, `EvidenceChain`, `ActivityPulse`
- `ProjectSelectCommandSurface`

## Usage rules

- Pass real published values only
- Do not invent scores, arrows, or money
- `prefers-reduced-motion` disables `eos-ai-pulse` and `eos-core-spin`
