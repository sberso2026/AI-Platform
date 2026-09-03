# Founder regressions

## Offline founder-style split (48 questions)

- RETRIEVAL_RECALL_AT_5=0.917
- ANSWER_CORRECTNESS_RATE=0.812
- NUMERICAL_ANSWER_CORRECTNESS_RATE=0.812

## Live Preview (`live-qa.json`)

Host: https://eos-pilot.rtbea.com.au  
Mandatory cases: sheet metal guard thickness, context-prefixed guard thickness, platform width, conveyor crossover, four lanyard/pull-wire interval formulations, nut mechanical test method, bolt straightness.

All ten cases PASS. Lanyard answers are `ANSWER 4.5 m maximum` with BASIS citing the “not exceeding 4.5 m” sentence. None lead with “Engineering AI could not generate an answer.”

`FOUNDER_REGRESSION_PASS=true`  
`LANYARD_LIVE_QA_PASS=true`

Residual: BASIS still includes neighbouring 230 N text from the same page window. The displayed ANSWER is the interval, not the force.
