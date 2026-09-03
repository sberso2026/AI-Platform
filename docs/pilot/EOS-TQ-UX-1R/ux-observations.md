# EOS-TQ-UX-1R — UX observations

Cursor observations only. **TQ_ENTERPRISE_UX_PASS=false.** Founder acceptance is required.

Authenticated populated screenshots are in `screenshots/` at 1440×900 and 1920×1080.

## What is clear

- Register hierarchy: All / My Actions / Awaiting Response / Overdue / Closed, plus New Technical Query.
- Status, due date, Initiator, Action By, and next-action copy are obvious on TQ detail.
- Suggested Solution is labelled as initiator proposal, not an approved solution.
- Original query is locked after submit.
- Response / review / closeout are governed steps on the detail workspace, not anonymous register boxes.
- Engineering AI is labelled advisory and cannot approve or close.
- Confirmation names Action By and due date without a raw id.
- Print body uses names, TQ number, and operational sections.

## Observations (not accepted)

- Initiator displays as `silvestre.berso` (email local-part) rather than a professional full name. Not a UUID.
- New-form summary says “Authenticated user” instead of the initiator’s name.
- Workspace directory still includes fixture labels such as `eosadmin1788227371811` as selectable Action By values.
- Founder My Actions is empty when Action By is another person; assignee queue is API-true.
- Print on-screen still shows shell chrome; hide-chrome is print-media CSS.
- Print footer renders “Page of” until the browser print counters run.
- Request Clarification appears on the responder panel as well as review.
- Accept does not emit an in-app notification (audit does).

## Screenshot index

| Screen | Files |
| --- | --- |
| Technical Query register | `register-1440.png` / `register-1920.png` |
| New TQ form | `new-tq-1440.png` / `new-tq-1920.png` |
| Pre-submit summary | `pre-submit-1440.png` / `pre-submit-1920.png` |
| Submit confirmation | `confirmation-1440.png` / `confirmation-1920.png` |
| TQ detail / overview | `detail-1440.png` / `detail-1920.png` |
| Response workflow | `response-1440.png` / `response-1920.png` |
| Review workflow | `review-1440.png` / `review-1920.png` |
| Closeout workflow | `closeout-1440.png` / `closeout-1920.png` |
| My Actions | `my-actions-1440.png` / `my-actions-1920.png` |
| Print preview | `print-1440.png` / `print-1920.png` |
