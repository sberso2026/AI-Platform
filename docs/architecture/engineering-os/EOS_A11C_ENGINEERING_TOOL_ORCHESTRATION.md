# EOS-A11C Engineering Tool Orchestration & Round-Trip Handoff

Purpose: connect Engineering Work Plans and generated artifacts to the engineers’ existing specialist tools without replacing those applications. EOS is the engineering context and orchestration layer. Excel, Word, PowerPoint, Acrobat, CAD, and analysis software remain the authoring and analysis tools.

The governed concept is `EngineeringToolHandoff`: a user-authorized transition from EOS-managed engineering context to an approved external engineering tool. It records tenant, workspace, project, work plan, artifact/source, tool, capability, handoff mode, requester, timestamp, status, input fingerprint, provenance, and return/publication state. It is not a JobService execution job.

A11C does not launch arbitrary desktop executables from the browser. A normal web browser cannot safely inspect desktop application state. Handoff modes are explicit and only marked implemented when the capability exists.

## Product purpose

Engineers open a Work Plan such as Foundation Design Calculation and see governed actions in one place:

1. Governing inputs prepared
2. Calculation workbook generated
3. Download and Open in Excel (browser/OS download; EOS does not launch Excel)
4. Current drawing Open (current governed source, not the most recently modified file)
5. Geotechnical report Open
6. Structural analysis — tool execution currently unavailable / external dependency; Prepare Analysis Request
7. Publish Updated Calculation (explicit return)

## Browser limitation

A11C distinguishes:

| Mode | Status |
| --- | --- |
| `BROWSER_DOWNLOAD` | Implemented. Secure download with MIME type, safe filename, workspace/project authorization, provenance retained. |
| `MANAGED_REPOSITORY_OPEN` | Contract. Open Managed Source / View Current Revision / Download Controlled Copy. Native SharePoint/EDMS connectors are A13. |
| `DESKTOP_BRIDGE` | `CONTRACT_ONLY`. Future `rtb-eos://handoff/{handoffId}` carries only an opaque id. |
| `EXECUTION_HOST` | Reuses A7B. Fail-closed until the capability is certified. SPACE GASS remains unexecuted. |

UI wording is “Download and Open in Excel/Word/PowerPoint”. EOS does not claim it launched Office when the browser only downloaded the file.

## Tool registry reuse

Existing External Tool Governance is reused (`packages/engineering-os/src/external-tools/`, `/engineering/settings/external-tools`). A11C does not create a second catalog. Office/CAD/Acrobat capabilities used for Work Plan handoff live in `HANDOFF_CAPABILITIES` and consume SPACE GASS catalog/readiness from the existing registry.

## Capability governance

Capabilities are granular: `OPEN_XLSX`, `EDIT_XLSX`, `OPEN_DOCX`, `EDIT_DOCX`, `OPEN_PPTX`, `VIEW_PDF`, `EDIT_DWG`, `RUN_STRUCTURAL_ANALYSIS`, `IMPORT_ANALYSIS_RESULTS`, `EXPORT_MODEL`. Installation is not inferred capability. Tool action fails closed when the required capability is not READY. SPACE GASS `RUN_STRUCTURAL_ANALYSIS` is `CAPABILITY_NOT_CERTIFIED`.

## Desktop Bridge architecture

Future EOS Desktop Bridge performs explicit user-requested desktop handoffs. It must not monitor desktop activity, scan local drives, capture keystrokes, capture browser history, record time in applications, or capture personal files. Managed repository privacy is unchanged: `DEFAULT_CAPTURE_POLICY = DENY`, allowlisted repositories only, local recursive scan prohibited, personal files outside EOS.

## Security / trust model

- Executable identity comes only from governed tool configuration.
- User-supplied executable paths, shell commands, and command-line strings are rejected (`ARBITRARY_EXECUTABLE_DENIED`).
- No `shell:`, `file://` launch, PowerShell, or `cmd.exe` from the browser.
- Short-lived handoff tokens: 32-byte secret, SHA-256 stored, 10-minute TTL, single-use, timing-safe compare. Protocol URL carries only the opaque handoff id. No JWT, password, TOTP, file content, or command in the URL.
- Project ownership is taken from the Work Plan / artifact / managed source, not from the current EOS UI project filter. Cross-project UI mismatch shows “This artifact belongs to Project …” with Switch EOS View / Continue without switching. Membership is not rewritten.
- Returned uploads: expected type, OpenXML/magic, size limit 15 MB, safe filename, SHA-256, EICAR fixture, fail-closed malware gate.

## Office workflows

Excel / Word / PowerPoint share the same certified flow:

Work Plan → Generate artifact → secure browser download → open through normal OS/browser behavior → engineer edits locally → EOS does not monitor the local copy → explicit Publish Updated Artifact → new governed `RETURNED_FROM_ENGINEER` version → original generated draft preserved → Digital Thread lineage → review required.

No real-time Office integration. No Office add-ins. Native Office HITL is recorded separately and is not fabricated.

## Acrobat / PDF workflow

A11B PDF export remains **DEFERRED**. A11C may open current governed PDF sources, download a controlled copy, or open related review. PDF editing automation is not implemented.

## CAD workflow contract

