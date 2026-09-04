# Security

- Preview only. Do not promote Production.
- Do not invite external users.
- API auth remains JSON 401/403. No HTML login for `/api/*`.
- Parser/native runtimes stay off generic PI intelligence lambdas.
- Error bodies do not include stacks, SQL, paths, or service-role material.
- Tenant / workspace / project isolation remains in hosted core sources and commerce project `get/list`.

```
EXTERNAL_PI_UAT_READY=false
PRODUCT_EXTERNAL_UAT_READY=false
PRODUCTION_GA_READY=false
```
