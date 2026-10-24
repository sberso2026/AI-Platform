# Engineering OS — Phase E0 Deployment Profile Contract

Status: Locked (E0)

## Profiles

### ESSENTIAL

**Intent:** Small consultancy / lean engineering team. Native Engineering OS only.

| Capability | Requirement |
| --- | --- |
| Platform Identity + Commerce entitlements | Required |
| Shared Engineering Domain (projects/assets/documents/registers) | Required |
| Native search / RAG | Required |
| Document intelligence (native) | Required |
| AI-provider abstraction (at least one native provider) | Required |
| Ask Engineering OS (advisory) | Required when `ai_assistant` entitled |
| Structured modules | Available when installed/entitled |
| Enterprise connectors | **Not required** |
| Client Copilot / SAP / Fabric / data lake | **Not required** |

`supportsZeroConnectorNativeDeployment = true`

### PROFESSIONAL

**Intent:** Multi-project / multi-company intelligence with selected integrations.

Includes ESSENTIAL, plus:

| Capability | Requirement |
| --- | --- |
| Cross-project / company Explore & Intelligence hub | Required |
| One or more productivity/DMS connectors | Optional but supported |
| Cross-module search aggregation | Required |
| Stronger ambient audit/provenance defaults | Required |

### ENTERPRISE

**Intent:** Federated enterprise landscape with advanced governance.

Includes PROFESSIONAL, plus:

| Capability | Requirement |
| --- | --- |
| Federated ERP/EAM/data-platform connectors | Supported |
| Advanced connector health, mapping governance, conflict representation | Required |
| SSO federation (optional IdPs) without ceding Platform Identity ownership | Supported |
| Fine-grained entitlement + workspace isolation at scale | Required |

`supportsEnterpriseFederatedDeployment = true`

## Profile selection

Profiles are **commercial / operational packaging**, not separate codebases.
The same logical architecture serves all profiles; connectors and modules enable
capabilities.

## Assertions

- No profile may require SAP, M365 Copilot, or Fabric for core engineering workflows.
- Profiles must not fork certified module packages.
- Unavailable profile capabilities are hidden via UX complexity policy, not shown as
  dead features.
