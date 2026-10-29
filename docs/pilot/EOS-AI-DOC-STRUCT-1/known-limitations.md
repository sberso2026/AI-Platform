# Limitations

- Offline holdout numerical extraction remains below the 0.98 gate and is worse than EOS-AI-DOC-QA-1 on mixed paraphrases of the frozen holdout.
- Combined recall@5 0.926 < 0.97.
- Query-form and paraphrase robustness remain below 0.95.
- Existing Preview documents are structure-completed at query time; chunk metadata is populated on future ingest only.
- Shared intelligence modules are not certified by this ticket.
