# EOS 2.18R Write Path Root Cause and Fix

`OP_018_001_ROOT_CAUSE_IDENTIFIED=YES`

`OP_018_001_ROOT_CAUSE_CLASSIFICATION=MISSING_UI_WRITE_PATH, MISSING_API_HANDLER, UNWIRED_SERVICE, RLS_DEFECT`

The browser pages for Engineering Basis, structural delivery, interface intelligence, change impact, and design freeze were GET-only. Their existing POST handlers reviewed a payload in memory and did not insert. The only inserter was `POST /api/engineering/qualification-runtime`, which is locked to synthetic project `EOS-QA-001` and denies the pilot engineer before insert. That path was not used.

Create authorization was not the defect. The production pilot role `pilot-engineer` already has engineering execute. Update policies were missing on the workflow tables, so a revision, materiality decision, or freshness change could not commit even after an insert. That is the RLS part of the defect. Tables, formulas, and calculation semantics were already present.

## Repair

One application route, `POST/GET /api/engineering/pilot-workflow`, sits behind the existing EOS 2 lifecycle gate. The browser panel on the existing EOS 2 pages calls that route. The route classifies the actor and action, then calls `eos2_18r_persist`. The function is `SECURITY INVOKER`. It does not bypass RLS.

The project id is fixed to `CONTROLLED_PRODUCTION_PILOT_VALIDATION` in both the classifier and the function. `Pilot-0001` and any other project id are rejected. Forbidden actions are `accept_interface`, `approve_freeze`, `approve_deliverable`, `release_deliverable`, and `ifc_release`. `actingRole=ai` is denied. Receiver acceptance stays pending. Frozen rows stay immutable. Deliverable revision, approval, and release stay unchanged. Freshness may become `potentially_stale` after an upstream revision. Materiality is recorded only from an authorized human value.

A repeated `requestKey` returns the prior result and does not create another revision. `expectedRevision` mismatch returns `revision_conflict`. The audit row is written in the same function after the mutation, and a unique index on the request key rolls the duplicate mutation back.

The old in-memory POST handlers were left in place. No raw browser-to-database write was added.
