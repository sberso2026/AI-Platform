# EOS 3.11R Production Deployment Evidence

Validated functional candidate: `c89f106af689a2e79c81a30d0a8420803e632220`

Authorized activation delta under human GO:

- enable Production EOS 3 access only when `enrollmentState=PILOT` and human GO is ISSUED
- freeze authorization binding module `eos3-pilot-authorization.ts`
- prefer-const build fix required for Production compile (`429e0452`)

Pre-activation Production deployment remained EOS 2 GA: `dpl_Hyixcc94d7sbfJbWwR1sBWozmmxF` / runtime `051a3410…`.

## Activation deployment

| Field | Value |
|-------|-------|
| `EOS_3_PRODUCTION_DEPLOYMENT_ID` | `dpl_8fKpNWQDpXzoaNT7jQXvV8heeZjd` |
| `EOS_3_PRODUCTION_RUNTIME_COMMIT` | `429e0452319641b717864c50ce6a40507548a7a9` |
| Ready state | `READY` |
| Target | `production` |
| Alias | `https://eos-pilot.rtbea.com.au` |
| Inspect | `https://vercel.com/silvestres-projects-96ea276a/rtb-ai-platform/8fKpNWQDpXzoaNT7jQXvV8heeZjd` |

`EOS_3_PRODUCTION_RUNTIME_MATCHES_AUTHORIZATION=YES` — Production runtime is the authorized validated candidate `c89f106a` plus the frozen GO activation delta (PILOT Production access binding) and deploy-blocking lint fix only.

`EOS_3_RUNTIME_BEHAVIOR_EQUIVALENCE=PASS` for EOS 2 paths; EOS 3 Production path intentionally enabled only for controlled PILOT enrollment per GO.
