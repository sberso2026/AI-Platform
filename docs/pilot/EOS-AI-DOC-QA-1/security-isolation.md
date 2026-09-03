# Security / isolation

Document retrieval remains tenant/workspace/document scoped. Isolation tests in `document-scope-isolation.test.ts` still pass. No cross-document leak path was added. Current Document Ask still requires `objectId` + `scope: document`.