AutoCAD / Revit / MicroStation: no plugin in A11C. Future flow is managed drawing → Desktop Bridge → approved CAD tool → publish to managed repository → `SOURCE_REVISED` / `DRAWING_ISSUED`. No command-level CAD monitoring. UI: “Desktop integration not connected.”

## Analysis tool contract

A7B External Tool Execution is reused. Work Plans may prepare an Analysis Request with input manifest, required capability, tool readiness, and authoritative inputs. Generic Tool/Capability/Adapter contracts support future ETABS, SAP2000, STAAD, PLAXIS, CAESAR II, ETAP, HYSYS without vendor logic in Work Plans. GUI automation and screen scraping are prohibited.

## SPACE GASS boundary

SPACE GASS 14.2 Trial: `API_AVAILABLE = NO`, `AUTOMATION_PERMISSION = REQUIRES_CONFIRMATION`, `REAL_SOLVER_EXECUTION = NOT_CERTIFIED`, `PRODUCTION_USE_PERMITTED = NO`. A11C shows readiness and prepares handoff context only. No solver run.

## Round-trip publication

Publish Updated Artifact authorizes workspace/project from the origin artifact, validates type/size/package/hash, runs the fail-closed malware gate, creates a new governed version, and preserves the original generation. Production returns require hosted ClamAV (`RTB_REVIEW_CLAMAV_URL`). Staging tests may pass `controlledFixture` only inside the domain service, never via the HTTP API.

## Generated vs returned artifacts

`GENERATED_DRAFT` does not transfer formula certification, technical correctness, approval, or authority to `RETURNED_FROM_ENGINEER`. Returned artifacts remain `READY_FOR_ENGINEER_REVIEW`. Tool use never implies engineering approval.

Lineage retains generated artifact id, generation run, original hash, returned hash, return timestamp, returning user, and source Work Plan.

## Multi-project safety

Handoff and return derive project from artifact/Work Plan lineage. Switching the EOS view to another project cannot attach a Project A artifact to Project B.

## Managed Repository privacy

`DEFAULT_CAPTURE_POLICY = DENY`. Allowlisted repositories only. Local recursive scan prohibited. Personal files such as `C:\Users\User\Documents\Personal\Mortgage.xlsx` remain invisible. Downloaded EOS files such as `C:\Users\User\Downloads\ER-A1_CALC_DRAFT.xlsx` are not monitored after download. Only explicit Publish/Upload brings edited content back.

## Digital Thread

Existing graph is composed, not replaced:

`WORK_PLAN` → `GENERATED_ARTIFACT` → `TOOL_HANDOFF` → `RETURNED_ARTIFACT` → Review → Deliverable

Relations reuse `USES` / `SUPERSEDES` / `DEPENDS_ON`. Object type `engineering_tool_handoff` is added to existing thread roots.

## EngineeringWorkEvent

A10B events are extended: `TOOL_HANDOFF_PREPARED`, `TOOL_HANDOFF_STARTED`, `ARTIFACT_RETURNED`, `ARTIFACT_PUBLISHED`. Application-opened, window-focused, and user-active are not engineering events. Keystrokes, usage duration, screen contents, and unrelated files are not recorded.

## Security / RLS

`engineering_tool_handoffs` is workspace-membered and tenant-scoped. Same workspace allowed; same tenant other workspace denied; cross-tenant denied; anonymous denied. Engineer delete is admin-only. AAL2 is unchanged: normal handoff follows product policy; tool/admin mutation and high-risk execution remain on existing External Tool Governance.

Negative tests: unauthorized workspace, cross-tenant, anonymous, expired/tampered token, arbitrary executable, path traversal, unsafe filename, cross-project mismatch, personal file.

## Storage audit

| Store | Location |
| --- | --- |
| Artifact metadata | `engineering_generated_artifacts` + `engineering_artifact_generation_runs` |
| Artifact binary | `engineering_generated_artifacts.content_base64` (relational TEXT) |
| Type | relational_text_base64 |
| Scale risk | **HIGH** |
| Recommended A13/A14 path | Move published bytes into the existing `engineering-documents` bucket; keep generation metadata relational. Do not create a new blob/DMS platform in A11C. |

Representative generated Office packages are tens to hundreds of kilobytes in fixtures; unconstrained `content_base64` in Postgres will not scale for production volumes.

## Malware scan status

`MALWARE_SCAN_STATUS` is `HOSTED_CLAMAV_CONFIGURED` when `RTB_REVIEW_CLAMAV_URL` is set, otherwise `UNAVAILABLE_HOSTED_CLAMAV`. Production upload readiness is blocked until hosted ClamAV is available. The gate is not weakened.

## Dependency review

A11B locked: `exceljs@^4.4.0`, `docx@^9.8.1`, `pptxgenjs@^4.0.1`. A11C introduces no additional runtime dependencies.

## A11D handoff

Use governed Work Plans, generated/returned artifacts, authoritative project information, Digital Thread relationships, and existing Engineering Review AI to perform practical pre-issue checks for stale inputs, missing evidence, unsupported assumptions, revision inconsistencies, cross-document conflicts, and engineering package completeness without autonomously approving the design.

## Staging migration ledger

Migration `20260930180000_eos_a11c_engineering_tool_orchestration.sql` checksum `37cf6418e1047b1445e0b8e311bc6a58399b1e40a3763b57cc3527ee970435b9` applied to staging `rntonzigxwxcjlcsadip`.
