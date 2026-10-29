# EOS 2.13 freeze and deliverable capability matrix

`IMPLEMENTED` means the runtime records or checks the item. `DETERMINISTIC` means the result comes from stored revisions and rules. `VALIDATED` means the domain tests exercise it. `HUMAN_AUTHORITY_REQUIRED` means a person in an explicit role confirms the action. `EXTERNAL_SYSTEM_DEPENDENT` means an enterprise document system may remain the source of record. `NOT_IMPLEMENTED` means this phase does not do the work.

| Capability | State | Notes |
| --- | --- | --- |
| Freeze candidate and exact revisions | IMPLEMENTED, DETERMINISTIC, VALIDATED | `latest` is rejected. |
| Freeze readiness and exceptions | IMPLEMENTED, DETERMINISTIC, VALIDATED | Conditions stay on exception records. |
| Freeze approval | IMPLEMENTED, VALIDATED, HUMAN_AUTHORITY_REQUIRED | Owner, admin, and AI cannot approve. |
| Baseline fingerprint | IMPLEMENTED, DETERMINISTIC, VALIDATED | Sorted SHA-256. No secrets. |
| Baseline comparison | IMPLEMENTED, DETERMINISTIC, VALIDATED | Added, removed, and revised ids. |
| Baseline immutability | IMPLEMENTED, VALIDATED | A frozen snapshot is not rewritten. |
| Deliverable revision | IMPLEMENTED, VALIDATED | Prior issued revision remains. |
| Issue purpose and project label | IMPLEMENTED, VALIDATED | `CONSTRUCTION` may display as `IFC`. |
| Review, approval, and release | IMPLEMENTED, VALIDATED, HUMAN_AUTHORITY_REQUIRED | The three states stay separate. |
| Dependency snapshot and checksum | IMPLEMENTED, DETERMINISTIC, VALIDATED | Captured at release. |
| Stale deliverable | IMPLEMENTED, DETERMINISTIC, VALIDATED | No automatic revision or withdrawal. |
| Supersession and withdrawal | IMPLEMENTED, VALIDATED | History remains. |
| Package readiness | IMPLEMENTED, VALIDATED | A missing required deliverable blocks the package. |
| Transmittal metadata | IMPLEMENTED, VALIDATED, BOUNDED | Not an enterprise document-control system. |
| External DMS contract | IMPLEMENTED, EXTERNAL_SYSTEM_DEPENDENT | Metadata operations only. No synchronization. |
| Master and discipline registers | IMPLEMENTED, VALIDATED | Company field labels can map. The register is not a schedule system. |
| Model, drawing, calculation, specification, datasheet, vendor document, MTO | IMPLEMENTED, VALIDATED | Metadata governance. Not tool qualification. |
| FEED, detailed freeze, and IFC baseline | IMPLEMENTED, VALIDATED | IFC baseline stays immutable after a later change. |
| Post-IFC disposition | IMPLEMENTED, VALIDATED, HUMAN_AUTHORITY_REQUIRED | `REVISED_IFC_REQUIRED` does not reissue. |
| Discipline and project readiness | IMPLEMENTED, VALIDATED | Blockers stay visible by discipline. |
| AI readiness explanation | IMPLEMENTED, VALIDATED | Does not authorize release. |
| RLS and audit | IMPLEMENTED, VALIDATED | Workspace membership on the new tables. |
| Full enterprise document management | NOT_IMPLEMENTED | An external system may remain the source of record. |
| Full construction and as-built management | NOT_IMPLEMENTED | Withdrawal and post-IFC disposition are the bounded links. |
| Automatic IFC reissue | NOT_IMPLEMENTED | |

A frozen configuration is not design approval. An IFC release is not regulatory certification.
