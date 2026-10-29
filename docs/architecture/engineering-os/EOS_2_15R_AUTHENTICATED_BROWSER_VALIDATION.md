# EOS 2.15R Authenticated Browser Validation

## Deployment

| Item | Value |
| --- | --- |
| Staging deployment | `dpl_Am7AhnHwv7Hjdymx4e73AXrfv75C` |
| Deployment status | Ready |
| Environment | Vercel preview |
| Source commit | `af6612bdebe40616dab18525ceab4dc70f03621e` |
| Source branch | `cursor/era-7a-engineering-review-pilot-gate` |
| Build identity dirty | false |
| Staging Supabase | `rntonzigxwxcjlcsadip` |
| Qualification project | `EOS-QA-001` |
| Fixture label | `SYNTHETIC_QUALIFICATION_PROJECT` |
| Workspace | `eos-qa-001 / eos-qa-a` |

Build identity was read from the deployed preview. Production identity remained commit `0c1ec9e06eea59ac089753f3c930f1a599b14648`, deployment `dpl_7EBZUxhkVX7MjR44rYCgkg8odHgB`, and Supabase `wcydlhqiqdwgoaqrlget`.

Vercel deployment protection stayed enabled. The qualification browser used the existing Protection Bypass for Automation, then signed in through the normal EOS login. The bypass secret is not recorded here. Production protection was not changed. Staging was not made public.

## Route matrix

The signed-in engineer session observed every route below. Each engineering page loaded on its own path, rendered `EOS-QA-001`, and did not render the unrelated workspace.

| # | Path | Expected | Observed | Result |
| --- | --- | --- | --- | --- |
| 1 | Login | Application login succeeds | Auth token returned 200. The session left `/login`. | PASS |
| 2 | Workspace selection | Qualification workspace visible | Active workspace `eos-qa-001 / eos-qa-a`, role engineer. | PASS |
| 3 | `/engineering` | Project overview | Loaded. `EOS-QA-001` visible. | PASS |
| 4 | `/engineering/delivery-lifecycle` | Lifecycle overview | Loaded. `EOS-QA-001` visible. | PASS |
| 5 | `/engineering/process` | Process Home | Loaded. `EOS-QA-001` visible. | PASS |
| 6 | `/engineering/mechanical` | Mechanical Home | Loaded. `EOS-QA-001` visible. | PASS |
| 7 | `/engineering/piping` | Piping Home | Loaded. `EOS-QA-001` visible. | PASS |
| 8 | `/engineering/structural` | Structural Home | Loaded. `EOS-QA-001` visible. | PASS |
| 9 | `/engineering/civil` | Civil Home | Loaded. `EOS-QA-001` visible. | PASS |
| 10 | `/engineering/geotechnical` | Geotechnical Home | Loaded. `EOS-QA-001` visible. | PASS |
| 11 | `/engineering/electrical` | Electrical Home | Loaded. `EOS-QA-001` visible. | PASS |
| 12 | `/engineering/instrumentation` | Instrumentation and Control Home | Loaded. `EOS-QA-001` visible. | PASS |
| 13 | `/engineering/interface-intelligence` | Interface Intelligence | Loaded. `EOS-QA-001` visible. | PASS |
| 14 | `/engineering/change-impact` | Change Impact Intelligence | Loaded. `EOS-QA-001` visible. | PASS |
| 15 | `/engineering/design-freeze` | Design Freeze and Deliverables | Loaded. `EOS-QA-001` visible. | PASS |
| 16 | `/engineering/deliverables` | Master Deliverable Register | Loaded. `EOS-QA-001` visible. | PASS |
| 17 | `/engineering/integrated-project` | Qualification project | Notice: persisted project `EOS-QA-001`, label `SYNTHETIC_QUALIFICATION_PROJECT`. Qualification API returned the project and four bounded answers. `approvalGranted` was false. | PASS |
| 18 | Logout | Session ends | Sign-out returned the login page. | PASS |
| 19 | `/engineering/mechanical` after logout | Protected route blocked | Response 200 at `/login`. Login form visible. | PASS |

Route count 19. Pass count 19. Fail count 0.

## Unrelated workspace

A second synthetic engineer selected `eos-qa-001 / eos-qa-b` and opened the same integrated project page. The notice said no persisted qualification project was visible in that workspace. The page text did not contain `EOS-QA-001`. Leak count for this observation is 0.

## Limitations

The first landing after password login is `/settings/security` when no active workspace is selected. Engineering pages load after the qualification workspace is selected. The preview remains protected for a browser that does not use the authorized automation bypass. No credentials or session cookies are stored in this artifact.
