# Issue register — EOS-PILOT-UAT-2

Severity rules match UAT-1: BLOCKER stops work; HIGH is a core workflow failure after load; MEDIUM is operable but misleading; LOW is copy, a11y, or latency.

| ID | Sev | Workflow | Finding | Workaround |
|---|---|---|---|---|
| UAT-2-H1 | HIGH | Project edit | Live `PATCH /api/engineering/projects/:id` returned 403 for founder admin. Create/list/open worked. HTTP write policy is `project.create`; service update required `project.update`. Code now asserts `project.create` to match the write route. Not on Preview until deployed. | Create a new project instead of editing; or wait for Preview deploy |
| UAT-2-M1 | MEDIUM | Project open | Project workspace shell paints in ~1s then stays on “Loading project workspace…” while GET project + dashboard run | Wait; do not assume the project is missing |
| UAT-2-M2 | MEDIUM | Engineering AI | Answer was grounded and project-scoped (`grounded=true`, no tenant leak) but `generationFailed=true` / retrieval-only | Treat as evidence list, not generated prose |
| UAT-2-M3 | MEDIUM | Users copy | Live `/users` still shows Canonical Auth invite wording until Preview deploy. Directory **did** list 16 members for founder after wait | Ignore pipeline wording; do not invite |
| UAT-2-M4 | MEDIUM | Commerce | Known: Trialing label on licensed 5-seat pool; empty/zero flash while Installed Products hydrates | Wait for load; do not Start Trial |
| UAT-2-L1 | LOW | A11y | Live New Project labels are not associated (`associated=0`). Code uses `htmlFor`/`id` via `LabeledTextField` pending Preview deploy | Tab through the form fields in order |
| UAT-2-L2 | LOW | Performance | Projects list API ~7.5s; risk/TQ pages ~4–5s shell. TTFB ~55ms. Dominant layer is client API waterfall, not SSR | Known limitation |
| UAT-2-L3 | LOW | Hygiene | WSB-1RC tagged `certification_fixture` + `hidden_from_pilot_ui` in DB; not deleted. Already absent from the default-workspace list | Direct URL still valid for cert |

No BLOCKER. Do not classify the Trialing SKU or 4–10s pages as blockers.
