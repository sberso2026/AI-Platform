# Navigation

Batch **2.12** — Platform Administration simplification (extends 2.08–2.11).

## Shell Architecture

`PlatformShell` in `apps/web/src/app/(platform)/layout.tsx`.

## Sidebar sections

| Section | Default expanded | Audience |
|---------|------------------|----------|
| Engineering OS | Yes | All authenticated |
| Engineering Registers | Yes | All authenticated |
| Engineering Administration | No | Manager+ with permissions |
| Platform Administration | No | Manager+ (limited) / Admin (full) |
| Advanced Platform Tools | No | Admin only (optional sidebar) |

See [ROLE_BASED_NAVIGATION.md](../security/ROLE_BASED_NAVIGATION.md) and [PLATFORM_ADMINISTRATION.md](../architecture/PLATFORM_ADMINISTRATION.md).

## Default landing

- Home / post-auth: `/engineering` (Engineering Command Center)
- Platform overview (legacy): `/dashboard` (admin, hidden from sidebar)

## Sidebar nav item standard (2.11)

**Do not use `display: contents`** for icon+label — it collapsed spacing in 2.10.

```tsx
<Link className={sidebarNavItemClassName({ active })}>
  <SidebarNavItem icon={<Icon />} label="Projects" compact={collapsed} />
</Link>
```

| Part | Class / rule |
|------|----------------|
| Item | `flex min-h-10 items-center gap-3 rounded-lg px-4 py-2.5` |
| Icon rail | `nav-icon flex h-5 w-6 shrink-0` (24px wide, ~20px SVG) |
| Label | `nav-label text-[0.9375rem] leading-5 font-medium truncate` |
| Gap | **12px** (`gap-3`) — fixed icon width + gap together |

Test IDs: `sidebar-nav-item`, `sidebar-nav-icon`, `sidebar-nav-label`.

## Sidebar width & groups

| Token | Value |
|-------|--------|
| Expanded | **260px** (`w-[16.25rem]`) |
| Collapsed | ~76px |
| Group spacing | `mt-5` between groups, `mb-2.5` before items |
| Group label | 13px, `tracking-[0.05em]` |

## Brand block

Logo **44px**; RTB / Engineering OS / Enterprise Edition. Gap `gap-4` between logo and copy.

See [ENGINEERING_BRANDING.md](./ENGINEERING_BRANDING.md).

## Persistence

- `rtb.sidebar.scrollTop`
- `rtb.sidebar.groupState`
- `rtb.sidebar.collapsed`

## Header / search

See [SEARCH_INPUT.md](./SEARCH_INPUT.md). Controls use `h-11` alignment.
