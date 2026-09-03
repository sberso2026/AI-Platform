# EOS-TQ-UX-1R — Live audit and notifications

**Host:** https://eos-pilot.rtbea.com.au  
In-app infrastructure only. No external email.

## Audit (TQ-009)

Canonical timeline on the TQ object: **8** events.

| Event | Title |
| --- | --- |
| engineering.technical_query.created | technical_query: Sealant suitability at pipe sleeper isolation joint |
| engineering.technical_query.submitted | TQ-009 submitted |
| engineering.technical_query.response_submitted | TQ-009 response submitted |
| engineering.technical_query.clarification_requested | TQ-009 clarification requested |
| engineering.technical_query.response_submitted | TQ-009 response submitted |
| engineering.technical_query.accepted | TQ-009 accepted |
| engineering.technical_query.reference_added | TQ-009 reference added |
| engineering.technical_query.closed | TQ-009 closed |

Actor, timestamp, and tenant/workspace/project/TQ context are on the timeline rows. Assignment at create is recorded as **submitted** rather than a separate `assigned` event.

`TQ_AUDIT_LIVE_PASS=true`  
`TQ_AUDIT_EVENT_COUNT=8`

## Notifications

In-app rows linked to TQ-009 after the live run: **1**

- `task.assigned` — “TQ-009 closed” (watchers on close)

Expected assigned / response-submitted / clarification / accepted events were **not** present in `notifications` for this run. Assigned notify is skipped when actor equals Action By; review notify is skipped when actor equals Initiator. Accept has no notify hook. Clarification title/link did not appear in the live table.

Due/overdue: TQ-009 due 14 Sept 2026 is not overdue; overdue notify was not testable.

`TQ_NOTIFICATION_LIVE_PASS=false`  
`TQ_NOTIFICATION_EVENT_COUNT=1`
