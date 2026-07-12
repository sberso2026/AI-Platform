# Project Intelligence Cutover States

**Phase:** 6B foundation (states defined; destructive cutover deferred)

---

## Cutover state machine

| State | Meaning | Allowed operations |
|-------|---------|-------------------|
| `discovery` | Phase 6A complete; ownership documented | Docs only |
| `source_frozen` | Standalone PI tagged baseline | Read migration source; no port of dirty tree |
| `foundation` | Phase 6B: shell, mappings, read adapters | Mapping review; no register migration |
| `capability_port` | Phase 6C+: deliberate capability ports | Port with adapters; dual-run optional for PI-owned data only |
| `mapping_verified` | All in-scope projects mapped/approved | Prepare register migration plans |
| `register_migration` | Controlled Core ingest with human review | No auto-merge; audited |
| `ai_equivalence` | AI Director proven vs legacy corpus | Retire ungoverned paths |
| `cutover_ready` | Single Platform DB proven | Freeze dual paths |
| `cutover` | Production traffic on Platform only | Standalone read-only / retired |
| `retired` | Standalone decommissioned | Archive + evidence retention |
| `rolled_back` | Cutover aborted | Restore prior production posture |

---

## Phase 6B allowed states

- `source_frozen`  
- `foundation`  

Transitions into `register_migration` or later are **blocked** until Phase 6C+ gates pass.

---

## Mapping status alignment

Project mapping rows use: `discovered` → `candidate` → `matched` / `conflict` → `pending_review` → `approved` → `migrated` → `verified`, or `failed` / `rolled_back` / `retired`.

Approval of a mapping in Phase 6B does **not** migrate register data.
