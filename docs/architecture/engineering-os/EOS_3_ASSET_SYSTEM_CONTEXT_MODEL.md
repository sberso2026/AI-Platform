# EOS 3 — Asset/System Context Model

## Overlapping structures

| Structure | Example |
| --- | --- |
| Location / physical | Plant → Area → Unit → Location |
| Functional / system | Process Gas → Compression Subsystem → Compressor Package |
| Physical asset | Compressor C-201 → Baseplate → Support Frame |

These may overlap; they are not identical.

## Work Package integration

A Work Package may affect one or many Assets/Systems/Areas; create, modify, or retire context.

Roles:

- `PRIMARY_ASSET_OR_SYSTEM`
- `RELATED_ASSET_OR_SYSTEM`

`ONE_WORK_PACKAGE = ONE_ASSET` is **not** assumed.

Context already known to EOS is reused (`ASK_ONCE`).

## Engineering object associations

Requirements, Assumptions, Calculations, Decisions, Changes, Risks, Deliverables, Reviews, Evidence, Interfaces, Technical Queries may reference Asset/System context. Early concept work may remain facility/system scoped.

## Derivation foundation (not full Context Resolution Engine)

If an object is linked to a Work Package with a primary Asset, EOS may derive that Asset context unless the object explicitly references another.

## Persistence

- Extends `eos3_operational_assets` (canonical)
- Additive tables: context relationships, WP links, object links, configuration deltas
- Service enriches the same operational-asset identity objects — **no new in-process shadow asset truth**

Migration: `supabase/migrations/20261030160000_eos_3_domain_2_asset_system_context.sql`  
Code: `apps/web/src/lib/engineering/eos3-asset-system-context.ts`
