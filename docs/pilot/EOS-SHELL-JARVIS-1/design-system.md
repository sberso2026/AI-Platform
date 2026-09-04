# EOS-SHELL-JARVIS-1 design system

Presentation-only restyle of RTB Engineering OS. Inspired by a premium AI command surface. Product branding remains **RTB / Engineering OS / Enterprise Edition**. JARVIS is not used as product language.

## Target

Dark premium enterprise shell: deep navy/black, restrained cyan/electric blue, subtle teal, glass-like panels, thin luminous borders, larger type, engineering-grade seriousness.

## Shared primitives

All visual variants live in `@rtb/ui` plus `apps/web/src/app/globals.css` tokens:

- Card variants: `kpi`, `alert`, `intelligence`, `evidence`, `health`, `ai`, `action`
- Metric cards, status chips, empty states, activity/timeline rows
- Sidebar nav (44–48px rows, 16px labels)
- Search input and page/section headers

No second UI framework. No page-local palettes.

## Typography

Existing Segoe UI / system stack only.

| Role | Size |
| --- | --- |
| Shell nav | 16px |
| Body | 16px |
| Secondary | 15px |
| Section labels | 13px uppercase tracked |
| Page titles | 34px |
| KPIs | 40px |
| Card titles | 18px |

## Motion

Hover glow, panel fade, tab underline, AI core pulse, loading shimmer. All disabled under `prefers-reduced-motion`.
