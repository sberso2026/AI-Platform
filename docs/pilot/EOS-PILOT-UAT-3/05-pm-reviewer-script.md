# PM / reviewer script (human, ~45 minutes)

**Host:** https://eos-pilot.rtbea.com.au  
**PM account:** invited admin + EOS seat.  
**Reviewer account:** invited viewer + EOS seat (read-only). Run reviewer steps on the viewer identity where possible.  
**Do not** use Subscription & Billing or Growth Credits. Do not promote Production.

Use [06-observation-form.md](./06-observation-form.md), [15-ai-trust-evidence.md](./15-ai-trust-evidence.md), [16-document-usability-evidence.md](./16-document-usability-evidence.md), and [07-value-validation.md](./07-value-validation.md).

RTB must not operate the UI for you.

## PM

| Step | Task | Pass if |
|---|---|---|
| M1 | Password sign in / out / in | Command Centre |
| M2 | Project overview (Projects list + one project workspace) | Counts/lists understandable after load |
| M3 | Review risks, actions, TQs on that project | Same project; no other-tenant names |
| M4 | Review / update permitted project or document metadata | Saves, or a clear permission message. Do not treat 403 as success |
| M5 | Inspect documents, revision, number source / review state | Filename fallback vs confirmed number is clear |
| M6 | Ask Engineering AI a project or document question | Advisory; complete the trust block |
| M7 | Verify citations and open source if offered | You can say verified / not verified |
| M8 | Review a report | Usable |
| M9 | Note missing information vs incumbent tools | Written on the value form |

## Reviewer / read-only

| Step | Task | Pass if |
|---|---|---|
| R1 | Sign in as viewer | Command Centre or a clear read-only home |
| R2 | Open project, risks, TQs, documents | Readable |
| R3 | Inspect document revision / provenance | Visible; no silent edit |
| R4 | Attempt a create/update you should not have | Rejected or control hidden — not a silent write |
| R5 | Engineering AI / report if visible | Advisory only; complete the trust block if you asked |

## Close

Sign out. Do not change owner. Do not assign seats. Do not invite further users during your session unless the founder asked you to.
