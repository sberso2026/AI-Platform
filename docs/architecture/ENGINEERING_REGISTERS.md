# Engineering Intelligence Registers

Batch **2.05** — shared registers owned by **Engineering Core**, not by any future application.

## Architecture

```
RTB Platform
  └── Engineering OS (@rtb/engineering-os)
        └── Engineering Core (projects, assets, documents, companies, disciplines)
              └── Engineering Intelligence Registers (this batch)
                    └── Future apps (Project Intelligence, Inspection Intelligence, …)
```

No Engineering application owns these registers. **Engineering Core** owns them. All future apps read and write through the same services and APIs.

## Registers

| Register | Table | API | UI |
|----------|-------|-----|-----|
| Decision | `engineering_decisions` | `/api/engineering/decisions` | `/engineering/decisions` |
| Action | `engineering_actions` | `/api/engineering/actions` | `/engineering/actions` |
| Risk | `engineering_risks` | `/api/engineering/risks` | `/engineering/risks` |
| Issue | `engineering_issues` | `/api/engineering/issues` | `/engineering/issues` |
| Technical Query | `engineering_technical_queries` | `/api/engineering/technical-queries` | `/engineering/technical-queries` |
| Lessons Learned | `engineering_lessons` | `/api/engineering/lessons` | `/engineering/lessons` |

## Shared Infrastructure

| Concern | Table / Service |
|---------|-----------------|
| Engineering Object Framework | `EngineeringObjectFramework` |
| Object relationships | `engineering_object_links` |
| Comments | `engineering_object_comments` |
| Attachments | `engineering_object_attachments` |
| Timeline | `engineering_timeline_events` + `EngineeringTimelineService` |
| Activity feed | `engineering_activity_events` + `EngineeringActivityService` |
| Audit linkage | `engineering_audit_links` |

## Engineering Object Contract

Every register record is an **Engineering Object** with:

- Identity: `object_id`, `object_type`, `title`, `description`
- Lifecycle: `status`, `priority`, `severity`, `due_date`, `closed_date`
- Context: `discipline`, `project`, `asset`, `company`, `owner`, `assigned_to`
- Platform: `workflow_instance_id`, `knowledge_node_id`, `digital_twin_id`, `ai_context`, `metadata`
- Audit: `created_by`, `created_at`, `updated_at`

On create, objects automatically:

1. Appear in **Engineering Search**
2. Emit **Timeline** and **Activity** events
3. Create a **Knowledge Graph** node
4. Link to project/asset/digital twin where applicable
5. Publish platform **events** and **audit** records

## Integrations

| Integration | Behaviour |
|-------------|-----------|
| Knowledge Graph | `REGISTER_KG_NODE_TYPES` maps each register to `engineering_*` node types; edges via `engineering_object_links` |
| Digital Twin | Inherited from linked asset `digital_twin_id` |
| Workflow Engine | Workflow definitions seeded per tenant (`decision_approval`, `risk_review`, `tq_response`, `action_closeout`, `issue_investigation`) |
| AI Director | Register-aware search + AI workspace; decisions always require human approval |
| Notifications | Event bus foundation for future notification routing |
| Search | `EngineeringSearchService` fans out to all six registers |

## Migrations

- `20260204000000_batch_205_register_tables.sql` — tables + indexes
- `20260204000001_batch_205_register_rls.sql` — RLS + tenant isolation
- `20260204000002_batch_205_register_seed.sql` — KG types, capabilities, workflow seeds

## Package Surface

`createEngineeringOS()` exposes:

`decisions`, `actions`, `risks`, `issues`, `technicalQueries`, `lessons`, `timeline`, `activity`, `objects`

Types: `@rtb/types` → `engineering-registers.ts`

## Report Shells

`/engineering/reports` lists register report templates (export not implemented in this batch).

## Related Docs

- [DECISION_REGISTER.md](./DECISION_REGISTER.md)
- [ACTION_REGISTER.md](./ACTION_REGISTER.md)
- [RISK_REGISTER.md](./RISK_REGISTER.md)
- [ISSUE_REGISTER.md](./ISSUE_REGISTER.md)
- [TECHNICAL_QUERY_REGISTER.md](./TECHNICAL_QUERY_REGISTER.md)
- [LESSONS_LEARNED.md](./LESSONS_LEARNED.md)
- [ENGINEERING_TIMELINE.md](./ENGINEERING_TIMELINE.md)
