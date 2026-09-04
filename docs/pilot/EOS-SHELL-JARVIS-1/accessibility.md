# EOS-SHELL-JARVIS-1 accessibility

SHELL_ACCESSIBILITY_PASS=true (code-level). Founder visual confirmation still required.

## Contrast and meaning

- Dark navy backgrounds with `#e8eef7` primary text
- Status uses icon + label + text, not color alone (`StatusChip` keeps the status dot)
- Focus-visible rings use `--eos-accent`
- Nav and command-bar controls are 44–48px minimum

## Keyboard and labels

- Existing sidebar, project selector, search, notifications, and sign-out remain keyboard reachable
- AI core exposes `role="status"` and an accessible name
- Icon-only header buttons keep `aria-label`
- PI Back / Return labels unchanged

## Motion and zoom

- `prefers-reduced-motion` disables pulse, shimmer, and transitions
- Pages remain vertically scrollable; shell overflow-hidden is only the outer frame
- Responsive targets: 1366×768, 1440×900, 1920×1080

SHELL_REDUCED_MOTION_PASS=true
