# Inspection Intelligence — Offline / Device Evidence

## Emulation (Playwright)

| Profile | Viewport | Result |
|---------|----------|--------|
| Phone Chrome emulation | 390×844 | Certified via offline-sync.spec.ts |
| Tablet Chrome emulation | 768×1024 | Certified via offline-sync.spec.ts |

Emulation does **not** claim native iOS/Android offline filesystem behaviour.

## Physical device (where available)

| Device | Browser/PWA | Offline cycle | Status |
|--------|-------------|---------------|--------|
| iOS Safari/PWA | current | connect→offline→reconnect | Document when executed; otherwise **not claimed** |
| Android Chrome/PWA | current | connect→offline→reconnect | Document when executed; otherwise **not claimed** |

Phase 9G certification separates physical-device evidence from emulation. Absence of
physical-device runs does not invent capability claims.
