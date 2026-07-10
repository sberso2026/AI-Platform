# Platform Administration

Batch **2.12** — simplified admin navigation and access control.

## Principle

- **RTB Platform** is the hidden foundation (kernel, intelligence, automation).
- **Engineering OS** is the user-facing product.
- **Platform Administration** is for tenant administrators and engineering managers (limited).
- **Advanced Platform Tools** are restricted to owners and administrators.

Platform internals must not clutter normal user navigation. Backend services, APIs, and routes remain intact.

## Simplified Platform Administration

Normal sidebar (role-dependent):

| Item | Route | Minimum tier |
|------|-------|----------------|
| Operating Systems | `/operating-systems` | Admin |
| Workspaces | `/workspaces` | Admin |
| Users & Permissions | `/platform/users-permissions` | Manager |
| Integrations | `/platform/integrations` | Admin |
| System Health | `/platform/health` | Manager |
| Audit Logs | `/platform/audit` | Manager |
| Settings | `/platform/settings` | Admin |

## Legacy routes (hidden from sidebar)

- `/command-centre` — System Monitor
- `/dashboard` — System Health Overview
- `/users`, `/roles`, `/audit`, `/settings`, `/plugins` — linked from Advanced Platform Tools

## Advanced Platform Tools

Hub: `/platform/advanced`

Categories: AI Runtime, Governance, Automation, Data & Knowledge, Integrations, Monitoring, Developer Tools.

See [ADVANCED_PLATFORM_TOOLS.md](../ui/ADVANCED_PLATFORM_TOOLS.md).

## Configuration

Tenant setting `showAdvancedPlatformTools` (default `false`) adds Advanced Platform Tools to the sidebar for admins when enabled. Set in `tenants.settings` JSONB.

## Authorization

- Sidebar filtering: `filterSidebarNavigation` in `@rtb/platform-core`
- Route enforcement: Next.js middleware + `canAccessPlatformRoute`
- Search: knowledge graph results only for admins with advanced mode enabled
