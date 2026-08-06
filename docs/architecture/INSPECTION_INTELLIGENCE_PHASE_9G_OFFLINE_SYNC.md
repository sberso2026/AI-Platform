# Inspection Intelligence — Phase 9G Offline Synchronization

**Version:** `0.7.0-offline-sync`

## Hierarchy

RTB AI Platform → Engineering OS → Engineering Mobile SDK (Offline) → Inspection Intelligence → Packs → Offline Sync

## Delivered

1. **Durable local store** — schema versions + migrations (`DurableOfflineStore`, crash snapshot/recover)
2. **Web Crypto** — AES-GCM key create/wrap metadata, rotate, logout/lock purge; no plaintext keys in events
3. **Offline packages** — manifest, version, checksum verify, expiry, dependencies, delta apply, revocation
4. **Command queue** — stable operation IDs, dependsOn ordering, retry + jitter backoff, idempotency keys, terminal FSM
5. **Evidence queue** — content hashes, resumable offsets, original preservation, server confirmation; draft state machine
6. **Sync coordinator** — background / foreground opportunistic / manual; pause / resume / cancel; crash recovery
7. **Connectivity** — `browser_online_unverified` vs `online_verified` (server reachability)
8. **Conflict engine** — per-entity `GOVERNED_CONFLICT_POLICIES`; append-only / versioned / server-authoritative / safe merge / tombstone; **no LWW**
9. **Multi-device reconciliation** — server versions, client base versions, cursors, causality tokens
10. **Entitlement snapshots** — tenant/workspace/user/capability scoped, integrity-protected, TTL, revoke-on-reconnect
11. **Purge** — immediate local logout/account-switch; best-effort remote on reconnect
12. **Storage** — quota/pressure, persistent-storage request where supported, protect unsynced evidence
13. **Pack-aware mobile reports** — generic + coatings; `mobileReady` after certification; offline origin + sync status
14. **Sync UI** — `/engineering/apps/inspection-intelligence/sync`
15. **Events** — `engineering.mobile.sync.*` without sensitive payloads
16. **Service worker lifecycle** — version compatibility, preserve queued work, safe cache invalidation

## Conflict policy matrix

| Entity | Policy |
|--------|--------|
| Original evidence / attestations | append_only |
| Annotations / report derivatives | versioned |
| Workflow transitions / assignments / sessions | server_authoritative |
| Observation field edits | safe_field_merge |
| Deletions | tombstone |

## Browser / PWA limitations

- Cannot guarantee wipe of a permanently offline device
- Background sync depends on browser support; **manual sync is always available**
- Client timestamps, connectivity, and entitlement caches are **untrusted** — server verifies
- Physical-device results are separate from Playwright emulation (see device evidence doc)
