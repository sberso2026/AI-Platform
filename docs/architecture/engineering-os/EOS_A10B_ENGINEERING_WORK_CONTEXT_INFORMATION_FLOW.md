# EOS-A10B Engineering Work Context & Information Flow

Purpose: establish the canonical Engineering OS model for how engineering work and information move through the engineer's normal working environment without turning EOS into desktop-surveillance software.

EOS tracks **ENGINEERING WORK**, not employee computer activity.

## Managed Engineering Repository

EOS may ingest information only from explicitly configured approved sources (`ManagedEngineeringRepository`).

Possible managed source kinds:

- SHAREPOINT_LIBRARY
- NETWORK_FOLDER
- CORPORATE_SYNCED_FOLDER
- ENGINEERING_EDMS
- ENGINEERING_APPLICATION
- PROJECT_MAILBOX
- PROJECT_TEAMS_CHANNEL
- OTHER_APPROVED_ENTERPRISE_SOURCE

A10B establishes contracts and governance. It does not assume all instances are connected.

Trust is determined from the configured repository identity, not a drive letter. An approved corporate synchronized folder may physically exist on a local drive.

Connector secrets are not stored on the repository row. Existing Secrets/integration architecture remains the credential owner.

## Privacy model

DEFAULT_CAPTURE_POLICY = DENY  
ALLOWLISTED_REPOSITORIES_ONLY = TRUE

Prohibited:

- LOCAL_DRIVE_RECURSIVE_SCAN
- UNMANAGED_FILE_INDEXING
- PERSONAL_ONEDRIVE_ACCESS
- PERSONAL_EMAIL_ACCESS
- BROWSER_HISTORY_CAPTURE
- KEYSTROKE_CAPTURE
- mouse movement, application-open duration, idle time, browser history
- employee productivity scoring, hours-in-application ranking, email-volume ranking, AI employee-performance ranking

Personal files such as `C:\Users\User\Documents\Personal\Mortgage.xlsx` are **OUTSIDE_EOS_SCOPE**. EOS must not index contents, store filename, read formulas, create events, send content to AI, or generate telemetry containing content unless the user explicitly publishes a managed copy into an approved repository.

Unmanaged scratch files such as `C:\Temp\scratch_calc.xlsx` are ignored until explicitly published. Local history is not retroactively ingested.

## EngineeringWorkEvent

Canonical material engineering work/state event. It does not duplicate source-object content.

Identity/context includes tenant, workspace, authorized project, event type, source system/object, optional Information Ref, discipline/system/asset/deliverable, actor, occurred_at, recorded_at, managed repository, provenance, and materiality.

Audit remains separate:

- Audit = who changed governed state
- EngineeringWorkEvent = material engineering workflow event

## Event taxonomy

Bounded catalog includes source created/revised/published, document review requested/completed, calculation published, analysis executed, drawing issued, interface information changed, RFI created/responded/closed, decision recorded, action created/completed, deliverable updated/issued, configuration changed, meeting action/decision confirmed.

A10C-compatible reserved types: information received/overdue, handover published/accepted. Full handover is not implemented in A10B.

`EngineeringWorkEventNormalizer` translates source-domain events into canonical work events. Duplicate source events are idempotent on `(tenant, workspace, source_system, source_event_id)`. `occurred_at` is preserved; `recorded_at` is EOS time. Source history is not silently rewritten.

## Materiality

Deterministic classification: MATERIAL, ROUTINE, INFORMATIONAL. No LLM-only materiality authority. No employee-performance inference.

## Workflow integration model

Engineers continue using Excel, Word, PowerPoint, Acrobat, AutoCAD, analysis software, SharePoint, Teams, Outlook, Aconex/OmTrak/EDMS, OneNote, Power BI, BIM, P6, ERP, and approved AI tools. EOS connects **material engineering events** produced by those workflows.

### Excel

Save/revision in a managed repository may produce SOURCE_REVISED. Controlled publication may produce CALCULATION_PUBLISHED. Individual cell edits, formula-entry keystrokes, and time spent in Excel are not captured unless a future governed calculation plugin publishes defined result data.

### Word

Managed specification/report revision, review, and publication may produce corresponding events. Word remains the authoring tool.

### Acrobat

