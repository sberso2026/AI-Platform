# EOS 3.6 Connector Contract and Security

`EOS_3_INTEGRATION_FRAMEWORK_IMPLEMENTED=YES`

`EOS_3_CONNECTOR_CATEGORY_MODEL_IMPLEMENTED=YES`

`EOS_3_CONNECTOR_IDENTITY_MODEL_IMPLEMENTED=YES`

`EOS_3_CONNECTOR_CAPABILITY_MODEL_IMPLEMENTED=YES`

`EOS_3_CONNECTOR_AUTHORIZATION=PASS`

`EOS_3_CONNECTOR_SECRET_ISOLATION=PASS`

`EOS_3_CONNECTOR_SECRET_SCAN=PASS`

`EOS_3_CONNECTOR_SECRET_LOGGING_PROTECTION=PASS`

`EOS_3_CONNECTOR_HEALTH_MODEL_IMPLEMENTED=YES`

`EOS_3_CONNECTOR_ENABLEMENT_CONTROL=PASS`

`EOS_3_ENTERPRISE_CONNECTOR_CONTRACT_IMPLEMENTED=YES`

## Categories

document repository, engineering analysis tool, deterministic solver, CAD/BIM/plant design, project controls, asset system, inspection system, historian/data source, identity system, AI/model provider.

## Security rules

- Tenant/workspace/project/product/capability scoped authorization
- Secrets in isolated vault references (`vault://…`); not in ordinary engineering object tables; SELECT policy deny on secret ref table
- Log redaction for token/password/credential fields
- Configuration ≠ enabled execution; AI cannot enable connectors or authorize credentials
- Health `AVAILABLE` does not promote qualification
