# EOS-3-UX-FOUNDATION-1C — Home performance

`EOS_HOME_PERFORMANCE_MEASURED=YES`

Method: unauthenticated wall-ms to `https://eos-pilot.rtbea.com.au/engineering?va=1c` after UX-1C production deploy (`dpl_92DDcQgEtTH91S4A9t2AFUjmT18P`).

## Cold samples (n=5, idle gap ~8s)

3342, 739, 5351, 590, 490 → **P95 = 5351 ms** (`EOS_HOME_COLD_ROUTE_P95_MS`)

## Warm samples (n=12, immediate back-to-back)

398, 592, 287, 269, 208, 310, 312, 376, 251, 193, 241, 209 → **P95 = 592 ms** (`EOS_HOME_WARM_ROUTE_P95_MS`)

## Warm regression disposition

Pre-cutover Home baseline was 442 ms. Warm P95 592 ms is elevated vs that baseline but remains in the UX-1B warm cluster (~160–666 ms) and is **not** explained away by cold-start. No duplicate Home dashboard fetch loop found; single `/api/engineering/dashboard` request with abort-on-unmount remains.

`EOS_HOME_WARM_PERFORMANCE_REGRESSION=PASS_WITH_LIMITATIONS` — warm latency acceptable for lock phase; further warm optimization deferred outside UX-1C scope.