Viewing alone is not material. Controlled revision received, review markup published, review completed, comment disposition confirmed, and document issued may be material.

### CAD

Future AutoCAD/BIM integration may emit drawing/model revision and controlled publication. Editing commands are not tracked. No CAD plugin in A10B.

### Analysis tools

Composed with A7B governed tool execution: ANALYSIS_EXECUTED. Managed import of results: SOURCE_PUBLISHED. No real solver execution in A10B.

### SharePoint

Future connector events FILE_CREATED, FILE_REVISED, FILE_MOVED, CONTROLLED_METADATA_CHANGED, FILE_PUBLISHED normalize into EngineeringWorkEvents. Connector not implemented.

### Teams

EOS must not ingest all Teams conversations. Future integration may ingest approved project channel events, confirmed meeting actions/decisions, and explicitly linked messages. AI-generated candidates require human confirmation.

### Outlook

EOS must not scrape all Outlook email. Allowed future patterns: project mailbox, explicit Add to EOS, project-tagged correspondence, approved connector rules. Personal email remains outside scope.

### EDMS / RFI

Future Aconex/OmTrak/other EDMS events: RFI_CREATED, RFI_RESPONDED, RFI_CLOSED, CORRESPONDENCE_ISSUED. No vendor-specific connector in A10B.

### AI tools

Independent ChatGPT/Copilot sessions are not monitored. Only EOS-mediated AI interaction or explicit user-published project output may enter EOS. AI-extracted meeting/email information remains CANDIDATE until a human confirms. No automatic Decision creation from a transcript. No automatic Requirement change from email.

## Digital Thread

EngineeringWorkEvent may link into Digital Thread where useful. A material information change may surface **POTENTIAL IMPACT** candidates by deterministic relation traversal. Actual engineering impact is not automatically declared. Digital Thread is not an employee activity log.

## Information Intelligence

An event may point to an A10A `EngineeringInformationRef`. Information authority remains A10A-owned. Work Event does not determine authority. AUTHORITATIVE_FOR_PURPOSE is not engineering approval.

## Security / RLS

Live RLS on `engineering_managed_repositories` and `engineering_work_events`. Authorized workspace members may read. Cross-workspace and cross-tenant deny. Anonymous deny. Project-scoped users cannot broaden repository scope. Work events belong to authorized tenant/workspace/project. A9 project-context architecture is reused. No raw caller-controlled project authority.

## AAL2

Managed repository policy mutation reuses A9 AAL2 architecture. No new MFA implementation.

## Future connectors

A13A should map external events through `EngineeringWorkEventNormalizer` onto the existing Kernel Event Bus.

Architecture:

Source Domain / Future Connector → EngineeringWorkEventNormalizer → Existing Event Bus → EngineeringWorkEvent → Digital Thread / Information / Notifications

NEW_EVENT_BUS_CREATED = NO  
NEW_SEARCH_ENGINE_CREATED = NO  
NEW_GRAPH_STORE_CREATED = NO

Work events may later become searchable through existing search architecture. A10A search enrichment remains optional/deferred.

## Future handover

A10B reserves event types for A10C Information Requirements & Handover Intelligence. Full handover is out of scope.

## User control

Governed actions: Publish to EOS, link to project, link to engineering object, remove incorrect project binding, explain why an item is managed. Mandatory enterprise retention/governance cannot be bypassed. Capture explainability answers "why was this captured?" without exposing hidden security metadata.

## Assurance

Potential future conditions: MANAGED_SOURCE_REQUIRED_BUT_UNAVAILABLE, UNMANAGED_SOURCE_REFERENCED, WORKFLOW_EVENT_MISSING_PROVENANCE. A10B does not automatically create Findings.

## Retention

Work events are governed engineering metadata (`retention_class = engineering_metadata`). Unlimited surveillance retention is not invented.

## Limitations

- No real SharePoint, Teams, Outlook, Aconex, AutoCAD, or Excel connectors
- No desktop surveillance agent
- No full Command Centre (A12); `/engineering/work` is a data foundation only
- No Information Handover (A10C)
- No Value Intelligence
- No real solver execution
- No production deployment
- `/engineering/activity` remains the Project Intelligence activity feed

READY_FOR_CONTROLLED_PILOT = NO  
READY_FOR_PRODUCTION = NO
