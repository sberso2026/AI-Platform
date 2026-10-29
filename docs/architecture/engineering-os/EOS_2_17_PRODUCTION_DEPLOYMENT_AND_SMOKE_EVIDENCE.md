# EOS 2.17 Production Deployment and Smoke Evidence

## Deployment

`PRODUCTION_REDEPLOYED=YES`

Live Production identity:

| Item | Value |
| --- | --- |
| Commit | `bd9654fc35ce9bdcc8fc3a42570ae2cd92311c01` |
| Deployment | `dpl_9UhYQdVBkiBA6mAd4ajBHRFndhYZ` |
| Environment | `production` |
| Supabase | `wcydlhqiqdwgoaqrlget` |
| Dirty | false |
| Alias | `https://eos-pilot.rtbea.com.au` |

The source tree was a detached worktree at that commit. The identity route reports the commit through `NEXT_PUBLIC_BUILD_SHA`, because a CLI upload does not set `VERCEL_GIT_COMMIT_SHA`. The branch field is `unknown`. The staging preview was not promoted.

Rollback deployment `dpl_7EBZUxhkVX7MjR44rYCgkg8odHgB` remains the prior Production deployment.

## Smoke

| Check | Result |
| --- | --- |
| Build identity | Candidate commit, production env, production Supabase |
| `/engineering` unauthenticated | 307 to `/login` |
| `/api/engineering/delivery-lifecycle` unauthenticated | 401 |
| Authenticated pilot login | Not run. The continuation opened the normal login form and did not submit credentials. |
| EOS 1 workflow | Not run |
| Cross-workspace UI isolation | Not run |
| Cohort enablement | Not run |

EOS 2 mode remains off. Enrolled workspace count is 0.

## After EOS 2.17R authentication

The deployment was not replaced. `dpl_9UhYQdVBkiBA6mAd4ajBHRFndhYZ` and rollback deployment `dpl_7EBZUxhkVX7MjR44rYCgkg8odHgB` were both Ready when this phase closed.

| Check | Result |
| --- | --- |
| Authenticated pilot login | Pass. Normal login, then logout and login. MFA was not challenged. |
| EOS 1 smoke | Pass before enrollment. `Pilot-0001` remained readable. |
| Entitled but not enrolled | Pass. Direct route, API, server action, and AI context denied. |
| EOS 2 routes after enrollment | Pass. Lifecycle through design freeze rendered. No separate MDR route. |
| Non-pilot workspace | Pass. Direct lifecycle route denied while mode was `controlled_pilot`. |
| Kill switch | Pass. Mode off denied EOS 2, EOS 1 stayed available, then mode was restored. |

`APPLICATION_RUNTIME_CHANGED=NO`
