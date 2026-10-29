# EOS 3.3 Retrieval Security and Isolation

`EOS_3_RETRIEVAL_RLS=PASS`

`EOS_3_STAGING_CROSS_WORKSPACE_RETRIEVAL_LEAK_COUNT=0`

`EOS_3_AI_RETRIEVAL_CROSS_WORKSPACE_LEAK_COUNT=0`

`EOS_3_RETRIEVAL_AUTHORIZATION=PASS`

`EOS_3_RETRIEVAL_SOURCE_OWNERSHIP=PASS`

`EOS_3_RETRIEVAL_SECURITY_BOUNDARY=PASS`

`EOS_3_RETRIEVED_CONTENT_INSTRUCTION_ISOLATION=PASS`

`EOS_3_RETRIEVAL_DATA_EXFILTRATION_TEST=PASS`

`EOS_3_SENSITIVE_DATA_INDEXING_POLICY=PASS`

## Authorization

Caller must be authenticated, EOS 3 entitled + enrolled, non-Production, matching tenant/workspace. Embedding presence alone never grants access.

## Fail-closed probes

- foreign workspace object/vector query → ACCESS_RESTRICTED
- natural-language tenant/workspace override → ignored; caller scope retained
- secret/credential query patterns → blocked
- document “Ignore previous instructions” → isolated as data

## Schema RLS

`eos3_knowledge_sources`, `eos3_knowledge_chunks`, `eos3_knowledge_audit` enforce tenant/workspace membership policies on staging.

## Module

`eos3-retrieval-security.ts`
