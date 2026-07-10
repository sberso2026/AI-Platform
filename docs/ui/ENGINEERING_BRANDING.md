# Engineering Branding

Batch **2.10**

## Identity

| Element | Value |
|---------|--------|
| Organization | **RTB** |
| Product | **Engineering OS** |
| Edition | **Enterprise Edition** |
| Logo | `/brand/rtb-logo.png` (40–44px, default **44px**) |

Constants: `BRANDING` in `@rtb/ui` (`packages/ui/src/lib/typography.ts`).

## Sidebar header layout

```
[ Logo 44px ]  RTB                    (~17px bold)
               Engineering OS         (~19px semibold)
               Enterprise Edition     (13px secondary)
               [ chevron ]
```

Logo↔text gap: **16px** (`gap-4`).

Component: `ProductSwitcher` (`apps/web/src/components/layout/product-switcher.tsx`).

Compact (icon-only) mode shows the logo mark only.

## Dark sidebar support

Branding uses inverted / light text on `bg-sidebar` (`#0f172a`). Logo asset is designed for dark backgrounds.

## Auth surfaces

Login / signup may use `RtbLogo` with `inverted={false}` for light cards — still org + product + edition when `variant="full"`.

## Do / Don’t

- **Do** keep “Engineering OS” visible as the product name.
- **Do** use official PNG mark (not placeholder glyphs).
- **Don’t** collapse brand to a single generic icon without RTB text on expanded sidebar.
