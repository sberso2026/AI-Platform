# EOS-TQ-UX-1R2: Notification Root Cause & Fix

## Root Cause

`TQ_NOTIFICATION_ROOT_CAUSE`:

Two separate issues caused all TQ lifecycle notifications (except `close`) to silently fail:

### Issue 1: RLS Blocking Cross-User Notification Inserts

The `NotificationService` was initialized with the **session Supabase client** (the authenticated
user's cookie session). Supabase Row-Level Security on the `notifications` table blocked inserts
where `user_id` ≠ the current session user.

This meant:
- `notifyAssigned` → inserts notification for `actionBy` (different user) → **RLS blocked** → `.catch()` suppressed
- `notifyReview` → inserts notification for `requester_id` (founder = same user) → **succeeded** when actor = requester, but also blocked when they differ

Only `notifyWatchers` (called on `close`) succeeded for the session user (founder was in the watchers set).

**Fix:** Pass a service-role Supabase client to `NotificationService` in `createPlatformKernel`. The
service client bypasses RLS, allowing any-user notification creation from trusted server-side code.

```
// packages/platform-kernel/src/kernel.ts
export function createPlatformKernel(supabase, notificationClient?) {
  const notifications = new NotificationService(notificationClient ?? supabase, eventBus);
```

```
// apps/web/src/lib/kernel.ts
const serviceClient = createServiceClient();
const kernel = createPlatformKernel(supabase, serviceClient);
```

### Issue 2: `notifyAccept` Did Not Exist

The `accept` action had no notification. Added `notifyAccept` private method that notifies the
responder/Action By when their response is accepted.

### Issue 3: Notification Content

All notifications now include human-readable titles:
- `Technical Query TQ-015 assigned to you`
- `Technical Query TQ-015 response submitted for review`
- `TQ-015: Clarification requested — please resubmit your response`
- `Technical Query TQ-015 response accepted`
- `Technical Query TQ-015 closed`

No UUIDs, no raw event names, no internal identifiers.

## Live Evidence (TQ-015)

8 notifications persisted:

1. `Technical Query TQ-015 assigned to you` → assignee
2. `Technical Query TQ-015 assigned to you` → assignee (duplicate from reopen)
3. `Technical Query TQ-015 response submitted for review` → initiator/reviewer
4. `TQ-015: Clarification requested — please resubmit your response` → assignee
5. `Technical Query TQ-015 response submitted for review` → initiator/reviewer (resubmit)
6. `Technical Query TQ-015 response accepted` → assignee
7. `Technical Query TQ-015 closed` → founder
8. `Technical Query TQ-015 closed` → assignee

All notifications link to `/engineering/technical-queries/<tqId>` — correct tenant context,
no cross-context leakage.

## Pass/Fail

| Event | Pass |
|-------|------|
| TQ_ASSIGN_NOTIFICATION_PASS | ✅ |
| TQ_RESPONSE_NOTIFICATION_PASS | ✅ |
| TQ_CLARIFICATION_NOTIFICATION_PASS | ✅ |
| TQ_ACCEPT_NOTIFICATION_PASS | ✅ |
| TQ_CLOSE_NOTIFICATION_PASS | ✅ |
| TQ_NOTIFICATION_EVENT_COUNT | 8 |
| TQ_NOTIFICATION_LIVE_PASS | ✅ true |
| TQ_NOTIFICATION_CONTENT_PASS | ✅ |
| TQ_NOTIFICATION_NAV_PASS | ✅ |
| TQ_NOTIFICATION_ISOLATION_PASS | ✅ |
