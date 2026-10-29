# EOS 2.3 structural capability matrix

This matrix describes the EOS 2.3 delivery module. `IMPLEMENTED` is not `VALIDATED`. `VALIDATED` is not `QUALIFIED`. Platform qualification is not project certification. External solver names are adapter labels, not a claim that hosted execution is certified.

| Function | Lifecycle | State | External solver | Limitation |
| --- | --- | --- | --- | --- |
| Concept options and comparison | Concept | IMPLEMENTED | No | Comparison uses recorded statements. Missing cost and capacity stay empty. |
| Feasibility workflow | Feasibility | IMPLEMENTED | No | Workflow only. |
| Preliminary member sizing | Feasibility | BOUNDED_LIMITATION | May reference an existing engine | This phase does not size members. |
| FEED workflow and FEED baseline | FEED | IMPLEMENTED | No | Baseline stores revision references. |
| Detailed delivery workflow | Detailed Engineering | IMPLEMENTED | No | Links existing D1 identities. It does not run a new check. |
| D1 calculation link | Detailed Engineering | IMPLEMENTED | No | Provenance only. |
| C3 interaction and stability | Detailed Engineering | BOUNDED_LIMITATION | No | Complete interaction surface, member stability, and National Annex are not validated. |
| C6 effective length and phiEf | Detailed Engineering | BOUNDED_LIMITATION | No | Effective length and phiEf are supplied. No biaxial second-order integration. |
| C7 class N creep and shrinkage | Detailed Engineering | QUALIFIED | No | Stated class N scope only. S and R, temperature, phiEf, National Annex, and the unbound size-time cap remain outside that scope. |
| C9 slabs and walls | Detailed Engineering | NOT_IMPLEMENTED | No | No complete two-way slab design. No complete wall, wall shear, second-order, boundary-element, or seismic-wall detailing. |
| Connection design | Detailed Engineering | NOT_IMPLEMENTED | No | Connection records are definitions only. |
| Foundation design calculation | Detailed Engineering | NOT_IMPLEMENTED | No | Foundation records are definitions and load links only. |
| SPACE GASS read-only connector | Detailed Engineering | BOUNDED_LIMITATION | Yes | Existing D1G read-only connector. Execution is not certified. |
| ETABS, SAP2000, STAAD, ANSYS, OpenSees | Detailed Engineering | NOT_IMPLEMENTED | Yes | Metadata contract only. |
| Hosted solver execution | Detailed Engineering | NOT_IMPLEMENTED | Yes | Not certified. |
| D1G solver qualification | Detailed Engineering | NOT_IMPLEMENTED | Yes | Remains a separate gate. |
| D1L project certification | Detailed Engineering | NOT_IMPLEMENTED | No | Remains a separate gate. |

IFC readiness is false while any readiness gap or missing authorized approval remains. Completing fields does not issue a deliverable for construction.
