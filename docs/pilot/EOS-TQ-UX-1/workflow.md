# EOS-TQ-UX-1 Workflow

Operational statuses (vague `Pending` is not used):

Draft → Awaiting Response → Response Submitted → Under Review / Accept
Clarification Required → Awaiting Response
Accepted → Closed
Cancelled / Superseded as terminal alternatives

Legacy persist values `open` and `responded` still map for API compatibility and present as Awaiting Response / Response Submitted.

## Next action (mandatory on detail)

The detail workspace always renders Current Status, Action Required, Due, and Next Step from `describeTechnicalQueryNextAction`.

If Action By is missing, copy is explicit: nobody is assigned. Submission does not claim a notification was sent.

## Mutations

| Action | Who | Effect |
| --- | --- | --- |
| save_draft / submit | Initiator / privileged | Draft or Awaiting Response |
| save_response_draft / submit_response | Action By / privileged / unassigned write user | Response text; status Response Submitted |
| request_clarification | Initiator / reviewer / privileged | Clarification Required + comment |
| accept | Initiator / reviewer / privileged | Accepted |
| close | After accept; same reviewers | Closed + closeout metadata |
| link | Write role | Canonical object link |
| comment | Write role | Discussion |

AI draft/find-evidence links are advisory only. Close and accept are human PATCH actions.
