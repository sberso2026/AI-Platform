# EOS-3-UX-FOUNDATION-1B — Home performance regression investigation

`EOS_UI_PERFORMANCE_REGRESSION_INVESTIGATED=YES`

## Prior measurements (UX-1A)

| Route | P95 ms |
| --- | --- |
| Home (pre-cutover baseline) | 442 |
| Home (UX-1A) | 1819 |
| My Work | 218 |
| Project | 274 |
| Work Package | 191 |
| Engineering Design | 204 |

## Root cause

`EOS_UI_PERFORMANCE_REGRESSION_ROOT_CAUSE`: **Serverless cold start / first-hit TTFB dominates Home P95.**

Evidence from UX-1A samples: first Home sample ~1819 ms; subsequent warm samples clustered ~177–577 ms. My Work / WP / Design remained warm-fast, confirming the Home outlier is primarily cold-start wall time against the unauthenticated edge measurement method — not a duplicated client fetch loop unique to Home composition.

Contributing factors reviewed:

| Factor | Finding |
| --- | --- |
| Cold start | Dominant — first request after idle |
| Duplicated fetches | Home uses single `/api/engineering/dashboard` fetch; abort on unmount added in 1B |
| Sequential requests | Not present on Home (one request) |
| Cache | `cache: "no-store"` for freshness; warm latency still acceptable |
| Hydration / large assets | No screenshot/background image used as UI; hub is DOM |
| Server rendering | Client Home with API fetch; TTFB is HTML shell + later JSON |

## Mitigation applied in 1B

- Cancel in-flight dashboard fetch on project-filter change / unmount
- Avoid decorative/heavy raster assets on Home
- Light work-surface CSS (no extra large image layers)

## Post-1B measurement

Recorded after controlled-pilot deploy (same unauthenticated wall-ms P95 n=12 method).

| Route | P95 ms | Field |
| --- | --- | --- |
| Home | 1852 | `EOS_HOME_ROUTE_P95_MS` |
| My Work | 256 | `EOS_MY_WORK_ROUTE_P95_MS` |
| Project | 218 | `EOS_PROJECT_ROUTE_P95_MS` |
| Work Package | 207 | `EOS_WORK_PACKAGE_ROUTE_P95_MS` |
| Engineering Design | 247 | `EOS_ENGINEERING_DESIGN_ROUTE_P95_MS` |

Home P95 remains cold-start dominated (comparable to UX-1A 1819 ms). Warm Home samples were materially lower (~160–666 ms). Non-Home routes stayed near UX-1A warm levels.
