# EOS-TQ-UX-1 Print validation

Print is browser print CSS on `/engineering/technical-queries/[id]/print`.

Included:

- RTB Engineering & Analytics / Engineering OS heading (no Chevron/KJV branding)
- TQ number, title, status, priority, project metadata, control metadata
- Query, suggested solution, references, client/technical response, response basis, follow-up, closeout
- Printed datetime, document identifier, page counters, “Uncontrolled when printed”
- `@page { size: A4; margin: 16mm }`
- Chrome (`header`, `nav`, `aside`, `.no-print`) hidden in print
- Tables preserved; wrapping enabled; no raw UUID fields in the print template

Not a duplicate PDF/reporting stack.

Live A4 pagination must still be checked in a real browser print preview after Preview deploy.
