# EOS-A12A Unified Engineering Workbench

Daily engineer experience is **work**, not modules. `/engineering/work` is the canonical Unified Engineering Workbench. `/engineering` remains Command Centre and now leads with **Open Engineering Workbench**. Deep domain modules stay reachable from Explore, specialist disclosure, and deep links.

## Routing decision

- Primary engineer surface: `/engineering/work`
- No `/engineering/workbench2`
- Work Generator, Artifact Automation, Tool Orchestration, Pre-Issue Review, Change/Impact, and Optimization are reused, not replaced

## Daily engineer experience

The workbench answers:

- What am I working on? (project context bar + Continue Work)
- What can I start? (lifecycle-aware Start Engineering Work)
- What can EOS prepare? (Work Generator)
- What inputs apply? (Governing Information from the current Work Plan snapshot)
- What is blocking me? (readiness in plain language)
- What changed? (material EngineeringWorkEvent only)
- What action should I take? (lifecycle actions)
- Can EOS generate / review / assess impact / respond to RFI/TQ? (A11B–A11E, from the same surface)

Ask EOS is contextual and secondary. The page is not a dashboard of KPI tiles and not a chatbot-first shell.

## Lifecycle-aware actions

Actions adapt to CONCEPT, PREFEASIBILITY, FEASIBILITY, FEED, DETAILED_DESIGN, CONSTRUCTION, COMMISSIONING, OPERATIONS, and MODIFICATION. Irrelevant actions are not presented equally. Run Pre-Issue Review requires a Work Plan. Solver/CAD actions stay honestly unavailable where uncertified.

## Start Work / Continue Work

Start Work uses the existing A11A Work Generator. Continue Work lists authorized EngineeringWorkPlans for the selected project view. Project selector is VIEW only. Canonical object ownership (Work Plan, artifact, review, impact, change, RFI/TQ) is never rewritten because the UI project changed.

Empty state is productive: “No active engineering work for this project.” with start actions.

## Artifact generation and tools

Workbench generation calls A11B only. Downloads reuse A11C handoff language (download/open in Excel/Word/PowerPoint). EOS does not claim unsupported native desktop launch. Pre-Issue Review and Change/Impact run from the plan without requiring the Review or Change module unless deeper investigation is needed.

## Template governance

A12A extends `EngineeringArtifactTemplate`. It does **not** create a second template domain or a new artifact engine.

Deterministic `resolveEngineeringArtifactTemplate`:

1. COMPANY-APPROVED PROJECT / CLIENT TEMPLATE
2. COMPANY OFFICIAL TEMPLATE
3. EOS DEFAULT PROFESSIONAL TEMPLATE

Only among templates valid for artifact type, and optional discipline / lifecycle / work type / project scope.

Source classes: `EOS_DEFAULT`, `COMPANY_OFFICIAL`, `PROJECT_CLIENT_APPROVED`.

A project/client file is not authoritative until it is registered, company-approved, and ACTIVE for that project.

If no official template exists, EOS Default is selected automatically (SME path). If an official template is configured but missing/unreadable, default tenant policy `OFFICIAL_TEMPLATE_REQUIRED` fails closed (`TEMPLATE_UNAVAILABLE`). `ALLOW_EOS_DEFAULT_IF_OFFICIAL_UNAVAILABLE` is an explicit alternative. Equal-precedence ACTIVE matches return `TEMPLATE_RESOLUTION_CONFLICT`. No created/modified-date or AI selection.

Template versions are immutable in artifact provenance. Activating v8 does not rewrite artifacts generated with v7.

### Calculation shell vs definition

Company/project calculation **shell** controls branding, cover, title block, and layout. Engineering calculation **definition** controls formulas, units, and checks. Company template approval does not certify formulas. Current fixture remains `EXAMPLE_ONLY`.

### Storage

Template **metadata** is in Postgres (`engineering_artifact_template_policies`). Template **binaries** are packaged EOS default assets plus metadata references (`packaged_asset_key`). A12A does not add `content_base64` template storage. Uploaded company binary storage is not implemented in A12A; settings register metadata and packaged-asset keys. `A12A_BINARY_DUPLICATION = NO`. Artifact bytes remain on `engineering_generated_artifacts.content_base64` (HIGH risk, A13/A14).

### Settings / security

`/engineering/settings/templates` is AAL2-gated admin policy. Engineers may read applicable metadata. Mutation requires engineering admin + AAL2. RLS isolates tenant/workspace. Provenance records template id/code/version, source class, resolution reason, fallback used, and calculation definition id/version/certification.

White-label: document creator is tenant company name when configured, otherwise “Engineering OS”. RTB branding is not forced onto customer artifacts.

## Browser HITL

Authenticated staging HITL must be attempted honestly (login, AAL2, workbench, start work, generate, template display, download, pre-issue, change/impact, project switch). Do not fabricate PASS.

## Limitations (carry-forward)

- Artifact `content_base64` HIGH risk
- Hosted ClamAV unavailable (fail-closed upload preserved)
- Semantic AI review unavailable
- PDF export deferred
- Calculation templates EXAMPLE_ONLY
- Real enterprise connectors not implemented
- Real solver execution not certified
- Company template **binary upload** not implemented; metadata + packaged fixtures only
- Authenticated browser HITL remains incomplete until evidenced

## A12B handoff

My Engineering Day, team coordination, and targeted notifications on this workbench — without employee productivity surveillance or a dashboard-first regression.
