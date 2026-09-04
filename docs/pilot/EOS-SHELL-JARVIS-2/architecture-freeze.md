# EOS-SHELL-JARVIS-2 architecture freeze

Mandatory gates. If any is false, stop.

| Gate | Value | Evidence |
| --- | --- | --- |
| NO_ROUTE_ARCHITECTURE_CHANGE | true | Same App Router hrefs. No new PI or Engineering routes. |
| NO_DATABASE_SCHEMA_CHANGE | true | No Prisma / SQL migrations. |
| NO_DOMAIN_MODEL_CHANGE | true | Canonical PI / Engineering types unchanged. |
| NO_API_CONTRACT_CHANGE | true | Command Center and PI endpoints unchanged. Analyst still POSTs the existing question contract. |
| NO_AI_RUNTIME_CHANGE | true | No new AI runtime. Brief and Analyst reuse `/analyst`. |
| NO_SECOND_AI_STACK | true | No second director, registry, or overlay stack. |
| NO_SECOND_GRAPH | true | Evidence chain shows published counts only. |
| NO_RBAC_CHANGE | true | Access helpers and nav-context unchanged. |
| NO_AUTH_CHANGE | true | Supabase auth unchanged. |
| NO_COMMERCE_CHANGE | true | Entitlements and catalog unchanged. |

Not edited as architecture: Kernel, AI Director, Model Registry, Prompt Registry, Knowledge Graph, Memory, Workflow Engine, Event Bus, Engineering Core ownership, Project Intelligence ownership.
