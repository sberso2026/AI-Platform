# Project Intelligence V1 — Post-Release Change Classification

**Subject commit:** `d60746f22808cde372c41f1a0bbffb72a3410f95`  
**Message:** Grant contents:write for PI V1.0 release tag push after certification PASS.  
**PI V1 certified commit (unchanged):** `34975b1cf660580d46287f24e746b8915903f768`  
**Release tag:** `project-intelligence-v1.0.0` → still resolves to `34975b1…`

## File classification

| File | Classification |
|------|----------------|
| `.github/workflows/project-intelligence-v1-production-certification.yml` | workflow permission + certification infrastructure |

Changes in that workflow:
1. `permissions.contents: write` on `release-evidence` (tag push after PASS)
2. Path filter includes `apps/web/src/lib/project-intelligence/**` (CI trigger only)

## PASS criteria for post-PASS fix

| Check | Result |
|-------|--------|
| Runtime change | **No** |
| Schema change | **No** |
| Product behavior change | **No** |
| Module manifest change | **No** |
| Release artifact mutation | **No** |
| Certification gates weakened | **No** |

## Conclusion

`d60746f` is **post-release CI maintenance** (workflow-only).  
Do **not** move `project-intelligence-v1.0.0`. No patch release required.
