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
| Authenticated pilot login | Not run |
| EOS 1 workflow | Not run |
| Cross-workspace UI isolation | Not run |
| Cohort enablement | Not run |

EOS 2 mode remains off. Enrolled workspace count is 0.
