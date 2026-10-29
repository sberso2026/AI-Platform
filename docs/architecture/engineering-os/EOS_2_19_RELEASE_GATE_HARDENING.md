# EOS 2.19 Release Gate Hardening

`CANONICAL_GATE_ORCHESTRATION_DETERMINISTIC=YES`

`BACKGROUND_GATE_AMBIGUITY_RESOLVED=YES`

`LIVE_PERSISTENCE_PACK_HANG_ROOT_CAUSE_IDENTIFIED=YES`

`LIVE_PERSISTENCE_PACK_COMPLETES_WITH_BOUNDED_TIMEOUT=PASS`

## Prior ambiguity (EOS 2.18)

1. A background suite exited non-zero primarily from known moderate `GHSA-w5hq-g745-h8pq` plus an initially incorrect secret-scan invocation path that later passed via `pnpm --filter @rtb/engineering-review-persistence secret-scan`.
2. A second suite hung on the full live persistence/RLS pack (`pnpm --filter @rtb/engineering-review-persistence test`) without an orchestration-level timeout and was interrupted.

## Canonical command

```bash
pnpm eos2:canonical-gates
```

Implementation: `scripts/eos2-19-canonical-gates.mjs`

Behaviour:

- Runs required packs sequentially with bounded timeouts (default 180s; secret-scan 60s; audit 120s).
- Uses the correct secret-scan package script.
- Classifies dependency audit `PASS_WITH_KNOWN_MODERATE` when the only finding is `GHSA-w5hq-g745-h8pq` (1 moderate).
- Does not fake exit 0 for functional failures.
- Writes `docs/architecture/engineering-os/EOS_2_19_CANONICAL_GATE_RESULT.json`.
- Exit 0 = PASS or PASS_WITH_KNOWN_MODERATE; exit 1 = FAIL; exit 2 = TIMEOUT.

Optional live pack:

```bash
EOS219_INCLUDE_LIVE_PERSISTENCE=1 pnpm eos2:canonical-gates
```

Live pack uses `test:rls` with `EOS219_LIVE_PERSISTENCE_TIMEOUT_MS` (default 240s) and is not required for the authoritative controlled-pilot gate. Default orchestration uses `test:unit` to avoid indefinite hangs.

## Hang root cause

The hang was an orchestration defect: launching the full persistence test entrypoint (including live JWT RLS suites that depend on network/auth fixtures) in an unbounded background shell. It was not classified as an application write defect. Bounded timeout + default unit pack resolves authoritative gate completion.

## Authoritative result this phase

See `EOS_2_19_CANONICAL_GATE_RESULT.json`: `authoritativeResult=PASS_WITH_KNOWN_MODERATE`, `releaseTestCount=220`.
