# ERA-7A live MFA operating evidence

**Environment:** RTB AI Platform Staging `rntonzigxwxcjlcsadip`  
**Named non-production pilot:** `cert-er-a1` (Tenant A `cert-er-a`)  
**Checked:** 2026-09-20 (final re-attestation)  
**Secrets stored:** none (no passwords, JWTs, TOTP secrets, or recovery codes)

| Check | Result |
| --- | --- |
| Tenant A `engineeringReview.requireMfa` | true (policy not weakened) |
| Tenant A `requireEnterpriseSso` | false |
| Named pilot verified MFA factors | 0 |
| Live password session AAL | aal1 |
| Live password decision when requireMfa=true | rejected (`mfa_required`) |
| Live AAL2 accepted | **not proven** — human enrollment required |
| Wrong tenant / Tenant B satisfying Tenant A MFA | rejected (existing live-identity test) |

AI cannot complete TOTP/WebAuthn enrollment. CONTROLLED_PILOT_READY cannot become YES until a human enrolls MFA for the named staging pilot engineer and live AAL2 acceptance is re-verified.
