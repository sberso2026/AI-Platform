# Inspection Intelligence — Mobile Performance Baseline

Baselines use browser device emulation unless otherwise noted. Do not claim native-device
performance from emulation alone.

| Journey | Device profile | Network | Fixture | p50 target | p95 target | Notes |
|---------|----------------|---------|---------|------------|------------|-------|
| Mobile shell load | Desktop Chrome / Pixel 5 | cable | empty session | < 2.5s | < 5s | Emulated |
| Assignment queue | tablet 768×1024 | cable | 20 assignments | < 1.5s | < 3s | Emulated |
| Camera initialization | phone 390×844 | cable | permission granted | < 1s | < 2.5s | Capability contract |
| Evidence staging+hash | phone | cable | 2 MB JPEG | < 800ms | < 2s | In-process hash |
| Annotation save | tablet | cable | 5 shapes | < 500ms | < 1.5s | Derivative only |
| Scan resolution | phone | cable | valid QR | < 300ms | < 1s | Shared-domain lookup stub |
| Attestation | phone | cable | submit | < 400ms | < 1.2s | Workflow SDK |

Retry: upload retries must not duplicate evidence IDs. Timeouts: upload 60s default.
Known limits: Playwright cannot fully certify physical camera hardware; capability-contract
tests document that limitation.
