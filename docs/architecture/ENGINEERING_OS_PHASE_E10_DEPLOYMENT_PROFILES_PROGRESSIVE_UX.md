# Engineering OS Phase E10 — Deployment Profiles & Progressive UX

**Status:** Complete  
**Baselines:** E0–E9 (`0a21e84` E9)  
**Roadmap note:** Earlier E0 roadmap labelled E10 “Enterprise federation”. This phase **redefines E10 as Deployment Profiles & Progressive UX**. Enterprise federation adapters remain future work (not E11 scope here).

## Goal

One Engineering OS codebase deployable to small, medium, and enterprise firms without exposing irrelevant complexity. Profile packaging never replaces entitlement or RBAC.

## Profile ≠ authorization

```
Visibility/use = profile packaging ∩ installed ∩ entitled ∩ RBAC
```

- `profileElevatesPermissions = false` always
- Unavailable / uninstalled capabilities are **hidden** from engineers (no dead primary UI)
- Admins may inspect disabled capabilities separately (`ADMIN_INSPECT_ONLY`)

## Profile contracts

| Field | Meaning |
|-------|---------|
| `profileId` | ESSENTIAL / PROFESSIONAL / ENTERPRISE |
| `enabledCapabilities` | Packaged as enabled for the profile |
| `optionalCapabilities` | Packaged but require explicit entitlement |
| `connectorPolicy` | DISABLED / OPTIONAL / ENTERPRISE_ENABLED |
| `governanceLevel` | CORE / ENHANCED / ENTERPRISE |
| `identityMode` | NATIVE / ENTRA / OIDC_SAML_READY |
| `deploymentMode` | Logical mode (not a cloud vendor) |
| `adminFeatures` | Admin surfaces for the profile |
| `UXDensity` | MINIMAL / STANDARD / RICH / ENTERPRISE |

## Capability matrix (summary)

| Capability | ESSENTIAL | PROFESSIONAL | ENTERPRISE |
|------------|-----------|--------------|------------|
| Native Ask / search / reasoning | ✓ | ✓ | ✓ |
| Projects / documents / registers | ✓ | ✓ | ✓ |
| Core tools + passive memory + proposals | ✓ | ✓ | ✓ |
| Cross-project intelligence / richer workflows | — | ✓ | ✓ |
| Optional connectors / intelligence packs / advanced tools | — | optional | optional |
| SSO / enterprise connectors / federated data / RBAC / deployment controls | — | — | ✓ |
| Corporate Copilot federation | — | — | optional |

ESSENTIAL: `connectorPolicy = DISABLED` — independently useful with all enterprise connectors off.

## UX / navigation

| Profile | Density | Primary nav (when entitled) |
|---------|---------|-----------------------------|
| ESSENTIAL | MINIMAL | Home, Ask, My Engineering, Explore |
| PROFESSIONAL | RICH | + Intelligence |
| ENTERPRISE | ENTERPRISE | + Intelligence (+ admin governance/integrations) |

Web: `resolveVisiblePrimaryNavIds` intersects E1 entitlement gates with profile packaging. Default progressive profile is **ESSENTIAL** (`NEXT_PUBLIC_EOS_DEPLOYMENT_PROFILE` / access-snapshot override).

## Deployment abstraction

Logical modes only: `RTB_SAAS` · `CLIENT_CLOUD` · `PRIVATE_CLOUD` · `ON_PREM_READY`

Domain contracts must **not** hardcode: Vercel, Supabase, Azure, AWS, OpenAI, Microsoft Copilot. Provider implementations remain adapters.

## Identity abstraction

`NATIVE` · `ENTRA` · `OIDC_SAML_READY` — reuse existing platform identity contracts; no duplicate auth framework. External identity outage → native path where deployment permits.

## Copilot federation boundary

ENTERPRISE-optional only. Corporate Copilot/AI may call a controlled Engineering OS API/tool surface. Native Ask remains fully functional without federation. `microsoftCopilotRequired = false`.

## Graceful degradation

| Event | Behaviour |
|-------|-----------|
| Connector outage | Native Ask / evidence / reasoning continues |
| Intelligence pack unavailable | Evidence/reasoning fallback |
| External identity unavailable | Native identity when permitted |
| Feature not entitled | Hidden from engineers; admin may inspect |

## Performance

- Profile/capability metadata cached (session, short TTL)
- ESSENTIAL does not block on enterprise capability discovery
- Instrument home/nav/Ask via `recordProfilePerf`

## Security

- Profile cannot elevate permissions
- Entitlement + RBAC still required
- Cross-tenant seed isolation
- Connector/admin routes server-blocked when profile/entitlement/RBAC deny

## Package surface

`packages/engineering-os/src/phase-e10/` — contracts, profiles, visibility, seed tenants, degradation, nav-bridge.

## E11 readiness

E10 PASS unlocks ambient governance polish (E11). **Do not start E11 in this delivery.**
