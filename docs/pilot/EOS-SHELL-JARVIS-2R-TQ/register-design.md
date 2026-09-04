# EOS-SHELL-JARVIS-2R-TQ register design

Command-interface composition, not a theme paint.

## Header

TECHNICAL QUERY REGISTER  
Controlled engineering query and RFI workflow  
Primary action: New Technical Query (existing POST create)

## Signal strip

OPEN · AWAITING RESPONSE · OVERDUE · HIGH PRIORITY · MY ACTIONS  

Authoritative counts from loaded rows. Load failure shows `Unavailable`, never a fake zero.

## Matrix

Compact table aligned to Engineering Systems Matrix / command panels:

TQ No. · Title / Query · Project · Discipline · Status · Initiator · Action By · Due · Age · Priority · Last Activity

Row click opens detail. Owned drafts surface Draft, Edit Draft, and Submit Technical Query as navigation to the existing record. No `applyAction` / PATCH was added (workflow freeze).

## Filters

Operational views: All, My Actions, Awaiting Response, Overdue, Closed.  
Integrated search plus project, discipline, status, initiator, action by, priority, and sort. Active filters are visible and clearable.

## Detail

Command header answers what / who / status / required / due / next. Tabs: Overview, Discussion, Evidence, Related, History. Query panel renders sanitized rich content. Suggested Solution, Response, Basis, and Closeout stay in separate panels.
