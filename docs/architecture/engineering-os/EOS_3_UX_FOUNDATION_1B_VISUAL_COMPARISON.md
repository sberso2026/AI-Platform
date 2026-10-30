# EOS-3-UX-FOUNDATION-1B — Visual comparison record

`EOS_VISUAL_ACCEPTANCE_SEMANTIC_ONLY=NO`  
`EOS_PRODUCT_OWNER_VISUAL_ACCEPTANCE=AWAITING_OWNER_REVIEW`

Screenshots: `docs/architecture/engineering-os/visual-acceptance/ux-foundation-1b/`

## Comparison method

For each page, compare against the golden functional reference principles:

- major layout geometry (Home three-zone);
- proportions (hub centre emphasis);
- colour distribution (navy shell / light canvas / gold accent);
- branch position (radial 10);
- card position (attention left, projects right);
- light/dark balance;
- navigation hierarchy;
- typography hierarchy;
- information density.

Semantic presence alone is **not** acceptance.

## Page matrix (implementation self-check)

| Page | Geometry / colour / density | Functional interaction | Blocking? | Notes for owner |
| --- | --- | --- | --- | --- |
| Home | Three-zone; light canvas; radial hub | Attention + 10 hub links + projects/activity | No | Owner must confirm visual conformity |
| My Work | Dense table; light surface | Category / search / Open | No | |
| Projects | List entry | Opens project | No | |
| Project workspace | Nav + light content | Approved IA | No | |
| Work Packages | Primary entry + cockpit | Tabs + overview | No | |
| WP detail | Header hierarchy | Canonical tabs | No | |
| Engineering Design … Reference | Capability surfaces | Routes | No | |
| Administration | Hub cards | Links | No | |
| Site & Handover | Route shell | Sparse OK | No | |

## Verdict fields for Cursor

- `REFERENCE_VISUAL_CONFORMITY`: **PENDING_OWNER** (Cursor must not PASS product-owner visual acceptance)
- `REFERENCE_FUNCTIONAL_INTERACTION`: implemented and automated where specified
- Product owner field remains `AWAITING_OWNER_REVIEW`
