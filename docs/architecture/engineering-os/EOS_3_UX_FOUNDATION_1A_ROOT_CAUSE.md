# EOS-3-UX-FOUNDATION-1A — Legacy default UI root cause

## Finding

`EOS_LEGACY_DEFAULT_UI_ROOT_CAUSE_IDENTIFIED=YES`

## Root cause

The authenticated default route remains `/engineering` (middleware post-auth / MFA return path).  
`apps/web/src/app/(platform)/engineering/page.tsx` was **not cut over** in UX-FOUNDATION-1.

That page still rendered the legacy **Command Centre** shell:
- Header title `Command Centre`
- Primary CTA `Open Engineering Workbench` → `/engineering/work`
- Panels `Engineering Intelligence Core`, AI-centric composition
- Labels such as Ask Engineering AI / system-oriented signals

UX-FOUNDATION-1 successfully updated:
- global nav labels (Home / Projects / My Work / …);
- project workspace IA and Work Package cockpit;
- My Work foundation;

…but left the **default landing page** bound to the prior Command Centre composition.  
Therefore the approved project workspace existed behind secondary project routes / Workbench, while login → `/engineering` still presented the legacy experience.

## Not the cause (verified)

- Feature flag gating of the new project shell: not required for `/engineering` home.
- Deployment mismatch: pilot served the committed HEAD; the committed home page was still legacy.
- Role entitlement alone: Command Centre content was unconditional on the home page.
- Separate Workbench route existence: `/engineering/work` is a legacy/advanced path; the defect was making it the primary CTA from Home.

## Correction

Replace `/engineering` Home with the approved engineering-focused Home; remove Workbench as a required gate; keep Workbench/Command Centre routes as Legacy/Advanced only.
