# Retrieval contract

Hybrid retrieval, in order:

1. Lexical (`pi_document_lexical_search`) — always available after index.
2. Semantic/vector when a governed embedding key is configured.
3. Metadata filters: tenant, workspace, optional project, optional document.
4. Current Document scope constrains hits to that authorised document.
5. Current Project scope searches authorised project documents only.

If embeddings are unavailable, Ask continues with lexical retrieval. Q&A does not fail closed solely because embeddings are missing.

Unauthorised tenant, workspace, project, or document IDs return zero document-body evidence.
