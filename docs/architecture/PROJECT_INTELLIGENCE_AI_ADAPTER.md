# Project Intelligence AI Adapter

**Adapter:** `ProjectIntelligenceAIAdapter`  
**Target runtime:** Platform AI Director  
**Phase 6B proof:** non-destructive project state summary

---

## Responsibilities

- Model routing via Director  
- Prompt registry version recording  
- Tool registry (no ungoverned tools)  
- Policy enforcement  
- Usage metering / cost metadata hooks  
- Trace IDs  
- Citations / source references  
- Confidence and human-review state  
- Abstain when evidence is insufficient  

---

## Phase 6B proof (only)

Summarize mapped project state from Engineering Core **read** adapters:

- Include citations or source references  
- Do **not** create or update Core records  
- Record model, prompt version, and trace ID  
- Abstain when evidence is insufficient  

Legacy Thor / OpenAI paths remain in the frozen standalone baseline until equivalence is proven. New Phase 6B platform code must not call OpenAI directly.

---

## Equivalence

Preserve the standalone AI Vitest corpus (`project-intelligence-integration-baseline-1`) for future equivalence validation in Phase 6C+.
