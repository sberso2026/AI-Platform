import type { BrowserContext } from "@playwright/test";
import { buildAuthCookies } from "../src/lib/auth-cookies.js";
import { certUserPassword } from "../src/fixtures/env.js";

/** Signs in with the fixture password and installs Supabase's SSR cookies. */
export async function signInAsFixtureUser(
  context: BrowserContext,
  email: string,
  password = certUserPassword(),
): Promise<void> {
  const { cookies } = await buildAuthCookies(email, password);
  const baseUrl = process.env.RTB_TEST_BASE_URL ?? "http://127.0.0.1:3000";
  const base = new URL(baseUrl);
  await context.addCookies(cookies.map((cookie) => ({
    name: cookie.name,
    value: cookie.value,
    domain: base.hostname,
    path: typeof cookie.options.path === "string" ? cookie.options.path : "/",
    sameSite: cookie.options.sameSite === "strict" ? "Strict" : cookie.options.sameSite === "none" ? "None" : "Lax",
    httpOnly: Boolean(cookie.options.httpOnly),
    secure: base.protocol === "https:",
  })));
}
