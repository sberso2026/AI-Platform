# Advanced Platform Tools

Batch **2.12** — admin-only internal platform hub.

## Purpose

For RTB administrators, developers, and support engineers. Not shown in normal user navigation.

**Route:** `/platform/advanced`

## Warning

The page displays a banner:

> Advanced Platform Tools are intended for system administrators and RTB support. Changes may affect AI behavior, automation, security, and integrations.

## Categories

| Category | Tools |
|----------|-------|
| AI Runtime | AI Director, Agents, Agent Runs, Tools, Capabilities, Models, Prompts |
| Governance | Policies, Costs, Secrets, Evaluations, Feature Flags |
| Automation | Workflows, Jobs, Events |
| Data & Knowledge | Knowledge Graph, Memory, Digital Twins |
| Integrations | API Gateway, Notifications, Telemetry, Plugin Registry |
| Monitoring | Observability |
| Developer Tools | System Monitor, System Health Overview, legacy Users/Roles/Audit/Settings |

## Sidebar visibility

Advanced Platform Tools appear in the sidebar only when:

1. User is **Owner** or **Admin**, and
2. Tenant setting `showAdvancedPlatformTools` is **true**, or
3. User navigates directly to an authorized advanced URL

Default: sidebar link **hidden** (setting off).

## Implementation

- Navigation registry: `ADVANCED_PLATFORM_NAVIGATION` in `packages/platform-core/src/navigation.ts`
- Category builder: `buildAdvancedToolCategories` in `nav-visibility.ts`
- Page: `apps/web/src/app/(platform)/platform/advanced/page.tsx`
