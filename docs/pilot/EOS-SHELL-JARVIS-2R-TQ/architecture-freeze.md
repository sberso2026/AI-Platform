# EOS-SHELL-JARVIS-2R-TQ architecture freeze

Mandatory gates. If any is false, stop.

| Gate | Value | Evidence |
| --- | --- | --- |
| NO_ROUTE_ARCHITECTURE_CHANGE | true | No new domain. Additive GET `[id]` wraps existing `technicalQueries.get`. Additive query-image GET serves bytes already referenced by stored HTML. List/create routes unchanged. No PATCH / applyAction. Page hrefs remain `/engineering/technical-queries`. |
| NO_DATABASE_SCHEMA_CHANGE | true | No migrations. |
| NO_CANONICAL_TQ_MODEL_CHANGE | true | `question` HTML, title, status, ownership unchanged. Summary is presentation-only. |
| NO_API_CONTRACT_CHANGE | true | GET list still `{ data: rows }`. POST create body unchanged. GET `[id]` returns existing `{ query, comments }`. |
| NO_WORKFLOW_CHANGE | true | No `applyAction`. Draft buttons navigate to detail only. |
| NO_RBAC_CHANGE | true | Existing `technical-queries` commerce segment. |
| NO_AUTH_CHANGE | true | Supabase auth unchanged. Current user id is read only to label “You” / My Actions. |
| NO_NOTIFICATION_ARCHITECTURE_CHANGE | true | Notifications untouched. |
| NO_AI_RUNTIME_CHANGE | true | AI stack untouched. |

Not edited: Engineering Core ownership, Project Intelligence ownership, Knowledge Graph, storage architecture, Kernel.
