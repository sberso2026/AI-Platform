import { assertRlsEnvOrFail } from "./lib/env";

if (process.env.VITEST_RLS_SUITE === "1") {
  assertRlsEnvOrFail();
}
