# EOS 2.18 Production Performance and Reliability

No formal service-level objective is defined for these routes. These figures are not an SLO result. DevTools was docked in Edge for every measurement, so the numbers are upper observations of this session.

`PRODUCTION_PERFORMANCE_MEASUREMENTS_CAPTURED=YES`

`PRODUCTION_PERFORMANCE_STATUS=DEGRADED`

`PRODUCTION_RELIABILITY_VALIDATION=FAIL`

## Measurements

| Surface | Method | Result | Time |
| --- | --- | --- | --- |
| Delivery lifecycle document | Hard reload of `/engineering/delivery-lifecycle` | Page rendered | `loadEventEnd` 9190 ms |
| Engineering Basis API | Parallel authenticated GET | HTTP 200 | 6404 ms |
| Structural delivery API | Parallel authenticated GET | HTTP 200 | 6833 ms |
| Interface API | Parallel authenticated GET | HTTP 200 | 8330 ms |
| Change-impact API | Parallel authenticated GET | HTTP 200 | 6276 ms |
| Design-freeze API | Parallel authenticated GET | HTTP 200 | 8806 ms |
| Login | Not remeasured | Existing session remained signed in | — |
| Project landing | Not separately timed | Workspace context remained the pilot workspace | — |
| Successful workflow write | Not available | No persist path | — |
| Grounded AI answer | Not available | No pilot workflow records to query | — |

The five API times overlapped in one `Promise.all`. They are not five serial user waits. The slowest of that batch was the design-freeze GET at 8806 ms. The document load and the reads are both slow enough, even with DevTools overhead, to classify the observed pilot experience as degraded. They are not blocking: each read returned 200 and the lifecycle page rendered.

## Reliability exercise

| Action | Result |
| --- | --- |
| Hard reload of delivery lifecycle | Rendered the same empty lifecycle. No new hydration error on that reload. |
| Repeated authenticated reads | All five workflow GETs returned 200. |
| Create and revise | Not repeatable. The application does not persist the object. |
| Interface state after revision | Not exercised. No interface row exists. |
| Logout and login | Not repeated this phase. The existing session stayed valid and EOS 1 projects returned 200. |
| Rollout continuity | Mode remained `controlled_pilot`. The enrolled lifecycle route still rendered. The historical operator write can still silently no-op. |
| Duplicate successful submission | None. The freeze POST was denied once. |
| Lost update of a workflow row | None, because no workflow row was written. |
| Permission drift | The same `pilot_engineer` session was allowed to read and was denied `freeze-approve`. |

Reliability does not pass. Navigation of the empty lifecycle was stable, and the create, revision, and interface operations required for an operational pilot could not be repeated.
