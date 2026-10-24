# Engineering OS — Phase E0 Connector Boundary Contract

Status: Locked (E0) · `EnterpriseConnectorsOptional = true`

## Purpose

Define how optional enterprise systems attach without becoming domain dependencies.

## Boundary

```
Engineering Domain / Intelligence / Capability
        ▲ public contracts / refs / events only
Platform Connector Framework (config, credentials, health, jobs)
        ▲ vendor adapters
External systems (M365, Google, SAP, Fabric, DMS, GIS, twins, REST/file/DB)
```

## Rules

1. Connectors are **optional**. ESSENTIAL profile has zero connectors.
2. Connector failure must **degrade gracefully** to native Engineering OS capability —
   never blank the product or block login/search of native records.
3. Adapters normalize into **domain contracts** owned by Engineering OS / modules /
   Platform — adapters own transport only.
4. Credentials, OAuth, and tenant connector config are **Platform** concerns.
5. No domain package may import vendor SDKs for SAP/M365/etc. as hard compile-time
   dependencies of certified module cores.
6. Cloud vendors (Supabase, Vercel, OpenAI, Azure OpenAI, …) are **implementation
   adapters** behind Native Services interfaces.
7. Connector jobs emit provenance events; they do not mutate Shared Domain identity
   without explicit mapping workflows.
8. Capability discovery may advertise connector-backed features only when the
   connector is installed, healthy, and entitled.

## Connector families (catalog)

| Family | Examples | Dependency class |
| --- | --- | --- |
| Productivity | M365, SharePoint, Teams, email, Google Workspace | Optional |
| EAM/ERP | SAP, Maximo, IFS, Pronto | Optional |
| Data platforms | Fabric, lakehouse/warehouse | Optional |
| Engineering content | DMS, GIS, digital twins | Optional |
| Generic | REST, file drop, database | Optional |

## Non-goals

- Replacing Platform Identity with Entra/Google as the only IdP (SSO may federate,
  Platform remains ownership)
- Making Fabric required for search/RAG
- Making Copilot required for Ask Engineering OS
