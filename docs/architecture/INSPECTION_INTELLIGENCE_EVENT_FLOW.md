# Inspection Intelligence — Event Flow

**Phase:** 9B

```
Inspection Intelligence
  emits InspectionDomainEvent
        │
        ├─► Asset Timeline (Engineering shared / future Asset Intelligence consumers)
        ├─► Digital Twin inputs (references + condition/risk hints — Twin not owned)
        ├─► Platform Knowledge Graph (nodes/edges contributions)
        └─► Executive Dashboard / reporting read models (aggregates; PI reporting may consume later)
```

## Event categories (slice)

- `inspection.template.created|revised`
- `inspection.plan.created|updated`
- `inspection.session.started|completed|submitted`
- `inspection.observation.recorded`
- `inspection.measurement.recorded`
- `inspection.evidence.appended`
- `inspection.review.requested|completed`

## Rules

- Emit via Platform event bus / Engineering audit patterns — no private bus.
- Payloads carry Inspection Target + AssetReference snapshots, never forked asset rows.
- KG writes go through Platform Knowledge Intelligence contracts when wired.
- Executive Dashboard remains a consumer, not owned by II.
