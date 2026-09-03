# UAT evidence

**Host:** https://eos-pilot.rtbea.com.au  
**Preview deployment:** `dpl_4raH2RyQ3hNWwUyuraAmrmgrxp3h`  
**Production:** `dpl_EF2DKHT59waxGKL28HSvGMpgtDBG` (unchanged)

Authorised fixture: `fixtures/asnzs-1252-1996-excerpt.txt` (canonical Documents signed upload).

| Test | Result | Notes |
|---|---|---|
| 1 | PASS | DOCUMENT FACT: Section 3.4 requires methods in accordance with AS/NZS 4291.2. Citation includes clause + page. Procedures in 4291.2 were not invented. |
| 2 | PASS | Retrieved Figure 2.3, stated `t = 2(0.0025 l' + 0.05)`, inferred that a numeric M20 value cannot be derived without l'. Clickable figure/page citation. |
| 3 | PASS | Wind-load question abstained. Zero document-body evidence. |
| 4 | PASS | Unknown document id returned zero document-body evidence. |

Document UI (live): Source file attached; Indexing: Partly indexed (keyword index); AI searchable: Yes; Pages indexed: 1; Ask this document and Summarise document visible.

Unit coverage: `@rtb/engineering-os` document Q&A tests; `@rtb/project-intelligence` isolation, CRLF chunking, PDF native text, and table/figure provenance tests.
