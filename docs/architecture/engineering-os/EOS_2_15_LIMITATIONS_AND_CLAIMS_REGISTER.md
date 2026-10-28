# EOS 2.15 Limitations and Claims Register

## Permitted claims

- EOS 2.0 has an implemented engineering-delivery workflow across Concept, Feasibility, FEED, and Detailed Engineering for eight disciplines.
- The workflow governs design basis, requirements, interfaces, change-impact candidates, freezes, deliverables, and baselines.
- Qualified structural calculation scope is limited to the existing D1 baseline.
- AI explains evidence and does not approve engineering.
- Production remains the EOS 1.0 controlled pilot.

## Claims requiring qualification language

- Any statement that EOS 2.0 is qualified must say the qualification is bounded, must name the excluded calculations, and must not be made until the hosted signed-in staging browser evidence is complete.
- Interface acceptance, freeze, IFC issue, and change closure require a named human authority.
- Imported solver results are provenance records, not EOS calculations.

## Unsupported claims

- EOS performs all engineering calculations.
- EOS replaces HYSYS, CAESAR II, or ETAP.
- EOS automatically certifies designs.
- EOS autonomously approves engineering.
- EOS guarantees regulatory compliance.
- EOS provides certified SIL calculations.
- EOS provides qualified geotechnical numerical analysis.
- EOS provides full enterprise document management.
- EOS provides complete construction management.
- EOS holds SOC 2, ISO, or other certification that has not been issued.
- A synthetic fixture or an AI explanation is engineering verification.

## External-tool dependent capabilities

Process simulation, piping stress, structural analysis outside D1, civil design surfaces, geotechnical numerical analysis, electrical system studies, and instrument or control configuration remain dependent on external tools. Current adapters are metadata or import only and are not certified.

## Human-authority dependent capabilities

Option selection, interface acceptance, materiality, revalidation, freeze approval, deliverable approval, IFC release, and change closure require a human role. Owner, admin, pilot-engineer, and AI are not those authorities.

## Unimplemented deterministic calculations

Process thermodynamics, hydraulics, relief, and valve sizing. Mechanical vessel, pump, fatigue, nozzle, and rotordynamic calculations. Piping sizing and stress. Civil grading, drainage, pavement, and flood calculations. Geotechnical bearing, settlement, pile, slope, liquefaction, and excavation calculations. Electrical load flow, short circuit, protection, cable sizing, arc flash, earthing, and UPS calculations. I&C SIL, instrument sizing, control tuning, and logic generation.

## Synthetic fixture statement

Synthetic fixtures validate workflow behavior and provenance handling. They do not qualify engineering calculation correctness unless independently benchmarked against authoritative reference results.
