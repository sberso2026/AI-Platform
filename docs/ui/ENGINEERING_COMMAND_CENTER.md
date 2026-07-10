# Engineering Command Center

Batch **2.10** — primary Engineering OS landing (premium typography + branding).

## Route

`/engineering`

Default product home for Engineering users.

## Purpose

Operational overview for engineering work.

| UI | Value |
|----|--------|
| Title | Engineering Command Center |
| Subtitle | Operations overview for engineering projects, decisions, risks, and technical queries |

## Layout Sections

1. **Engineering KPIs** (`MetricCard`, 36px values) — Engineering Projects, Engineering Reviews Pending, Critical Risk Assessments, Open Technical Queries, Action Register — Critical, Platform Health (secondary)
2. **Engineering Decisions** (`ActivityRow` + `StatusChip`)
3. **Risk Assessments** (`ActivityRow` + severity chip)
4. **Engineering Timeline** (`TimelineRow` with larger event icons)
5. **AI Recommendations** (`EmptyState` when empty — no fake recommendations)
6. **Recent Engineering Activity** (`ActivityRow`)

## AI empty state

When there are no AI runs:

- Title: **No active AI recommendations**
- Supporting copy explains Engineering AI Director will surface recommendations from risks, TQs, documents, and project activity
- CTA: **Open AI Workspace** → `/engineering/ai`

## Chrome

Header includes:

- Workspace: **RTB Engineering**
- Project selector
- Wider global search placeholder: `Search projects, assets, documents, risks...`

## Theme & Spacing

Light canvas; dark sidebar; Batch 2.08/2.09 page padding. See [LAYOUT_SPACING.md](./LAYOUT_SPACING.md) and [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md).

## Related

- [NAVIGATION.md](./NAVIGATION.md)
- [TYPOGRAPHY.md](./TYPOGRAPHY.md)
- [STATUS_CHIPS.md](./STATUS_CHIPS.md)
