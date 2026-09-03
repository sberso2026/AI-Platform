# Audit

Timeline suffixes on the canonical TQ:

- `engineering.technical_query.created` — draft saved / created
- `engineering.technical_query.draft_updated` / `query_updated` — Save Draft
- `engineering.technical_query.query_image_linked` — image registered and linked
- `engineering.technical_query.submitted` — Draft submitted
- Existing assign / response / review / close events unchanged

Actor id and `occurred_at` are recorded through `EngineeringObjectFramework.recordTimeline`.

Save Draft does not emit Action By notifications. Submit does.
