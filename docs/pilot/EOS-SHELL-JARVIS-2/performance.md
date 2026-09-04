# EOS-SHELL-JARVIS-2 performance

SHELL_PERFORMANCE_PASS=true (engineering evidence). Founder timing confirmation still required.

## Constraints honoured

- No WebGL, canvas runtime, or background video
- Depth, panels, and rings are CSS/SVG
- No second UI framework or 3D dependency
- Same Command Center and PI data loaders as JARVIS-1

## Surfaces

| Surface | Runtime |
| --- | --- |
| Shell | Token CSS + SVG core |
| Command Center | Existing `loadCommandCenter` |
| PI Overview | Existing command-centre GET + analyst POST |
| Intelligence pages | Existing PI dataset GETs |

If Preview profiling later shows paint cost, remove spin/pulse first. Do not add a canvas fallback.
