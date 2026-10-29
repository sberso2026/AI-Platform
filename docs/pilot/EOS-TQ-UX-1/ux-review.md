# EOS-TQ-UX-1 UX review

Replaced the primitive register (inline question + page-level response boxes) with:

- Enterprise register: All / My Actions / Awaiting Response / Overdue / Closed
- Full-page create with progressive sections and a pre-submit workflow summary
- Submission confirmation (Open TQ / View Register / Print)
- Detail workspace: Overview, Discussion, Evidence, Related Items, History
- Mandatory next-action panel
- Response, review, and governed closeout on the TQ — not on the register
- Human name + role display; Unassigned when Action By is empty
- Print route with A4 CSS

Target density: professional engineering SaaS using existing `@rtb/ui` primitives.

## Founder inspection still required

Authenticated screenshots at 1440×900 and 1920×1080 were **not** captured in this agent environment (no authenticated browser session against Preview with this SHA). `screenshots/` is reserved for founder capture of:

- register
- new TQ
- submitted confirmation
- TQ detail
- response
- review
- closeout
- print preview
