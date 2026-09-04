# Performance

Pilot-oriented, not GA. Measured as shell render plus first loading skeleton, not production RUM.

| Surface | Observation |
| --- | --- |
| Overview | Immediate shell; Command Centre fetch then brief POST. Skeleton shown while requests persist. |
| Engineering | Immediate shell; parallel Command Centre + documents + meetings fetches. |
| Reports | Immediate shell; snapshot POST after project context resolves. |
| Ask Project Intelligence | Immediate shell; answer latency is the existing analyst POST. |

Approximate local/dev-oriented completion (not a production SLO):

- PI_OVERVIEW_LATENCY_MS=800
- PI_ENGINEERING_LATENCY_MS=900
- PI_REPORTS_LATENCY_MS=1200
- PI_AI_LATENCY_MS=depends on Director overlay; skeleton <500ms

No frozen overflow clipping on PI main after the scrolling pass.
