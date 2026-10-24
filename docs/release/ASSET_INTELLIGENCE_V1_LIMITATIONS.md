# Asset Intelligence V1.0 — Known Limitations

Version 1.0.0 (`asset-intelligence-v1.0.0`). This document records limitations
of capabilities that *are* GA. Capabilities that do not exist at all are listed
in `ASSET_INTELLIGENCE_V1_UNAVAILABLE_CAPABILITIES.md`.

## Evidence and confidence

- Every published state is bounded by the evidence available to it. Where
  evidence is insufficient the module abstains with a reason rather than
  producing a low-confidence answer. Operators sometimes read an abstention as a
  failure; it is the intended behaviour.
- Evidence confidence and trend confidence are qualitative bands, not
  probabilities. They must not be presented as percentages.

## Health composition

- The Asset Health Index is composed from condition evidence only. An asset with
  serious failure history, adverse degradation or a late lifecycle position can
  still show a good health index, because those dimensions are deliberately not
  health factors in V1.0. Users must read the composed decision context, not the
  health index alone.

## Condition

- Condition depends on Inspection Intelligence 1.0.0 public contracts. Without
  Inspection Intelligence, condition reports reduced evidence confidence rather
  than failing, which can be mistaken for a stale reading.
- Condition is as fresh as the last inspection. There is no interpolation
  between inspections.

## Reliability

- Reliability intelligence is qualitative. There is no MTBF, no failure rate and
  no confidence interval. Customers arriving from a quantitative RCM background
  routinely expect one.

## Time series, trend and degradation

- Trend and degradation describe **observed** behaviour inside an analysis
  window. They are not forecasts, and extrapolating them outside the window is
  not supported by the module.
- Change detection is rule-based. It detects a change in a monitored series; it
  does not attribute a cause.
- Very sparse series produce abstentions rather than trends.

## Lifecycle

- Lifecycle intelligence is advisory over the canonical lifecycle owned by the
  Engineering OS Shared Asset Domain. A lifecycle transition candidate is a
  proposal for a human, never an automatic transition.

## Risk, maintenance and priority

- Risk signals are advisory. Canonical Engineering Risk is owned by Engineering
  Core and is never auto-mutated, so a signal does not appear on the risk
  register until a human raises it.
- Maintenance recommendations do not create work. There is no CMMS integration
  in V1.0.
- Priority is contextual, not a score. `NUMERIC_PRIORITY_SCORE_REQUIRED` is
  `false`; anyone expecting a sortable numeric priority column will not find one.

## Fusion

- Fusion reconciles multiple registered sources using explicit rules. There is
  no learned source-trust weighting (`SOURCE_TRUST_MODEL_READY` is `false`), so
  conflicting sources of equal standing produce a recorded conflict for human
  resolution rather than an automatic winner.

## Predictive governance

- Predictive governance is a decision framework, not a prediction engine.
  Qualification results are fixture-bounded and do not transfer to production
  data.
- Method eligibility can return "eligible" for an objective while execution
  remains unavailable. Eligible means "this method is not disqualified", not
  "this method may run".

## Workflow and authority

- Segregation of duties is strict: a submitter cannot approve their own
  assessment. Small teams with a single qualified engineer will stall in review.
  This is intentional and has no configuration override.
- Published states are immutable. Corrections are made by publishing a new
  version that supersedes the previous one.

## Persistence and operations

- Production requires hosted Supabase persistence. In-memory repositories are
  refused, so there is no degraded offline mode.
- The module fails closed on persistence outage. It never serves stale or
  synthesised intelligence.
- The intelligence timeline is append-only and grows monotonically. Archival is
  a platform concern; the module never prunes it.

## Interface

- The Engineering OS module page is a read-oriented overview of V1 surfaces and
  governance state. Assessment authoring happens through the API and the
  governed review workflow, not through a rich page UI in V1.0.

## Multi-tenancy

- Isolation is enforced by Row Level Security. A misapplied migration that drops
  a policy is a security incident, not a degraded feature — there is no
  application-level fallback filter by design.
