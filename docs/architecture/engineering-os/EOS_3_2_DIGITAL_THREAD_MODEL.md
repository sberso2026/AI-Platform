# EOS 3.2 Digital Thread Model

`EOS_3_DIGITAL_THREAD_FOUNDATION_IMPLEMENTED=YES`

`EOS_3_DIGITAL_THREAD_QUERY_SERVICE_IMPLEMENTED=YES`

`EOS_3_GRAPH_AUTHORITY_MODEL=STRUCTURED_CANONICAL_STATE`

`EOS_3_CANONICAL_RELATIONSHIP_MODEL_IMPLEMENTED=YES`

## Thread path

Requirement → System → DisciplineObject → Revision → Interface → Change → Impact → Calculation → Review → Decision → Deliverable → Baseline → Asset → Inspection

Not every project requires every node.

## Query capabilities

Deterministic service answers:

- requirements driving an object
- current revision
- interfaces depending on a revision
- changes affecting a deliverable
- assumptions supporting a calculation
- evidence supporting a decision
- baselines containing a revision
- assets originated from a system
- bounded graph trace

Embeddings/LLM are not graph authority.

## Modules

- `apps/web/src/lib/engineering/eos3-relationships.ts`
- `apps/web/src/lib/engineering/eos3-digital-thread.ts`
- `apps/web/src/lib/engineering/eos3-object-store.ts`
- `apps/web/src/lib/engineering/eos3-structured-retrieval.ts`
