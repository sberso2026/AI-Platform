# EOS-TQ-UX-1R — Preview deployment

**Host:** https://eos-pilot.rtbea.com.au  
**Target:** Preview only. Production was not promoted.

## Source

- Branch: `cursor/eos-ux-1-operational-experience`
- Implementation: enterprise TQ register and create → assign → respond → review → close on the canonical Engineering OS TQ entity.
- Live unblock: POST create was 403 because write handlers re-asserted `technical_query.read` via `getPresented`. Create and lifecycle actions now present after write without a second read assertion.

## Preview

- `PREVIEW_DEPLOYMENT_ID=dpl_94cW3hhsjZ6VXCeVu3NcJSeLwEXL`
- Inspect: `eos-pilot.rtbea.com.au` → this Preview (`target: preview`)
- `/api/platform/build-identity` on Preview: `commitSha` matches the certification commit, `workingTreeClean=true`, `vercelEnv=preview`

## Production (unchanged)

- `dpl_EF2DKHT59waxGKL28HSvGMpgtDBG`
- Not promoted. No `--prod`.

## Notes

- Custom domain bind used the existing Preview alias API. `vercel alias set` is not used.
- No external invites. No seat or cohort changes.
