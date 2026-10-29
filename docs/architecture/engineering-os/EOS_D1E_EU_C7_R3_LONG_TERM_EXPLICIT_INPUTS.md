# EOS-D1E-EU-C7-R3 explicit long-term inputs

This phase records an explicit creep coefficient and an explicit shrinkage strain on the existing serviceability profile. It does not calculate either value from humidity, cement, age, temperature, or member size.

Creep is a dimensionless number supplied with provenance and a declared time context. Zero is valid only when the caller supplies zero. Shrinkage is stored as a non-negative magnitude. A microstrain input is divided by the SI scale of one million microstrain per unit strain. A negative magnitude, or a shortening-negative sign label, is rejected so every consumer reads the same sign.

The concrete identity is the existing material reference. The time identity is an explicit reference label. Ages are recorded only when the source supplies them. The state may contain creep only, shrinkage only, or both.

The creep coefficient is not the effective creep ratio used by the nominal-curvature method. A caller may copy the explicit value across, and that copy is marked as a copy. No transformation is implemented, and a stored effective-creep input is left unchanged. Crack width is not recalculated. A future deflection method can read the normalized values. This phase does not compute deflection.

Expected strain values in the tests are the supplied number, or that number divided by the SI microstrain scale. They are not taken from the runtime object. Engineer validation and formal conformance remain pending. Calculated creep, calculated shrinkage, the effective-creep transformation, and deflection remain later work. Deflection still has to resolve its unbound span-to-depth expression before a method can be implemented.
