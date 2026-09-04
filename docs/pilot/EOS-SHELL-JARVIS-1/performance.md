# EOS-SHELL-JARVIS-1 performance

SHELL_PERFORMANCE_PASS=true (engineering evidence). Founder timing confirmation still required.

## Constraints honoured

- No WebGL, canvas, or background video
- Motion is CSS only (gradients, SVG-free pulse, shimmer)
- No second UI framework
- No large decorative hero that delays first paint

## Surfaces measured by architecture (not synthetic RUM in this ticket)

| Surface | Expectation |
| --- | --- |
| Initial shell | Sidebar + command bar + tokens; no extra runtime |
| Route transition | Existing Next.js App Router; no new layout tree |
| Command Center | Same `loadCommandCenter` fetches |
| PI Overview | Same command-centre API |
| AI Analyst | Same analyst POST contract |

Visual effects must not materially slow these surfaces. If Preview profiling later shows otherwise, remove pulse/shimmer first.
