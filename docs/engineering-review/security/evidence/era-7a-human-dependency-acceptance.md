# ERA-7A authorized human residual-dependency decision

This is a human security decision. It was not made by AI.

```
accepted_by: Silvestre Berso
accepted_at: 2026-09-20T20:24+08:00
scope: controlled Engineering Review AI pilot only
expiry/review_date: 2026-10-20
rationale: Reviewed the ERA-7A dependency disposition and reachability analysis. No unresolved CRITICAL production dependency vulnerability remains. The documented HIGH advisories for sharp@0.34.5, postcss@8.4.31, and nanoid@3.3.15 are not assessed as practically exploitable through the bounded controlled-pilot Engineering Review path, subject to ERA-7A mitigations. Continue monitoring and upgrade when a compatible remediation is available.
```

**Does not authorize:** enterprise production deployment; removal of dependency monitoring; expansion of affected execution paths; live LLM deployment; ignoring future vulnerability information.

**Required treatment:** continue monitoring affected dependencies and upgrade when a compatible remediation becomes available.

**CONTROLLED_PILOT_READY is unchanged by this decision alone.** Live AAL2 and hosted `RTB_REVIEW_CLAMAV_URL` remain open. **ENTERPRISE_PRODUCTION_READY** remains **NO**.
