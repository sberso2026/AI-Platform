# EOS-TQ-UX-1R3 Print

## Freeze root cause

`TQ_PRINT_FREEZE_ROOT_CAUSE=` Print Preview is rendered inside `PlatformShell` (`h-screen overflow-hidden`) and the print page had no `flex-1 overflow-y-auto` scroll region, no Print control, and no Back control. Founders saw a static sheet that could not scroll or print. Print-only CSS was not applied in screen mode. Loading text can look frozen if the TQ fetch is slow; the toolbar is now interactive immediately.

`TQ_PRINT_FREEZE_REMEDIATED=true`

## Screen toolbar

- ← Back to TQ-XXX
- [Print] → `window.print()`
- No new PDF stack

`@media print` hides the toolbar, app sidebar, and app header. Document branding header is kept (no generic `header { display:none }`).

Print CSS also sets overflow visible and auto height so the A4 sheet is not clipped.
