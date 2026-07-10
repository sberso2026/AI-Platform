import type { BrowserContext } from "@playwright/test";

import { buildAuthCookies } from "../src/lib/auth-cookies.js";
import { certUserPassword, resolveTestBaseUrl } from "../src/lib/env.js";

/**
 * Establishes a real Supabase SSR session via the same cookie path HTTP tests use.
 */
export async function signInAs(
  context: BrowserContext,
  email: string,
  password = certUserPassword()
): Promise<void> {
  const { cookies } = await buildAuthCookies(email, password);
  const base = new URL(resolveTestBaseUrl());

  await context.addCookies(
    cookies.map((c) => ({
      name: c.name,
      value: c.value,
      domain: base.hostname,
      path: typeof c.options?.path === "string" ? c.options.path : "/",
      sameSite:
        c.options?.sameSite === "strict"
          ? "Strict"
          : c.options?.sameSite === "none"
            ? "None"
            : "Lax",
      httpOnly: Boolean(c.options?.httpOnly),
      secure: base.protocol === "https:",
    }))
  );
}
