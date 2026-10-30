# Work Package Maturity and Transitions

WP maturity follows assigned Engineering Pattern native stages.

Supports:
- `PATTERN_NATIVE_STAGE`
- `NORMALIZED_MATURITY_BAND`
- authorized forward/backward transitions with provenance
- readiness evaluation without auto-approval
- override governance when advancing without full readiness

Default: EOS recommends "Ready for next stage"; human confirms gated transitions.  
Impact reduces readiness; does not silently rewrite stage.
