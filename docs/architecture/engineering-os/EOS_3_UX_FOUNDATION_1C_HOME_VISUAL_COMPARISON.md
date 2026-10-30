# EOS-3-UX-FOUNDATION-1C — Home Visual Comparison

`EOS_VISUAL_ACCEPTANCE_SEMANTIC_ONLY=NO`  
`EOS_PRODUCT_OWNER_VISUAL_ACCEPTANCE=AWAITING_OWNER_REVIEW`  
`EOS_HOME_VISUAL_EVIDENCE_FRESH=YES`  
`EOS_HOME_VISUAL_EVIDENCE_REUSED_FROM_UX1A=NO`  
`EOS_HOME_VISUAL_EVIDENCE_REUSED_FROM_UX1B_PREVIOUS_BUILD=NO`

## Evidence

Fresh Home screenshot after UX-1C deploy:

`docs/architecture/engineering-os/visual-acceptance/ux-foundation-1c/01-home.webp`

Fixed acceptance viewport target: **1536 × 1024**.

## Geometry checklist (implementation self-check)

| Criterion | Result | Notes |
| --- | --- | --- |
| Three-zone desktop layout | PASS (self) | Attention \| Hub \| Projects/Activity |
| Hub visual dominance | PASS (self) | Industrial centre + radial branches |
| Dark shell + light workspace | PASS (self) | Navy nav / light canvas |
| Industrial plant image | PASS (self) | `/eos/engineering-hub-plant.webp` |
| Branch DOM cards + icons + descriptions | PASS (self) | Not image-map labels |
| Gold connectors presentational | PASS (self) | SVG lines/nodes |
| Single pilot banner | PASS (self) | Compact + Details |
| Major layout deviation count | 0 (self) | Pending owner confirmation |

Cursor must not PASS product-owner visual acceptance. Owner inspects live pilot Home.
