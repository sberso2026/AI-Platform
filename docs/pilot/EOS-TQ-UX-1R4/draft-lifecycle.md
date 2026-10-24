# Draft lifecycle

Canonical path:

Create → Save Draft → Reopen Draft → Edit → Save Draft again **or** Submit → Awaiting Response → Respond → Review → Close.

## Behaviour

- Save Draft creates or updates **the same** `engineering_technical_queries` row.
- Reopen uses `/engineering/technical-queries/new?id=<draftId>` and PATCHes `save_draft` / `submit`.
- Editing a Draft never allocates a new TQ number.
- Submit of a Draft transitions that row to `awaiting_response` and runs the existing assignment notification.
- Save Draft does **not** notify Action By.
- After submit, `queryLocked` remains true. Query HTML is not silently rewritten.

## UX

Draft detail shows:

- `[DRAFT]`
- This technical query has not been submitted.
- Edit Draft
- Submit Technical Query
- Next action: initiator to complete and submit; edit the draft or submit it when ready.

Register status cell: `Draft | Edit Draft` (`relative z-10` so the row overlay does not steal the click).

Unsaved navigation uses: `You have unsaved changes. Leave without saving?`
