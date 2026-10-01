# EOS-A11B Engineering Artifact Automation

Purpose: turn an authorized Engineering Work Plan into real, editable Office-compatible engineering artifacts. A11B automates document preparation. It does not autonomously perform uncertified engineering design.

Example: an engineer opens Foundation Design Calculation, clicks Generate Calculation Workbook, and receives a real `.xlsx` that opens in Excel.

## Product purpose

A11A prepared context (project, discipline, system, lifecycle, governing information, requirements, assumptions, interfaces, decisions, analysis, deliverables, readiness, fingerprint). A11B consumes that context server-side and emits:

- Microsoft Excel-compatible XLSX
- Microsoft Word-compatible DOCX
- Microsoft PowerPoint-compatible PPTX

Browser-rendered markdown is not artifact generation. PDF export is **DEFERRED** (no certified conversion path).

## Artifact Template

`EngineeringArtifactTemplate` is a versioned, output-format-specific, code-governed catalog (`EAT-*@1.0.0`). Templates declare work-type compatibility, lifecycle applicability, expected-output alignment, readiness policy, certification status (`EXAMPLE_ONLY` / `VALIDATING` / `CERTIFIED` / `RETIRED`), sheet/section structure, and governed formulas.

Templates are not an admin-mutable SQL catalog in A11B. There is no live template editor. Arbitrary executable scripts are prohibited. Only `CERTIFIED` calculation templates may claim production engineering use. A11B fixtures are `EXAMPLE_ONLY` / `SYNTHETIC`.

## Generation Run

`EngineeringArtifactGenerationRun` records `generation_run_id`, work plan, template code/version, artifact type, output format, requester, timestamp, work-plan input fingerprint, artifact hash metadata, status, warnings, missing-input explanation, and metrics. Secrets are not stored.

## Generated Artifact

`GeneratedEngineeringArtifact` is a `GENERATED_DRAFT` / `READY_FOR_ENGINEER_REVIEW` Office package persisted as generation metadata plus `content_base64` for authenticated download. Statuses are `GENERATING`, `GENERATED_DRAFT`, `READY_FOR_ENGINEER_REVIEW`, `GENERATION_BLOCKED`, `GENERATION_FAILED`, `SUPERSEDED`. Generation never yields `ENGINEERING_APPROVED`, `IFC_APPROVED`, or `DESIGN_CERTIFIED`.

Storage reuses the Work Plan tenant/workspace boundary. This is not a new DMS and not a new blob-storage platform. Canonical `engineering_documents` is not auto-created.

## Provenance Manifest

Every generated file has an `ArtifactProvenanceManifest`: project, workspace, Work Plan, work template/version, artifact template/version, lifecycle, discipline, system/asset, governing information refs (title/revision/purpose), requirements, assumptions, interfaces, decisions, analysis references, deliverable reference, input fingerprint, generation timestamp, generation run. Human-readable titles are preferred over unnecessary UUIDs. Security tokens are not embedded.

Embedded provenance:

- XLSX: Cover, References (source register), EOS Context, Revision History
- DOCX: document control, source register, assumptions/limitations
- PPTX: title/context and references slides

## XLSX architecture

Calculation workbooks include Cover, Inputs, Calculations, Results, References, Assumptions, EOS Context, Revision History where the template needs them. Option-study workbooks use Context, Options, Criteria, Evidence, Comparison, Assumptions, Risks, References.

## Formula governance

Excel formulas are real spreadsheet formulas sourced only from the Artifact Template. LLM-generated equations are prohibited. Client-supplied formula strings are rejected. A11B does not invent loads, material properties, soil parameters, design factors, code coefficients, allowable limits, or technical conclusions.

The certified fixture `EAT-CALC-EXAMPLE-BEARING` uses synthetic vertical load / synthetic plan area (`B6 = B4/B5`) marked `SYNTHETIC` / `EXAMPLE_ONLY` / `NOT A CERTIFIED DESIGN TEMPLATE`. Purpose is to certify real XLSX formulas, units, provenance, and editability — not structural design.

## Formula safety

Untrusted text beginning with `=`, `+`, `-`, or `@` is escaped so it cannot become an executable formula unless the template field is a governed formula. ZIP path traversal is rejected. Macros, VBA, executable attachments, and embedded scripts are not created (`MACROS_CREATED = NO`). Excel `fullCalcOnLoad` is set; cached numeric results are not fabricated. Recalculation is expected in Excel or a compatible spreadsheet.

## Unit handling

Where templates use values, units are explicit (kN, m2, kPa). A11B does not implement a universal unit engine and does not silently mix N/kN, Pa/kPa/MPa, mm/m, or kg/t.

## DOCX generation

