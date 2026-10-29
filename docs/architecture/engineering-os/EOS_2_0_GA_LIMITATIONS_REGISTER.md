# EOS 2.0 GA Limitations Register

`GA_LIMITATIONS_REGISTER_COMPLETE=YES`

Frozen at EOS 2.22 closeout. Limitations are not removed because the product is GA.

| # | Limitation | Status |
| --- | --- | --- |
| 1 | External customer onboarding held pending legal review | ACTIVE |
| 2 | Pricing externally configured | ACTIVE |
| 3 | PITR recommended but not enabled | ACTIVE (`RECOMMENDED_FOR_GA`) |
| 4 | Engineering AI corpus limitation (Ask abstains outside indexed sources) | ACTIVE |
| 5 | MDR UX limitation | ACTIVE |
| 6 | `GHSA-w5hq-g745-h8pq` accepted bounded moderate risk | ACCEPTED_BOUNDED_RISK |
| 7 | Bounded Production reliability evidence (not large-scale field proof) | ACTIVE |
| 8 | Degraded/nonblocking Production authenticated interactive performance | ACTIVE |
| 9 | No formal contractual GA SLO | `FORMAL_GA_SLO_DEFINED=NO` |
| 10 | No SOC 2 certification | `FORMAL_SOC2_CERTIFIED=NO` |
| 11 | No ISO 27001 certification | `FORMAL_ISO27001_CERTIFIED=NO` |
| 12 | No EU AI Act certification | `FORMAL_EU_AI_ACT_CERTIFIED=NO` |
| 13 | Non-D1 deterministic calculations not qualified | `NOT_QUALIFIED` |
| 14 | External solver execution not globally qualified | `NO` |

Related holds:

- `EXTERNAL_CUSTOMER_ONBOARDING_AUTHORIZED=NO`
- `EXTERNAL_CUSTOMER_LEGAL_REVIEW_REQUIRED=YES`
- `EXTERNAL_CUSTOMER_ONBOARDING_HOLD_ENFORCED=YES`
- Future clearance phase only: `EOS-2.23-EXTERNAL-CUSTOMER-LEGAL-AND-COMMERCIAL-RELEASE-GATE`
