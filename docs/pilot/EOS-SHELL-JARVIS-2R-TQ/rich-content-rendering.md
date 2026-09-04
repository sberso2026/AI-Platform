# EOS-SHELL-JARVIS-2R-TQ rich content rendering

## Register projection

`querySummary` is derived at presentation time from canonical `question`:

- strip tags
- collapse whitespace
- drop figure/image implementation markup
- drop attributes, UUIDs, and API paths
- truncate to ~180 characters

Canonical HTML is not updated. Desktop register shows title (max 2 lines) plus 1–2 lines of summary, with a compact image/attachment indicator.

## Detail rendering

`TqQueryHtml` sanitizes then renders:

- paragraphs and line breaks
- bullets and numbered lists
- inline images via existing authorized query-image GET
- captions under figures

Read-only. No editor chrome. Malformed markup is sanitized; recoverable plain text is shown if HTML cannot be kept.

## Print

Print preview uses `TqQueryHtml` on canonical content. No screen clipping, no internal scroll box, no raw HTML text.

## Image indicator

Register shows `N image` / `N attachment`. No thumbnails, document IDs, storage keys, or URLs in visible text.
