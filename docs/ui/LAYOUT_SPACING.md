# Layout Spacing

Batch **2.08** — app shell spacing system for RTB Engineering OS.

## Goals

- Main content never feels flush against the browser chrome or header
- Cards do not touch the header
- Consistent rhythm across Engineering and Platform pages

## Tokens

| Area | Value |
|------|--------|
| Header min-height | 64px (`min-h-16`) |
| Header horizontal padding | 24–32px (`px-6 sm:px-8`) |
| Header vertical padding | 16px (`py-4`) |
| Page content top | ≥ 24px (`pt-6`) |
| Page content horizontal | 24–32px (`px-6 sm:px-8`) |
| Page content bottom | 32px (`pb-8`) |
| Section gap | 28–32px (`mt-8` / `space-y-4` + borders) |
| Card grid gap | 16–20px (`gap-4` / `lg:gap-5`) |
| Card padding | 20–24px (`p-5` preferred on overview cards) |
| Border radius | theme `--radius-*` (`rounded-lg` cards) |

## Implementation

Shared wrapper:

```tsx
import { PageMain } from "@/components/layout/page-main";

<>
  <Header title="…" description="…" />
  <PageMain>{/* page body */}</PageMain>
</>
```

Equivalent Tailwind on legacy pages:

`page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8`

`data-testid="page-main"` marks the content region for spacing checks.

## Header Hierarchy

- Title: larger, tight tracking (`text-xl font-semibold`)
- Subtitle: muted (`text-sm text-slate-500`), `select-none` to avoid accidental highlight look
- Subtle border under header separates chrome from page body

Platform Overview example:

- Title: **Platform Overview**
- Subtitle: **RTB platform administration summary**

## Overlap Rules

- Sidebar and header stay `shrink-0`
- Main column scrolls independently (`overflow-y-auto`)
- Fixed header height + page top padding ensure cards clear the header

## Related

- [NAVIGATION.md](./NAVIGATION.md)
- [THEME_GUIDELINES.md](./THEME_GUIDELINES.md)
