# Workflow acceptance matrix

| Workflow | Pass | Evidence (2026-09-02 founder session) |
|---|---|---|
| Create project | Pass | `UAT2-245013` id `b35e0b5e-e404-4d4f-8926-0992f55b1696` HTTP 201 |
| Open project | Pass with M1 | Route 200; shell then client load |
| Edit project metadata | Fail (H1) | PATCH 403 on live |
| Switch project context | Pass | Header selector selected the new id |
| Return to project list | Pass | `/engineering/projects` |
| Create/edit risk | Pass | create 201, PATCH 200, project id matches |
| Create/edit TQ | Pass | create 201, respond 200 |
| Create decision | Pass | 201 |
| Create action | Pass | 201; Actions UI exists |
| Create/open asset | Pass | 201, linked to project, detail URL opened |
| Register/upload/retrieve document | Pass | register 201, file 200, GET 200 |
| Timeline/activity | Pass | GET `/api/engineering/timeline` 200, 8 events |
| Engineering AI | Pass with M2 | 201, grounded, no Worley/Yahoo leak |
| Reports | Pass | Reports page opened with project query |
| `/users` directory | Pass with M3 | members API 200, n=16, founder present |
| Fixture visibility | Pass | WSB-1RC not in list; Gold Coast + UAT-347102 listed |
