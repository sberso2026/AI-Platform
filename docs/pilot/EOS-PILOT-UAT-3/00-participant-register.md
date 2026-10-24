# Participant register

Fill one row when a human is **approved by the founder**, before invite. Do not invent names. Do not store passwords.

**Approved cohort size this ticket:** 0  
**Target small cohort:** 1 PM / engineering manager, 1–2 engineers, 1 reviewer (role overlap allowed).  
**Seat capacity after cert-fixture release:** 3 free of 5 (founder seat retained).

| ID | Display name | Work email | Intended role | Tenant role to assign | EOS seat | Workspace | Invite sent | Activation confirmed | First login verified | Isolation checked | Script sat | Form filed |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| P-01 | _awaiting approval_ | | project manager / engineering manager | admin | yes | default | no | no | no | no | no | no |
| P-02 | _awaiting approval_ | | engineer | member | yes | default | no | no | no | no | no | no |
| P-03 | _awaiting approval_ | | engineer (optional) | member | yes | default | no | no | no | no | no | no |
| P-04 | _awaiting approval_ | | reviewer / senior engineer | viewer | yes (read still seat-gated) | default | no | no | no | no | no | no |

## Operator (not a cohort participant)

| ID | Email | Role | Seat | Notes |
|---|---|---|---|---|
| OP-FOUNDER | silvestre.berso@rtbea.com.au | admin | **retain** | Operator / founder. Not an external UAT subject. Do not remove seat. |

## Rules

- One Auth user per email. If invite returns `identity_exists` on another tenant, stop. Do not cross-link.
- Participant sets their own password from the activation / recovery email.
- Sign-in path: password **Sign In** on https://eos-pilot.rtbea.com.au/login (not SSO unless the operator later certifies SSO for that person).
- Yahoo / Worley identities are out of scope.
