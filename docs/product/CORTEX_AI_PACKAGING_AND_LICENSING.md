# Cortex AI — Packaging and Licensing

**Phase:** 7A

## Packaging units

| Unit | Sold / installed as | Notes |
|------|---------------------|-------|
| Cortex AI Platform | Tenant foundation | Always present; no domain OS required |
| Operating System | Commerce product | Independently licensed |
| Application | Child of OS product | Depends on parent OS installation |
| Feature | Entitlement under application | e.g. PI `meetings` |

## Licensing rules

- Seats and licences assign per OS / application product keys.
- Suspended OS installation denies OS routes even if seats remain assigned.
- Uninstall is logical; Platform tenant and other OS installs remain.
- Reinstall must not create a second tenant or platform instance.

## Marketplace

- Catalogue lists OS and applications with manifest validation.
- No public third-party marketplace launch required in 7A.
- Cert-only `reference-os` must not be marketed as a customer product.
