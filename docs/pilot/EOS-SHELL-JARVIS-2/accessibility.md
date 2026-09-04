# EOS-SHELL-JARVIS-2 accessibility

SHELL_ACCESSIBILITY_PASS=true (code-level). Founder visual confirmation still required.

## Contrast and meaning

- Command titles 30–38px, body 15–17px, metadata ≥13px
- Status uses label + colour, not colour alone
- Health UNKNOWN is an explicit labelled state
- Focus-visible rings remain `--eos-accent`

## Keyboard and names

- Existing selectors, search, notifications, sign-out, PI Back / Return unchanged
- Intelligence core exposes `role="status"` and an accessible name
- Icon-only header controls keep `aria-label`
- Module keys remain in `data-testid` only, not visible labels

## Motion

- `prefers-reduced-motion` disables `eos-ai-pulse`, `eos-core-spin`, and shimmer
- Scroll remains on `.page-main` / `project-intelligence-main`; outer shell stays `h-screen overflow-hidden`

SHELL_REDUCED_MOTION_PASS=true
