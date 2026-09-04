# Limitations

- Founder visual acceptance is required. `PI_ENTERPRISE_UX_PASS=false`.
- Authenticated populated screenshots at 1366 / 1440 / 1920 must be captured on Preview by the founder or a follow-up authenticated capture. This pack records required shots in `screenshots/README.md`.
- Owner / due / impact on attention items show "Not published" unless Command Centre evidence includes them. No speculative values.
- Schedule and cost intelligence remain empty without connected/published data.
- Page-level project dropdowns remain on some intelligence views for PI-1..PI-9 source tests.
- Full-repo `tsc --noEmit` still reports pre-existing digital-twin / asset-intelligence errors unrelated to this UX pass. PI UX files were not in that error set.
- Preview only. Not Production. Not external UAT.
- Local/Vercel `next build` on this PI branch requires a Next 15.5.20 `@vercel/nft` BigInt evaluator guard (`scripts/patch-next-nft-bigint.cjs`) and a client webpack `node:` fallback. These do not change PI domain ownership.
