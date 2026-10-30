# EOS 3 — Relationship / Dependency UI Data Contract

`EOS_APPROVED_DEPENDENCY_UI_DATA_CONTRACT=PASS`  
`EOS_GRAPH_ENGINEERING_LANGUAGE_UI=PASS`  
`EOS_GRAPH_VISUALIZATION_SCOPE=BOUNDED`

## Engineer-facing labels

Dependencies · Related Work · Inputs · Outputs · Evidence · Affected Items · Supporting Information

Avoid exposing: relationship graph, orchestration, node class, traversal engine.

## Compact Work Package cockpit foundation

Upstream example:

Vendor Data → Equipment Load → Structural Calculation

Downstream example:

Structural Calculation → Decision → Drawing

API: `GET .../relationship-graph?view=ui-contract&stableId=CALC-001`

Visualization this phase: bounded/diagnostic only — not a full interactive graph UI.
