# Inspection Intelligence — Offline Threat Model

## Trust boundaries

Client timestamps, browser online state, and local entitlement caches are **untrusted**.
Server validates hashes, authorization, and workflow transitions.

## Controls

- Encrypted local store (AES-GCM wrapped keys)
- Idempotent command/evidence queues
- RLS + tenant/workspace binding on server mirrors
- Entitlement snapshot TTL + revoke-on-reconnect
- Immediate local purge on logout/account switch
- Best-effort remote purge on reconnect

## Residual risks

Permanently offline devices cannot be remotely wiped. Stolen-device risk until reconnect
or local logout. No plaintext tokens/keys in telemetry.
