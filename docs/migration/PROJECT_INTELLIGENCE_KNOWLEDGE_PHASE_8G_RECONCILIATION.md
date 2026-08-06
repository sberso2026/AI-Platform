# Project Intelligence — Knowledge Graph Phase 8G Reconciliation

**Platform:** RTB AI Platform  
**Phase:** 8G — Engineering Knowledge Graph and Unified Intelligence Search  
**Baselines:** 8E `61b5d1c…`, Executive Dashboard `1e6e0fe…`

## Intent

Build a unified engineering knowledge layer that **indexes relationships and search
references** across Document, Meeting, Findings, Reporting Intelligence and
Engineering Core. **Do not duplicate ownership** of business records.

## Classification

| Component | Class | Notes |
|-----------|-------|-------|
| Platform `knowledge_nodes` / `knowledge_edges` | Preserve | Platform KG foundation |
| `engineering_object_links` | Preserve | Core cross-register links |
| Document hybrid retrieval | Preserve | Vector + lexical for documents |
| Engineering search service | Rebind | Lexical Core fan-out consumed by unified search |
| PI knowledge feature | Consolidate | New `knowledge_intelligence` feature |
| PI knowledge edge refs | Consolidate | Refs/snippets only — no register clones |
| Feature-specific AI runtime | Forbidden | Platform AI Runtime only |

## Production readiness

`productionKnowledgeIntelligenceReady=true` means unified search and graph
traversal are operational with citations and entitlement isolation. It does not
imply enterprise-scale graph coverage beyond fixture/hosted baselines.
