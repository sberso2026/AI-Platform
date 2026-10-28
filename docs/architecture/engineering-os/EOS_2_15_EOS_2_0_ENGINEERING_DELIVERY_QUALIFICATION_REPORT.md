# EOS 2.15 EOS 2.0 Engineering Delivery Qualification Report

## Decision

EOS 2.0 is not granted `QUALIFIED_BOUNDED` in this gate. The qualification status is `VALIDATED_NOT_QUALIFIED`. The phase verdict is `BLOCKED`.

The repository evidence and the persisted staging project support a bounded delivery-workflow claim. The gate also requires a signed-in browser walk of the deployed candidate. That walk did not complete. A preview deployment of commit `b96342587cc3a9ef0487dfd2363295e55fb8aa48` is Ready at `dpl_3LyLRCMuYuXQkyoc2k6rop6ZZaPR`, and its build identity reports staging Supabase `rntonzigxwxcjlcsadip`. Opening `/login` in a browser was redirected to Vercel login by deployment protection. The application login and the nineteen engineering routes were not observed in a signed-in session.

Production was not changed. `https://eos-pilot.rtbea.com.au/api/platform/build-identity` still reports commit `0c1ec9e06eea59ac089753f3c930f1a599b14648`, deployment `dpl_7EBZUxhkVX7MjR44rYCgkg8odHgB`, and production Supabase `wcydlhqiqdwgoaqrlget`.

## Qualified scope that was not granted

The intended claim remains ungranted:

EOS 2.0 is a validated and bounded-qualified multidisciplinary engineering delivery, traceability, interface, change-impact, lifecycle, configuration and deliverable-governance platform for controlled engineering workflows across Concept, Feasibility, FEED and Detailed Engineering.

That sentence may be used only after the signed-in staging browser evidence exists. It must still exclude unsupported deterministic calculations and external solver qualification.

## What was validated

- EOS 2.1 through EOS 2.14 remain implemented and covered by their existing automated tests.
- Staging already contained the EOS 2.x tables. The thirteen approved versions `20261028120000` through `20261029100000` were absent from `schema_migrations`. This gate inserted those version and name rows only. The SQL files were not replayed. Staging ledger count is 145, maximum version `20261029100000`, duplicate version count 0, order valid. Production ledger remains 144 and maximum `20261027233000`, with no EOS 2.x version present.
- Project `EOS-QA-001` is persisted on staging and labelled `SYNTHETIC_QUALIFICATION_PROJECT`. It contains a detailed-engineering lifecycle, a project design basis, a requirement, an engineering input, one delivery row for each of the eight disciplines, two issued interfaces, a vendor change with structural and electrical candidate impacts, a stale construction deliverable, and a frozen FEED baseline. The baseline fingerprint is `d718a0888df3d9260ff968dc3c90bdc8bac4dc5a06857d9cda4964393c7eb4ed`.
- A second synthetic user in an unrelated workspace on the same tenant received zero rows from those tables when the database role was `authenticated` and the JWT subject was that user. The member of the qualification workspace received the persisted rows. Leak count is 0. This is a hosted role test, not a browser session.
- An attempt to set `approved_by_ai` on the qualification freeze remained false.
- The preview build identity was read from the deployment, not inferred only from the local git HEAD.

## Excluded scope

Unsupported deterministic calculations for process, mechanical, piping, civil, geotechnical, electrical, and I&C remain not qualified. External solvers remain metadata or import only and are not certified. EOS is not a universal design calculator, a document-management system, construction-management software, or a regulatory certifier. AI has no engineering approval, acceptance, materiality, freeze, release, or baseline-mutation authority.

## Defects

| ID | Severity | Status | Effect |
| --- | --- | --- | --- |
| QD-001 | MEDIUM | Open | Signed-in browser qualification is blocked by Vercel deployment protection on the preview. No tenant, authority, baseline, or D1 defect was found. Qualification is not granted. |

## Production promotion

Not eligible. No production migration was applied and production was not redeployed.
