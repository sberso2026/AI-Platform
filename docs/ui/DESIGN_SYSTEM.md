# Design System

Batch **2.11** — defect fixes for sidebar icon/label spacing and search icon clearance (builds on 2.10).

## Goals

Suitable for mining, oil & gas, infrastructure, utilities, EPC, and industrial companies — comparable to Microsoft 365 / Azure Portal / ACC / ServiceNow, not a developer admin panel.

## Principles

1. **Readable first** — body ≥ 15px; never shrink primary text to “fit more.”
2. **Calm hierarchy** — page title → section → card → KPI number.
3. **Engineering language** — Engineering Decision, Risk Assessment, Technical Query, Action Register.
4. **Status is scannable** — chips with color + label.
5. **Strong RTB brand** — logo + org + product + edition in sidebar.

## Building blocks (`@rtb/ui`)

| Component | Role |
|-----------|------|
| `PageHeader` | Page title + subtitle |
| `SectionHeader` | Section title + optional description/action |
| `MetricCard` | KPI tile (36px value) |
| `StatusChip` | Status / severity chip |
| `TimelineRow` / `ActivityRow` | Feed rows |
| `EmptyState` | Intentional empty panels |
| `SearchInput` | Global search (~450px) |
| `SidebarNavItem` | Dark sidebar links |

Tokens: `TYPOGRAPHY`, `SPACING`, `BRANDING`.

## Batch 2.11 standards

| Area | Standard |
|------|----------|
| Sidebar icon rail | Fixed **24px** (`w-6`) + **12px** gap |
| Nav item height | **min 40px** (`min-h-10`), `px-4` |
| Search icon | Flex **right rail** (`w-11`); text is `flex-1` so it ends before the icon |
| Header controls | Height **44px** (`h-11`) |

## Related

- [TYPOGRAPHY.md](./TYPOGRAPHY.md)
- [ENGINEERING_BRANDING.md](./ENGINEERING_BRANDING.md)
- [STATUS_CHIPS.md](./STATUS_CHIPS.md)
- [NAVIGATION.md](./NAVIGATION.md)
- [SEARCH_INPUT.md](./SEARCH_INPUT.md)
- [ENGINEERING_COMMAND_CENTER.md](./ENGINEERING_COMMAND_CENTER.md)
