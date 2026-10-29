# EOS 3 External Customer Support and Incident Model

`EOS_3_EXTERNAL_CUSTOMER_SUPPORT_MODEL_DEFINED=YES`  
`EOS_3_EXTERNAL_CUSTOMER_SERVICE_COMMITMENT_DEFINED=YES`  
`EOS_3_EXTERNAL_CUSTOMER_FORMAL_SLO_REQUIRED_BEFORE_RELEASE=NO`  
`EOS_3_EXTERNAL_CUSTOMER_INCIDENT_RESPONSE_READY=PASS`  
`EOS_3_EXTERNAL_CUSTOMER_SECURITY_NOTIFICATION_PROCESS_DEFINED=YES`

## Support model (controlled design-partner release)

| Element | Definition |
|---------|------------|
| Contact | Designated RTB Engineering & Analytics support contact (founder-led until expanded) |
| Hours | Best-effort business hours (Australia/Perth) unless contract states otherwise |
| Severity | Sev1 platform unavailable / security; Sev2 major feature impaired; Sev3 minor; Sev4 request |
| Escalation | Support → product owner → founder / release authority |
| Security incident route | Immediate escalate; preserve evidence; contain; notify per process below |
| Engineering-product escalation | Qualification / claim questions escalate to release owner — AI has no authority |
| Maintenance notifications | Advance notice for planned maintenance when practicable |

## Service commitment

`FORMAL_GA_SLO_DEFINED=NO`. Customer-facing terms must state **best-effort availability without formal uptime SLA** for initial `DESIGN_PARTNER` invite-only release.

`EOS_3_EXTERNAL_CUSTOMER_FORMAL_SLO_REQUIRED_BEFORE_RELEASE=NO` for this initial controlled class — **provided** contractual language does not invent unsupported guarantees. Broader commercial GA customers may later require `EOS-3-GA-SLO-MATURATION`.

## Incident response

1. Detect / report  
2. Classify severity  
3. Contain (including kill switch if EOS 3 exposure)  
4. Preserve evidence / audit  
5. Recover  
6. Customer notification when security/confidentiality impact warrants  
7. Post-incident review  

EOS 2 isolation must be preserved if EOS 3 kill switch engaged.

## Security breach communication

Notify affected design-partner contacts via contracted channels when unauthorized access to customer confidential data is confirmed or strongly suspected. Statutory deadlines require jurisdiction-specific legal review — **not encoded** as universal hard deadlines in this architecture document.
