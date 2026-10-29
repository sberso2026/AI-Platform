# EOS 3.9 EOS 2 / EOS 3 Coexistence Matrix

Deterministic matrix (`runEos2Eos3CoexistenceMatrix`):

1. EOS 2 project, EOS 2 user → EOS 2 runtime / Ask AI
2. EOS 2 project, EOS 3-entitled user → generation unchanged; no auto-enable
3. EOS 3 staging project, EOS 3 development user → EOS 3 development runtime
4. EOS 2 entitlement only → EOS 3 denied
5. EOS 3 entitlement without enrollment → denied
6. EOS 3 entitlement + enrollment → development access allowed
7. Migration eligible without authorization → no execution
8. Migration authorized → human authority only
9. Migration completed → staging / non-Production
10. Migration rolled back → target removed; source unchanged
11. EOS 2 and EOS 3 projects in same workspace → explicit generation routing
12. EOS 2 Ask AI → EOS 2 behavior
13. EOS 3 Engineering Reasoning Assistant → development-only path
14. Cross-generation object ID → API contracts generation-scoped
15. Cross-workspace migration attempt → denied

Additional invariants: legacy metadata defaults to EOS 2; no auto migration triggers (login, entitlement, route, bulk).

## Routing / isolation

- Generation-aware API, UI, AI, knowledge, workflow, and entitlement routing.
- EOS 3 knowledge indexing does not silently index EOS 2 projects.
- EOS 3 workflow definitions do not alter EOS 2 GA workflow behavior.
