# Live UAT evidence

**Host:** https://eos-pilot.rtbea.com.au  
**Preview:** `dpl_F8EAbDVxdMkmpkRs4QnEM7BsDSVc`  
**Production unchanged:** `dpl_EF2DKHT59waxGKL28HSvGMpgtDBG`

## Document 1 — AS/NZS 1252:1996 (`c1cc8331-8b39-4e5f-871b-b1d237e7101e`)

| Test | Result | Evidence |
|---|---|---|
| Q1 test method / nuts | PASS | DOCUMENT FACT Section 3.4; methods as given in AS/NZS 4291.2; Page 1; procedures in 4291.2 not invented |
| Q2 M20 straightness | PASS | Figure 2.3; `t = 2(0.0025 l' + 0.05)`; inference that M20 needs l' |
| Negative (wind / mast arm) | PASS | ABSTAIN, INSUFFICIENT |

## Document 2 — AS 1755-1986 conveyor PDF (`008ff87c-ede6-4007-b94d-480ef54a77e0`)

Expected answers taken from the authorised PDF (PDF page 11 / printed page 9), not from general knowledge.

| Test | Result | Evidence |
|---|---|---|
| Platform width | PASS | 4.2.1 Platforms to be provided. Permanent platforms not less than **600 mm** wide; clear access platform/floor space at least **600 mm** wide; Page 11 |
| Crossover | PASS | 7.2.2 Crossovers and underpasses (Page 27) and 4.2.3 Crossovers (Page 11) from this document |
| Negative (seismic design category / control building) | PASS | ABSTAIN, zero citations. (Wind loading exists in this standard, so wind/mast-arm is not an absent question.) |

## Register / source

- One visible AS/NZS 1252:1996 revision A row; timestamp revisions hidden.
- Conveyor source: MIME `application/pdf`, size 617088, signed GET 200.
- Ingestion: 66 pages, 630 chunks, AI searchable Yes (keyword index).

## Isolation

Asking the AS/NZS 3.4 question against the conveyor document did not return AS/NZS 4291.2. Tenant/workspace/document filters remain in SQL RPCs and unit tests.
