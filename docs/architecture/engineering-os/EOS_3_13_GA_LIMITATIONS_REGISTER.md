# EOS 3.13 GA Limitations Register (Frozen)

`EOS_3_GA_LIMITATIONS_REGISTER_FROZEN=YES`

`EOS_3_GA_NON_GOALS_FROZEN=YES`

## Limitations

1. Live LLM `NOT_SUPPORTED` / `DISABLED_NOT_VALIDATED`
2. Real third-party connectors disabled / `NOT_SUPPORTED`
3. SPACE GASS not execution-certified; global qualification NO
4. External solvers not globally qualified
5. D1 qualification bounded to existing validated scope only
6. Non-D1 calculations `NOT_QUALIFIED`
7. Production EOS 2→3 project migration not yet exercised (migration count 0)
8. Medium defects D001/D002 `OPEN_ACCEPTED_FOR_GA` under exclusion controls
9. PITR not enabled — WAL-G physical backups + logical snapshots; PITR GA risk accepted with documented recovery limitation
10. No formal GA performance SLO (`EOS_3_FORMAL_GA_SLO_DEFINED=NO`)
11. Bounded Production reliability evidence (150 cumulative ops / 0 failures) — not statistical reliability certification
12. GHSA-w5hq-g745-h8pq accepted bounded risk
13. SOC 2 not certified
14. ISO 27001 not certified
15. EU AI Act not certified
16. External customer release hold ACTIVE
17. Public self-service signup unavailable
18. Software GA release authority (when designated) does not grant engineering design / PE / regulatory / IFC / solver qualification authority
19. EOS 2 entitlement/enrollment does not auto-enable EOS 3

## Explicit non-goals

- Full DMS replacement
- Full EAM / CMMS
- Full construction ERP
- Historian replacement
- Autonomous engineering approval
- Autonomous IFC release
- Autonomous solver qualification
- Unrestricted autonomous agents
- Public self-service onboarding
- Automatic EOS 2 project migration

`FORMAL_SOC2_CERTIFIED=NO`  
`FORMAL_ISO27001_CERTIFIED=NO`  
`FORMAL_EU_AI_ACT_CERTIFIED=NO`
