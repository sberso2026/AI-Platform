# Installed Products

## Overview

The **Installed Products** page (`/system/products`) replaces the legacy Operating Systems page. It provides a commercially aware catalogue of RTB Operating Systems with separate subscription, licence, and installation status.

## Page structure

### Header

- **Title:** Installed Products
- **Subtitle:** Manage your RTB Operating Systems, applications, licences, and access.

### Summary cards

| Card | Source |
|------|--------|
| Installed Products | Count of products in Installed tab |
| Installed Applications | Sum of installed application counts |
| Assigned Seats | Seat pool assigned / total |
| Renewal Date | Primary installed product renewal |
| Current Plan | Edition / plan name |

### Tabs

Default tab: **Installed**

| Tab | Content |
|-----|---------|
| Installed | Tenant-owned products with active entitlement |
| Available | Purchasable or trial-eligible products |
| Trials | Trialing subscriptions |
| Coming Soon | Registered future products (reduced visual prominence) |

## Product cards

Each card renders:

- Product name, type, description, edition
- Separate status chips: Subscription, Licence, Installation
- Version, seat usage, renewal date
- Installed application count
- Usage summary
- Primary and secondary actions (role-gated)

### Engineering OS (installed)

| Field | Value |
|-------|-------|
| Edition | Enterprise (seeded) |
| Subscription | Active |
| Licence | Active |
| Installation | Healthy |
| Open | `/engineering` |
| Manage | `/system/products/engineering-os` |

## Product detail

`/system/products/[productSlug]` shows parent product summary plus application sections for Engineering OS:

- **Installed applications** — enabled apps (e.g. Project Intelligence when enabled)
- **Available applications** — Inspection Intelligence, Project Controls, Meeting Intelligence, Document Intelligence, Structural Intelligence, Engineering Knowledge

Application actions: Open, Install, Start Trial, Request Quote (shell buttons where workflows are not connected).

## Legacy redirect

`/operating-systems` redirects to `/system/products`.

## Components

| Component | Path |
|-----------|------|
| Product card | `apps/web/src/components/commerce/product-card.tsx` |
| Application card | `apps/web/src/components/commerce/application-card.tsx` |
| Status chips | `apps/web/src/components/commerce/commercial-status-chips.tsx` |
| Catalog tabs | `apps/web/src/components/commerce/product-catalog-tabs.tsx` |

## Tests

Adapter and navigation tests in `packages/platform-core/src/commerce/commerce-adapter.test.ts` and updated navigation test suites.
