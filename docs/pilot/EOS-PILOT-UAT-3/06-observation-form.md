# Observation form (one copy per participant × task)

Copy a block per task. Do not leave severity blank. Do not let an operator fill trust or value for you.

```text
Participant ID (P-0x):
Role: PM | engineer | reviewer
Date (AEST):
Browser:
Task ID (E1–E22 / M1–M9 / R1–R5):
Task name:

Completed: yes / no
Unassisted (RTB did not drive the UI): yes / no
Completion time (minutes):
Perceived wait: acceptable / borderline / too slow
Confusion (what, in their words):
Unexpected terminology:
Dead end (URL + what they tried):
Workaround:
Missing information:
Perceived value (their words):
Would-use-in-real-work: yes / no / undecided
Comparison with current workflow:
Severity if defect: BLOCKER | HIGH | MEDIUM | LOW | ENHANCEMENT | none
```

## Engineering AI trust block (every AI question)

Record the participant’s own yes/no. Do not infer.

```text
Participant ID:
Question asked (their wording):
Scope: document | current project
Document / project opened:

Answer correct? yes / no
Citation verified? yes / no
Source easy to inspect? yes / no
Unsupported content observed? yes / no
Abstention understandable? yes / no / not applicable
Citation volume excessive? yes / no
Response time acceptable? yes / no
Would trust with human review? yes / no

Copy this row into 15-ai-trust-evidence.md
```

## Severity

| Severity | Use when |
|---|---|
| BLOCKER | Cannot log in, wrong tenant, seated user gated, tenant leak, dead core route, document upload unusable for the file they must attach |
| HIGH | Core workflow fails after load; dangerous permission leak; document registers without a file when they uploaded one |
| MEDIUM | Operable but misleading |
| LOW | Copy, a11y, latency without failure |
| ENHANCEMENT | Would help weekly use; not a defect |

Issue freeze: log MEDIUM / LOW / ENHANCEMENT. Patch only BLOCKER / HIGH required to continue UAT.
