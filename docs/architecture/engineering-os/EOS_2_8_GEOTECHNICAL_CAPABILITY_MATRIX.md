# EOS 2.8 geotechnical capability matrix

`IMPLEMENTED` is not `VALIDATED`. `VALIDATED` is not `QUALIFIED`. An imported PLAXIS, GeoStudio, or other solver result is not an EOS-qualified calculation. A measured test is not a design parameter.

| Function | Lifecycle | State | External tool | Limitation |
| --- | --- | --- | --- | --- |
| Concept foundation options | Concept | IMPLEMENTED | No | Soil properties are not invented. |
| Option comparison | Concept | IMPLEMENTED | No | Cost and schedule stay empty unless supplied. |
| Investigation campaign | Feasibility | IMPLEMENTED | No | Datum and coordinate system are recorded. |
| Boreholes, CPT, and test pits | Feasibility | IMPLEMENTED | No | Missing logs are not invented. Raw CPT stays separate. |
| Field and laboratory tests | Feasibility | IMPLEMENTED | No | A result needs a unit. Conditions are not inferred. |
| Groundwater observations | Feasibility | IMPLEMENTED | No | One observation is not a design level. |
| Stratigraphy and geotechnical units | Feasibility | IMPLEMENTED | No | A unit is not automatically a geological formation. |
| Ground model | Feasibility | IMPLEMENTED | Yes | Revision keeps the previous boundary. |
| Parameter governance | Feasibility | IMPLEMENTED | No | Classes are not promoted silently. A value needs a unit. |
| Bearing calculation | Detailed Engineering | NOT_IMPLEMENTED | Yes | A fixture may be stored. Capacity is not calculated. |
| Settlement calculation | Detailed Engineering | NOT_IMPLEMENTED | Yes | A fixture may be stored. Settlement is not calculated. |
| Pile parameter records | FEED | IMPLEMENTED | No | Structural pile capacity is not calculated. |
| Pile assessment | Detailed Engineering | NOT_IMPLEMENTED | Yes | Provenance only. |
| Liquefaction record | FEED | IMPLEMENTED | Yes | Adequacy is not claimed. |
| Slope record | FEED | IMPLEMENTED | Yes | Factor of safety is not calculated. |
| Excavation record | FEED | IMPLEMENTED | No | Stability is not certified. |
| Retaining inputs | FEED | IMPLEMENTED | No | Structural wall design stays with Structural. |
| Ground improvement | FEED | IMPLEMENTED | No | Suitability is not implied. |
| Dewatering | FEED | IMPLEMENTED | Yes | Pumping rate is not calculated. |
| Earthworks suitability | FEED | IMPLEMENTED | No | Classification record for Civil. |
| Civil and Structural handoffs | FEED | IMPLEMENTED | No | Values need units. Structural capacity is not claimed. |
| PLAXIS | Detailed Engineering | EXTERNAL_TOOL_DEPENDENT | Yes | Metadata only. Not certified. |
| GeoStudio | Detailed Engineering | EXTERNAL_TOOL_DEPENDENT | Yes | Metadata only. Not certified. |
| Hosted geotechnical calculation | Detailed Engineering | NOT_IMPLEMENTED | Yes | Not certified. |
| Geotechnical AI context | All | IMPLEMENTED | No | Labels evidence and required human decisions. Cannot approve parameters. |

IFC readiness is false while a readiness gap, a stale ground model or parameter, an unresolved interface, missing design groundwater, or a missing authorized approval remains.

Bounded limitations that stay in force: no bearing calculation, no settlement calculation, no pile-capacity calculation, no slope factor of safety, no liquefaction adequacy claim, no excavation-stability certification, no pumping-rate calculation, no silent parameter promotion, no invented soil property, no structural foundation design, no certified external solver, and no automatic enrollment of existing geotechnical projects.
