# EOS 3 — Asset/System UI Data Contract

`EOS_APPROVED_ASSET_SYSTEM_UI_DATA_CONTRACT=PASS`  
`EOS_ASSET_SYSTEM_ENGINEERING_LANGUAGE=PASS`  
`EOS_ASSET_CONTEXT_SELECTOR_FOUNDATION=PASS`

## Engineer-facing labels

Use: Assets & Systems, Plant, Area, System, Equipment, Structure, Component.  
Avoid: ontology, node class, graph entity, resource type, context resolver.

## Work Package cockpit context strip (foundation)

```
Project: …
Work Package: …
Facility: …
Area: …
System: …
Primary Asset: …
Related Assets: …
```

API: `GET .../assets-systems?view=ui-contract&workPackageId=WP-STR-004`

## Selector foundation

`view=selector|search` supports:

- search by name / tag / stable ID  
- contextual suggestions  
- recent/relevant assets  

Users are not required to walk the full hierarchy each time.
