# Project Intelligence — Meeting Data Ownership

**Phase:** 6C-3A Discovery Lock → **updated Phase 8D**  
**Related:** [PROJECT_INTELLIGENCE_DATA_OWNERSHIP.md](./PROJECT_INTELLIGENCE_DATA_OWNERSHIP.md), [PROJECT_INTELLIGENCE_MEETING_PHASE_8D_RECONCILIATION.md](../migration/PROJECT_INTELLIGENCE_MEETING_PHASE_8D_RECONCILIATION.md)  
**Frozen tables:** `meeting_sessions`, `meeting_transcripts`, `meeting_nlp_analyses`, `meeting_minutes`  
**Target prefix:** `project_intelligence_meeting_*` / `project_intelligence_transcript_*`

## Product rule

Engineering Core remains authoritative for approved engineering registers.  
Project Intelligence owns meeting intelligence derivatives and **never** auto-promotes AI output into Core.

```text
transcript → AI proposal → human review → edit → approve
  → Engineering Core service → authoritative record
  → meeting backlink → audit event
```

## Project Intelligence owns

| Entity (target) | Purpose | Uninstall |
|-----------------|---------|-----------|
| `project_intelligence_meeting_sessions` | Meeting lifecycle + provider linkage | Delete PI meeting data |
| `project_intelligence_meeting_participants` | Roster / speaker identity | Delete |
| `project_intelligence_transcript_segments` | Ordered transcript evidence | Delete |
| `project_intelligence_transcript_revisions` | Revision / supersede history | Delete |
| `project_intelligence_meeting_events` | Provider + domain events | Delete |
| `project_intelligence_meeting_processing_runs` | Durable processing runs | Delete |
| `project_intelligence_meeting_proposals` | AI proposed decision/action/risk/issue/TQ/lesson/finding | Delete open proposals |
| `project_intelligence_meeting_review_items` | Human review queue | Delete per policy |
| `project_intelligence_meeting_minutes` | Minutes header | Delete drafts |
| `project_intelligence_meeting_minutes_versions` | Versioned minutes bodies | Delete drafts |
| `project_intelligence_meeting_evidence` | Transcript spans + Doc Intelligence citations | Delete |
| Meeting AI traces / reports | Observability + meeting reports | Delete PI; Platform metering retained per policy |
| Meeting jobs / outbox / leases | Durable workers | Delete |

**Scope keys on all PI rows:** `tenant_id`, `workspace_id`, optional `engineering_project_id`, `meeting_session_id`, correlation ids.

## Engineering Core owns (approved only)

| Entity | Table (existing) | When written |
|--------|------------------|--------------|
| Decisions | `engineering_decisions` | Human approve of decision proposal |
| Actions | `engineering_actions` | Human approve of action proposal |
| Risks | `engineering_risks` | Human approve of risk proposal |
| Issues | `engineering_issues` | Human approve of issue proposal |
| Technical queries | `engineering_technical_queries` | Human approve of TQ proposal |
| Lessons | `engineering_lessons` (or mapped Core lessons) | Human approve of lesson proposal |
| Timeline events | `engineering_timeline_events` | Human approve when applicable |

Core writes must include:

- Actor (reviewer)
- Meeting backlink (`meeting_session_id` / proposal id in metadata or object_links)
- Audit / outbox event
- No write path from workers without review approval flag

## Human review boundary

| Allowed without review | Forbidden without review |
|------------------------|--------------------------|
| Persist transcripts | Insert Core decisions/actions/etc. |
| Generate minutes drafts | Mark Core registers approved |
| Create proposals (`review_state=pending`) | Silent “auto-approve” |
| Edit proposals in review UI | Overwrite Core from AI regeneration |

`canMutateCore` remains **false** on extraction/minutes generation paths (same pattern as Document Intelligence findings).

## Document Intelligence grounding

Document-supported meeting claims must use the **certified Phase 6C-2** retrieval path:

- Citations required on grounded claims
- Hash embeddings remain disabled under provider certification
- Meeting evidence stores citation references; does not own document register metadata

## Frozen → target ownership migration

| Frozen | Future owner | Action |
|--------|--------------|--------|
| `meeting_sessions` | PI | Port/rename; expand lifecycle |
| `meeting_transcripts` | PI | Port to segments + revisions |
| `meeting_nlp_analyses` | PI | Fold into runs/traces or retire after review |
| `meeting_minutes` | PI drafts | Port + versions; approved extracts → Core |
| MoM approve (minutes only) | PI + Core | Extend to Core write adapter |
| Draft decision workflows | PI proposals | Keep draft-only until review |

## RLS boundary (design)

- Tenant + workspace + Project Intelligence install entitlement
- Service role for workers only; audited
- No client service-role keys
- Identity immutability for tenant/workspace/project/meeting keys (mirror documents)

## Events (design)

| Direction | Examples |
|-----------|----------|
| PI publish | `project_intelligence.meeting.session.*`, `proposal.created`, `review.approved` |
| Core publish | `engineering.decision.created`, `engineering.action.created`, … |
| PI subscribe | Core project identity changes affecting meeting scope |
