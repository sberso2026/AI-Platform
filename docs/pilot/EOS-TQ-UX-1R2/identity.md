# EOS-TQ-UX-1R2: Human Display Name Resolution

## Problem

The Supabase `profiles` table had `full_name = "silvestre.berso"` — the email local-part — for the
founder account. The `displayPersonName` resolver accepted this as a valid name, rendering
`"silvestre.berso"` on all TQ screens instead of `"Silvestre Berso"`.

## Root Cause Chain

1. Supabase auth user created with `full_name` in `user_metadata`, but the `profiles` table was
   populated via a trigger that copied `full_name` from metadata — and the metadata had
   `"silvestre.berso"` (local-part) not the correct title-case name.
2. `displayPersonName` checked `!isRawUuid(name)` but did not detect email-local-part strings.

## Fixes Applied

### 1. DB Profile Patch

Set `profiles.full_name = "Silvestre Berso"` via service API for the affected account.

### 2. Resolver Guard (`displayPersonName`)

Added `isEmailLocalPart(value)` check that detects strings matching `^[a-z0-9][a-z0-9._-]+$` with
no spaces (i.e., no title-case proper name). If `full_name` matches this pattern, it is treated as
a bad value and the resolver falls back to the full email address.

```typescript
function isEmailLocalPart(value: string): boolean {
  return /^[a-z0-9][a-z0-9._-]+$/.test(value) && !value.includes(" ");
}

export function displayPersonName(input) {
  const name = input.fullName?.trim();
  if (name && !isRawUuid(name) && !isEmailLocalPart(name)) return name;
  const email = input.email?.trim();
  if (email && email.includes("@")) return email; // full email, never local-part
  ...
}
```

This fix applies broadly across all Engineering OS workflows (Actions, Risks, Decisions, Audit,
Documents, Users & Permissions) — anywhere `displayPersonName` is called.

### 3. Current-User API Endpoint

Added `/api/platform/current-user` returning:
```json
{ "id": "...", "full_name": "Silvestre Berso", "email": "...", "company": "RTB Engineering & Analytics" }
```

This provides the new TQ form with the actual resolved identity rather than the fallback
`"Authenticated user"` string.

## Results

| Check | Before | After |
|-------|--------|-------|
| Founder name on TQ screens | `silvestre.berso` | `Silvestre Berso` |
| New form initiator label | `"Authenticated user"` | `Silvestre Berso` |
| Pre-submit summary initiator | `"Authenticated user"` | `Silvestre Berso` |
| `HUMAN_DISPLAY_NAME_RESOLVER_PASS` | false | ✅ true |
| `TQ_INITIATOR_DISPLAY_PASS` | false | ✅ true |
