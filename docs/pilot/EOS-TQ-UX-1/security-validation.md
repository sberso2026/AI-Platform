# EOS-TQ-UX-1 Security validation

Static / unit evidence only. Live tenant/workspace/project isolation was not re-probed against a second tenant in this pass.

| Control | Result |
| --- | --- |
| Tenant scope on list/get/update | Preserved (`tenant_id` + commerce context) |
| Workspace scope | Preserved (`workspace_id` mismatch → not found) |
| Project filter | Optional query param; does not leak other workspaces |
| RBAC | `withEngineeringApi("technical-queries")`; viewer cannot PATCH; Action By/initiator capability flags computed server-side |
| Directory | Workspace memberships only; not platform admin identity API |
| No service-role exposure in UI | Client uses session APIs |
| No external writes | Notifications in-app only |
| No autonomous AI approval | Ask links only; close/accept require human PATCH |
| Query immutability | Non-draft question updates rejected via draft-only actions |
| UUID in UI source | Count 0 (vitest) |

Cross-tenant user access and unauthorized mutation of response/closeout remain **required live UAT** (tests 24–25).
