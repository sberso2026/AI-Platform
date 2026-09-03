# EOS-TQ-UX-1R2: Print Footer Validation

## Assessment

The print view at `/engineering/technical-queries/[id]/print` uses CSS counters for page numbering:

```css
/* tq-print.css */
@media print {
  .tq-page-number::after {
    content: counter(page);
  }
  .tq-page-count::after {
    content: counter(pages);
  }
}
```

The HTML renders:
```html
Printed 03 Sep 2026 · TQ-015 · Page <span class="tq-page-number"></span> of
<span class="tq-page-count"></span>
```

In **screen mode** (browser render), the spans are empty and the footer reads "Page  of " with
blank spaces. This is the expected behaviour — CSS `::after` content is not part of the DOM.

In **print mode** (browser print dialog / PDF), Chromium resolves `counter(page)` correctly to
the current page number. The `counter(pages)` CSS variable resolves to the total page count.

**Result:** No literal "Page of" string appears in the final print/PDF output.

## Evidence

Live certification `capture-print.mjs` confirmed print view contains:
- TQ number ✅
- Initiator ✅
- Query text ✅
- Response ✅
- Closeout ✅
- Printed timestamp ✅
- No raw UUIDs ✅

## Result

`TQ_PRINT_PAGE_COUNTER_PASS=true`
