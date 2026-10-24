# EOS-TQ-UX-1R2: Directory Fixture Hygiene

## Problem

The TQ assignee directory (`/api/engineering/technical-queries/directory`) was returning all
workspace members including certification and service fixture accounts. These appeared as
email-local-part names (e.g. `eos.pilot.launch1.admin.1788193387962`) in the Action By selector,
which is unprofessional and confusing for the founder.

## Fix

`EngineeringTechnicalQueryService.listDirectory` now filters the workspace member list:

```typescript
return people.filter((person) => {
  const name = person.name ?? "";
  if (!name || name === "Unknown person") return false;
  // Email-style resolved name indicates no full_name — fixture/service account.
  if (name.includes("@")) return false;
  return true;
});
```

Since `displayPersonName` now returns the full email when `full_name` is missing or is a
local-part, fixture accounts with no proper name will resolve to an email address and be
filtered out.

This approach:
- Does **not** delete fixture accounts from the database
- Does **not** hardcode individual fixture usernames
- Uses the canonical name resolver as the eligibility signal
- Applies uniformly to all workspace member types

## Evidence

| Metric | Before | After |
|--------|--------|-------|
| `NORMAL_DIRECTORY_FIXTURE_VISIBLE_COUNT` | ≥1 | ✅ 0 |
| `TQ_ASSIGNABLE_DIRECTORY_PASS` | false | ✅ true |

The remaining assignable users are those with a proper `full_name` in their profile (title-case,
with space, no email pattern).
