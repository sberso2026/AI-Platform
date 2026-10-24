# Limitations

- Offline numerical extractor correctness is below the 0.98 gate on mixed-property paraphrases and the blind holdout split.
- Semantic retrieval can contribute scores but is not certified as improving rank-1 for this ticket (`HYBRID_RETRIEVAL_PASS=false` unless a later live measure shows otherwise).
- Claim verification is applied on the document Ask path; other intelligence modules are not automatically certified.
- Adjacent subclauses in the same page window can still appear if both classify as SUPPORTING.
- Founder visual UX certification remains outstanding (`ENTERPRISE_UX_CERTIFIED=false`).
