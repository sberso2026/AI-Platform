# Product Detail

## Route

`/system/products/[productSlug]`

Implementation: `apps/web/src/app/(platform)/system/products/[productSlug]/page.tsx`

## Purpose

Product detail is the management hub for a single Operating System. It surfaces **real** subscription, licence, installation, and entitlement dimensions from Commerce services, plus application catalogue sections for Engineering OS.

## Data sources

| Data | API |
|------|-----|
| Nav context (role) | `GET /api/platform/nav-context` |
| Product catalogue | `GET /api/platform/commerce/catalog` |
| Licences | `GET /api/platform/commerce/licenses` |
| Subscriptions | `GET /api/platform/commerce/subscriptions` |
| Entitlement check | `POST /api/platform/commerce/entitlements/check` |

When the hosted catalogue is unavailable, `CatalogueFallbackBanner` is shown and registry fallback mapping applies — the page does not invent commercial state.

## Layout

### Header

- Product name
- Back link to `/system/products`
- Entitlement diagnose action for the product key

### Commercial dimensions panel

`CommercialDimensionsPanel` displays separate chips for:

- Subscription status
- Licence status
- Installation status
- Seat usage
- Trial end (when trialing)
- Entitlement allowed/denied
- Catalogue fallback indicator

### Product card

Full `ProductCard` with role-gated actions (Open, Manage, Install, Subscribe, etc.) driven by `commerce-adapter` action resolution.

## Engineering OS applications

When `productSlug === "engineering-os"`:

### Installed applications

Applications with active or expiring application licences, or enabled in the Engineering manifest. Rendered via `ApplicationCard` with Open / Manage actions.

### Available applications

Remaining manifest applications (Inspection Intelligence, Project Controls, Meeting Intelligence, Document Intelligence, Structural Intelligence, Engineering Knowledge). Actions: Install, Start Trial, Request Quote — wired to installation/commerce flows where connected.

Application views are built from `ENGINEERING_APPLICATIONS` manifest cross-referenced with `commercial_licenses` records.

## Other products

Non–Engineering OS products show a placeholder indicating application catalogue will appear when commerce provisioning is connected for that product.

## Related routes

| Route | Purpose |
|-------|---------|
| `/system/products/[slug]/install` | Product installation workflow |
| `/system/products/[slug]/health` | Installation health detail |
| `/system/installations/[installationId]` | Live workflow progress |
| `/system/applications/[slug]/install` | Application-level install |

## Access

Admin tier required (`canAccessPlatformRoute`). Product open actions respect entitlement enforcement on Engineering routes.

## Components

| Component | Path |
|-----------|------|
| Commercial dimensions | `apps/web/src/components/commerce/commercial-dimensions-panel.tsx` |
| Product card | `apps/web/src/components/commerce/product-card.tsx` |
| Application card | `apps/web/src/components/commerce/application-card.tsx` |
| Entitlement diagnose | `apps/web/src/components/commerce/entitlement-diagnose-button.tsx` |
