# Asset / Equipment hybrid input

The closed Asset / Equipment `<select>` is replaced by autocomplete + free text.

## Rules

- Manual text is allowed without an Asset Register row.
- Canonical suggestions come from workspace-authorized `/api/engineering/assets` (`q` search or current `projectId`).
- Current-project assets are sorted first.
- Clear resets both values.
- Canonical select: `asset_id=<id>`, `asset_equipment_text=<human label>`.
- Manual entry: `asset_id=null`, `asset_equipment_text=<typed text>`.
- The service does **not** create Asset Register records from this field.

Presentation prefers `metadata.asset_equipment_text` over the register name so free-text values such as `Bund Floor` remain visible.
