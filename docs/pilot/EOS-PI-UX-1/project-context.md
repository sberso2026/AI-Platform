# Project context

- Selector: `pi-project-select` in the PI shell header.
- Persistence: `?projectId=` plus `localStorage` key `pi.selectedProjectId`.
- All Projects: explicit option (`__all__`), not the default.
- Authorized list: `GET /api/engineering/projects`.
- Project-scoped APIs continue to use the selected project id in the path or query. Users do not type raw project IDs on operational forms.
- New Meeting inherits the selected project and offers a named project dropdown.
