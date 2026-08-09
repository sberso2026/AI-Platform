# RTB AI Security and Trust Baseline

Status: Phase 14C · `AiSecurityTrustAssessed = true`  
`implementsOwnAiStack = false`

## Architecture preserved

Engineering Reasoning Assistant → Platform AI Runtime → Capability / Tool / Search /
Module public contracts. No second AI stack.

## Assessed controls

| Control | Status |
| --- | --- |
| Approved provider policy patterns | implemented_bounded |
| Model/version pinning | implemented_bounded (where registries exist) |
| Training-use restrictions | implemented_bounded (policy docs; provider-dependent) |
| Fail-closed provider policy | implemented_bounded |
| Human review / no auto engineering approval | implemented |
| Tool authorization | implemented_bounded |
| Evidence grounding / citations | implemented_bounded |
| Chain-of-thought non-exposure | implemented_bounded (policy) |
| Prompt injection defenses | implemented_bounded / incomplete |
| Classification-aware AI deny | missing (taxonomy new in 14C) |
| AI incident handling | manual / module IR |

## Semantics

- AI output ≠ engineering approval
- AI recommendation ≠ execution permission
- AI explanation ≠ hidden chain-of-thought exposure
