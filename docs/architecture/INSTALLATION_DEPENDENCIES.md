# Installation Dependencies

Dependencies are defined in `commercial_installation_dependencies`.

## Required dependencies

- Project Intelligence requires active Engineering OS installation
- Minimum version constraints are enforced by `InstallationDependencyResolver`

## Uninstall protection

Product uninstall is blocked when active dependent application installations exist unless force override by platform staff (audited).

## API errors

Missing dependencies return HTTP 409 with `dependency_missing` or `parent_os_not_installed`.
