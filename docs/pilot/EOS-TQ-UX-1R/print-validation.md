# EOS-TQ-UX-1R — Print validation

**Host:** https://eos-pilot.rtbea.com.au  
Record: TQ-009 (closed). Captured with founder session at 1440×900 and 1920×1080. Print CSS uses `@page { size: A4 }` and hides `header`, `nav`, `aside` in `@media print`.

## Present on the live print view

- TQ number (TQ-009)
- Title
- Project (Controlled Pilot UAT Project)
- Status (Closed)
- Initiator (silvestre.berso)
- Action By (RTB Pilot Launch Admin)
- Dates (raised, due, response, close)
- Engineering metadata (classification, priority; empty discipline/area/system shown as —)
- Query / Information Required
- Suggested Solution
- References list (document + follow-up action titles)
- Client / Technical Response
- Response basis
- Follow-up actions
- Closeout comments
- Printed timestamp
- Page numbering placeholders (`Page of`) — CSS `counter(page)` / `counter(pages)` apply in the browser print dialog, not in DOM text

## Not present

- Raw UUIDs in the print body
- Navigation is hidden in print media. On-screen preview still shows the Engineering chrome until the browser print dialog.

`TQ_PRINT_A4_LIVE_PASS=true`  
`TQ_LIVE_PRINT_PASS=true`

Screenshots: `screenshots/print-1440.png`, `screenshots/print-1920.png` (print media). On-screen preview: `print-screen-*.png`.
