# EOS 2.14 Multidisciplinary Integrated Project Demonstration

EOS-IPF-001, the EOS Integrated Process Facility Demonstration, is one synthetic gas conditioning facility. It uses the existing EOS 2.1 lifecycle, EOS 2.2 basis, the eight discipline delivery registers, EOS 2.11 interfaces, EOS 2.12 change impact, and EOS 2.13 freeze and deliverable governance. It does not add a discipline calculation engine and it does not change qualified D1 formulas.

The governed path is Concept, Feasibility, FEED, and Detailed Engineering. Stage skipping is rejected. Concept freeze, feasibility selection, FEED baseline, detailed design freeze, and IFC baseline each keep an exact fingerprint. The detailed freeze is `NOT_READY` while one member is stale, then `READY` after a human structural resolution. IFC release is blocked while the electrical deliverable review is incomplete. A later process temperature revision leaves the original IFC baseline unchanged and issues a new piping revision under a new baseline.

The P-101 vendor record moves operating mass from 12,000 kg to 14,000 kg and records motor power moving from 75 kW to 110 kW. Explicit dependency edges reach structural, geotechnical, electrical, and I&C records. No piping edge is created from the mass change. The structural fixture becomes potentially stale. Recalculation stays false. One geotechnical candidate is disposed as no material impact.

Every fixture is labelled `SYNTHETIC_VALIDATION_FIXTURE`. AI may summarize evidence. AI cannot accept an interface, approve a change, finalize materiality, approve a freeze, approve a deliverable, or release IFC. An unrelated workspace is denied. The scale sample is 105 interfaces, 27 changes, 57 deliverables, and 250 dependency edges. That sample is not an enterprise performance qualification.

No schema change was required. No staging or production row was written. Production remains on the EOS 1.0 pilot and is not redeployed. EOS 2.15 is not started.
