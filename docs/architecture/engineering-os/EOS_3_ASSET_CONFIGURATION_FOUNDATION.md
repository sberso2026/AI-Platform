# EOS 3 — Asset Configuration Foundation

`EOS_EXISTING_PROPOSED_CONFIGURATION_SEPARATION=PASS`  
`EOS_ASSET_CONFIGURATION_HISTORY_FOUNDATION=PASS`

## Existing vs proposed

For brownfield modifications:

| Layer | Example |
| --- | --- |
| `EXISTING_BASELINE` | Beam B23, section X |
| `PROPOSED_MODIFICATION` | Beam B23 replacement, section Y |

Installed configuration is **not** overwritten by a proposal.  
Installed updates occur only after governed as-built acceptance (`ACCEPTED_AS_BUILT`).

## Bounded history

Configuration deltas support later:

- modification traceability  
- as-built transition  
- commissioning  
- Project-to-Asset continuity  

Full configuration-management engine is out of scope for Domain 2.

Table: `eos3_asset_configuration_deltas`