Design reports include document control, purpose/scope, project context, design basis, requirements, inputs, assumptions, interfaces, analysis references, decisions, findings placeholders, limitations, source register, and revision history. Technical conclusions are not fabricated.

## Specification generation

Specification drafts populate only supported project-specific information. Unsupported material grades, code editions, acceptance criteria, and inspection frequencies remain `PLACEHOLDER / UNRESOLVED`.

## PPTX generation

Option-study presentations use real text boxes (not flattened images): title, problem, context, options, inputs, comparison, trade-offs, risks, information gaps, decision required, references.

## Option-study boundary

Options remain separate. No automatic winner, recommended option, or hidden weighted score. If an authorized human Decision already exists, the presentation may report that recorded Decision; it does not invent one.

## RFI/TQ generation

RFI and TQ response drafts include query/context, affected objects, sources, potential impacts, and a draft response section marked `DRAFT FOR ENGINEER REVIEW`. Correspondence is not issued.

## AI narrative boundary

A11B does not depend on an external LLM. Deterministic structured content and placeholders are generated. `AI_NARRATIVE = NOT_USED`. If a future approved model is used, it may draft narrative only, with source references, prompt/model provenance, draft labels, and human review. It may not invent formulas or approve engineering.

## Human engineering review

All artifacts remain drafts requiring engineer review. Generation is document preparation, not engineering judgment.

## Work Plan integration

Generation is invoked from `/engineering/work/plans/[id]` Expected Outputs: Generate, Download, View Provenance, Regenerate, Compare Context. Context is retrieved server-side from the authorized Work Plan. Client-submitted `authoritative` / `approved` / `current` claims are rejected.

Readiness policy:

- `REQUIRE_READY` (detailed-design calculation fixture): fail closed on `BLOCKED_INFORMATION_MISSING` / `STALE` / `UNACCEPTED`
- `ALLOW_READY_WITH_CONDITIONS`
- `ALLOW_INCOMPLETE_DRAFT` (concept / option study): produce a draft that exposes assumptions, missing information, conditional status, and human-review required. No silent defaults.

## Document boundary

Generation does not create a canonical issued Document. Draft bytes are generation output, not managed-repository content. Publication/ingestion remains the existing Document domain.

## Deliverable boundary

A generated artifact may be a candidate output. Generation does not complete a Deliverable, increase maturity, mark reviewed, configured, or approved.

## Digital Thread

Relations reuse existing `USES` / `DEPENDS_ON` semantics: `engineering_work_plan` USES `engineering_generated_artifact`; artifact USES information; artifact DEPENDS_ON requirements. No parallel artifact graph.

## Work events

A10B `EngineeringWorkEvent` is extended: `ARTIFACT_GENERATION_STARTED`, `ARTIFACT_GENERATED`, `ARTIFACT_GENERATION_FAILED`, `ARTIFACT_REGENERATED`. No employee typing or download-time productivity metrics.

## Managed Repository / privacy

`DEFAULT_CAPTURE_POLICY = DENY` is unchanged. Downloaded local copies are not scanned or auto-reingested. Personal files such as `C:\Users\User\Documents\Personal\Mortgage.xlsx` remain outside EOS. Local recursive scanning is prohibited.

## Security / RLS

Tables `engineering_artifact_generation_runs` and `engineering_generated_artifacts` are workspace-membered, tenant-scoped, with admin-only delete. Cross-workspace and cross-tenant reads return empty. Anonymous reads return empty. Authenticated download checks workspace/project server-side, uses `Content-Disposition: attachment`, safe filenames (not UUID-only, no issued-revision implication), and does not put tokens in filenames. AAL2 is reused from Engineering Work identity assurance; no new MFA code. Template catalog mutation is not exposed to normal engineers.

## Office validation

Generated packages are ZIP/OPC with `[Content_Types].xml`, workbook/document/slide XML, expected sheets/headings/slides, and real formula cells where applicable. Native Office HITL is recorded separately and is not fabricated.

## Limitations

- Calculation templates are `EXAMPLE_ONLY` until separately certified.
- PDF export deferred.
- No AutoCAD plugin, Excel/Word add-in, SharePoint/Teams/Outlook/Aconex connector, solver execution, VBA/macros, new DMS, new Event Bus, or production deployment.
- After an engineer edits a downloaded file, EOS does not know those edits unless the file is later explicitly uploaded/published or a future managed connector supplies a governed revision.

## A11C handoff

Connect Engineering Work Plans and generated artifacts to the engineers’ existing desktop and engineering tools through governed launch/open/export/import contracts, using existing External Tool Governance and managed-repository boundaries, without desktop surveillance or replacing Excel, Word, Acrobat, CAD, or specialist analysis software.
