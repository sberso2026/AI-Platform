# EOS 3.11R Production Deployment Evidence

Validated functional candidate: `c89f106af689a2e79c81a30d0a8420803e632220`

Authorized activation delta under human GO:

- enable Production EOS 3 access only when `enrollmentState=PILOT` and human GO is ISSUED
- freeze authorization binding module `eos3-pilot-authorization.ts`

Pre-activation Production deployment remained EOS 2 GA: `dpl_Hyixcc94d7sbfJbWwR1sBWozmmxF` / runtime `051a3410…`.

Activation deployment ID and runtime commit are recorded in the phase closeout output after Vercel Production deploy of the activation commit.

`EOS_3_RUNTIME_BEHAVIOR_EQUIVALENCE=PASS` for EOS 2 paths; EOS 3 Production path intentionally enabled only for controlled PILOT enrollment per GO.
