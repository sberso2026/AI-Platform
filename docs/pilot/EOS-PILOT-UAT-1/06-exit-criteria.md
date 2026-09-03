# Pilot exit criteria

Controlled Preview pilot on https://eos-pilot.rtbea.com.au. Meeting these criteria exits **human UAT readiness / controlled pilot**, not Production GA.

## Must remain true

1. Production is **not** promoted. `PRODUCTION_GA_READY=false`.
2. Identity architecture unchanged (no Yahoo/Worley membership on LAUNCH-1).
3. Commerce model unchanged (no trial conversion, no extra product SKUs).
4. Founder membership unchanged: `silvestre.berso@rtbea.com.au` is LAUNCH-1 **admin**, confirmed, seated **once**.
5. EOS seat pool remains **5 licensed / 5 assigned / 0 available**.
6. No duplicate founder seats.

## Human UAT may start when

- `HUMAN_UAT_ALLOWED=true` (no technical BLOCKER on Preview).
- This UAT pack is the script in use.
- Founder can complete login → logout → login on `eos-pilot.rtbea.com.au`.

## Controlled pilot is successful when

- Engineer and PM/reviewer scripts have been sat by humans (not only agent click-through).
- Acceptance checklist is complete with Pass/Fail.
- **BLOCKER_COUNT = 0** from human sessions.
- HIGH issues are listed with owner and workaround; none prevent seated engineers from opening a project and using Command Centre, TQs, and Engineering AI.
- Seat and tenant isolation still match the must-remain-true list.
- Participants did not use Production.

## Controlled pilot is **not** an exit to Production when

- HIGH issues remain on install/seat display, admin roster, or owner-only leaks — fix or formally defer before any Production discussion.
- Trialing label is still considered too misleading for paying customers — Commerce copy only; do not convert the subscription as a “fix”.
- Independent humans have not sat the scripts.

## Explicit non-goals

- Production GA
- Identity redesign
- Commerce model change
- PI / II feature expansion
- Extra product scope
