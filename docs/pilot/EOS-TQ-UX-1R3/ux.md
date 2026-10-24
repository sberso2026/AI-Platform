# EOS-TQ-UX-1R3 UX

## Scroll trap (New TQ / Submit unreachable)

Platform shell uses `h-screen overflow-hidden`. The register already used `flex-1 overflow-y-auto`. New TQ and detail did not, so the long form was clipped and Submit sat below the fold with no page scroll.

Fix: shared `TQ_SCROLL_MAIN` (`flex-1 min-h-0 overflow-y-auto`) on register, create, detail, and print.

Live capture: `newTqScroll=true`, all form sections reachable, sticky Submit visible at 1366 / 1440 / 1920.

## Back navigation

Explicit `TqBackLink` on:

- New TQ / confirmation: ← Back to Technical Queries (unsaved-change confirm)
- Detail: ← Back to Technical Queries
- Response / Review / Closeout sections: ← Back to TQ-XXX
- Print: ← Back to TQ-XXX

## Sticky actions + submit reasons

Sticky bar: Cancel · Save Draft · Submit Technical Query.

Disabled Submit is explained, e.g. `Enter Query / Information Required.` Suggested Solution is not required.

## Register

Work queues stay a compact segmented control (All / My Actions / Awaiting Response / Overdue / Closed).

The oversized standalone filter row is removed. Filters live in column headers (search, project, discipline, status, initiator, action by, priority, due/updated sort). Active chips + Clear all filters.

Titles wrap to two lines (`line-clamp-2`) with tooltip.
