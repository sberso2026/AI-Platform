# EOS 3.11 Production Pilot Limitations Register (Frozen)

1. Controlled internal Production Pilot only
2. Live LLM DISABLED_NOT_VALIDATED — excluded from initial pilot
3. Real third-party connectors excluded (NOT_EXECUTED in 3.10)
4. SPACE GASS execution not qualified — EXISTING_D1G_READ_ONLY_CONNECTOR_BOUNDED_LIMITATION_NOT_EXECUTION_CERTIFIED
5. External solver global qualification NO
6. Non-D1 calculations NOT_QUALIFIED
7. D1 only QUALIFIED_BOUNDED within existing validated scope
8. Bounded staging reliability evidence (111 ops / 0 failures) — not full Production reliability certification
9. Performance READY_WITH_LIMITATIONS
10. No formal GA SLO
11. EOS 3 schema/migration not yet Production-proven
12. Medium/Low accepted defects (D001–D004) with pilot controls
13. GHSA-w5hq-g745-h8pq accepted moderate risk
14. No SOC 2 certification
15. No ISO 27001 certification
16. No EU AI Act certification
17. External customer pilot hold ACTIVE
18. Production PITR/backup must be fresh post-GO before any EOS 3 migration apply

`EOS_3_PILOT_LIMITATIONS_REGISTER_FROZEN=YES`

`FORMAL_SOC2_CERTIFIED=NO`  
`FORMAL_ISO27001_CERTIFIED=NO`  
`FORMAL_EU_AI_ACT_CERTIFIED=NO`
