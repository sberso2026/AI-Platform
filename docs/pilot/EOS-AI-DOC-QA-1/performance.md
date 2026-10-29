# Performance

Live founder Ask timings from `live-qa.mjs` (sequential, Preview, Sydney):

Typical Ask round-trip for Current Document questions was on the order of 4–12 s in the pre-fix trace (`retrievalMs` ~4 s + `reasoningMs` ~4 s). The post-fix live suite completed ten cases in ~54 s wall time (~5 s mean).

No performance gate was defined for this ticket. Cold start of the Preview function is not included in the 54 s suite (warm session).
