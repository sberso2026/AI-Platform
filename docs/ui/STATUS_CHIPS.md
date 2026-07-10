# Status Chips

Batch **2.09**

## Component

`StatusChip` from `@rtb/ui`.

```tsx
<StatusChip value="pending" />
<StatusChip status="critical" />
<StatusChip value="ai-review-required" />
```

## Variants

| Status | Label | Meaning |
|--------|--------|---------|
| `pending` | Pending | Awaiting action / review |
| `approved` | Approved | Human-approved |
| `rejected` | Rejected | Declined |
| `open` | Open | Active work item |
| `closed` | Closed | Complete / resolved |
| `high` | High | Elevated severity |
| `medium` | Medium | Moderate severity |
| `low` | Low | Low severity |
| `critical` | Critical | Immediate attention |
| `overdue` | Overdue | Past due |
| `complete` | Complete | Finished |
| `ai-review` | AI Review Required | AI output needs human review |
| `neutral` | (passthrough) | Unknown / free-form |

## Accessibility

- Color is never the only cue — chips include a label and optional status dot.
- Contrast targets WCAG AA on light backgrounds.
- `data-status` exposes the resolved variant for tests / tooling.

## Mapping

`resolveStatusChip(string)` normalizes free-form register fields (`approval_status`, `status`, etc.).
