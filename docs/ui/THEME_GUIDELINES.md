# Theme Guidelines

Batch **2.07** — RTB Engineering OS visual system.

## Principle

Enterprise productivity UI (Microsoft 365 / Azure / Atlassian / Linear), not dark gaming aesthetics.

## Split Theme

| Surface | Treatment |
|---------|-----------|
| Sidebar | Dark slate (`#0f172a`) — unchanged hierarchy and icons |
| Main content | Light `#F4F6F8` |
| Cards / tables | White `#FFFFFF` |
| Borders | Light gray `#E5E7EB` |
| Text | Dark gray `#1F2937` / muted `#64748B` |
| Hover / accent | Subtle blue (`#2563EB` / `#EFF6FF`) |

## Tokens

Defined in `apps/web/src/app/globals.css` `@theme` block.

OS `prefers-color-scheme: dark` **must not** force the main canvas dark. Sidebar stays dark independently.

## Branding

- Component: `apps/web/src/components/brand/rtb-logo.tsx`
- Asset: `apps/web/public/brand/rtb-logo.svg` (replace with official PNG/SVG as needed)
- Sidebar label: **Engineering OS** / **Enterprise Edition**

## Accessibility

- `:focus-visible` ring on interactive controls
- Sufficient contrast on light cards and dark sidebar nav
- ARIA labels on project selector, global search, sidebar

## Do / Don’t

**Do:** keep card padding consistent, white surfaces, sparse shadow.  
**Don’t:** purple gaming gradients, full-dark main panes, neon accents.
