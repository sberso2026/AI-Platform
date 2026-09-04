# EOS-SHELL-JARVIS-1 design tokens

Defined once in `apps/web/src/app/globals.css`. Light tokens remain under `html.light` so theme extensibility is not removed.

| Token | Dark enterprise default |
| --- | --- |
| `--eos-bg-primary` | `#060b14` |
| `--eos-bg-secondary` | `#0b1220` |
| `--eos-panel` | translucent navy |
| `--eos-panel-elevated` | elevated navy |
| `--eos-border` | cyan at 14% |
| `--eos-border-active` | cyan at 55% |
| `--eos-text-primary` | `#e8eef7` |
| `--eos-text-secondary` | `#93a4bb` |
| `--eos-accent` | `#38bdf8` |
| `--eos-accent-soft` | cyan 14% |
| `--eos-success` | `#34d399` |
| `--eos-warning` | `#fbbf24` |
| `--eos-danger` | `#f87171` |
| `--eos-ai` | `#c4b5fd` |

Semantic state classes: `.eos-state-success`, `.eos-state-warning`, `.eos-state-danger`, `.eos-state-unknown`.

A compatibility remap under `[data-eos-theme="enterprise-dark"]` restyles leftover `bg-white` / `text-slate-900` utilities onto these tokens so PI intelligence pages inherit the shell without a second color system.
