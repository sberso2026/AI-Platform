# EOS-3 Impact UI Data Contract

`EOS_IMPACT_UI_DATA_CONTRACT` / `EOS_MY_WORK_IMPACT_DATA_CONTRACT=PASS`  
`EOS_RISK_PRIORITIZED_MY_WORK_IMPLEMENTED=NO`  
`EOS_IMPACT_PROCESSING_BLOCKS_HOME_RENDER=NO`

## Contextual UI only

- Engineering Design: `Input changed` / `Calculation may need review` / `View Impact`
- Decisions: `Supporting information changed` / `Decision may require reassessment`
- Work Package Needs Attention / Changed labels from existing cards
- My Work: impact attention items available via API `view=my-work-contract` for future CONTEXT-2

## My Work attention item fields

engineer/user, Project, Work Package, Asset/System, engineering object, impact state, reason, materiality, dependency path, timestamp, deterministic next action.

## Unrelated routes

Home must not execute full impact graph processing on render.  
`EOS_IMPACT_QUERY_ON_UNRELATED_ROUTE_COUNT=0` for Home page source.
