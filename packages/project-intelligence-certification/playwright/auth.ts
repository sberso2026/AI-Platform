import type { BrowserContext } from "@playwright/test";
import { buildAuthCookies } from "../src/lib/auth-cookies.js";
import { certUserPassword } from "../src/fixtures/env.js";

const cookieCache = new Map<string, Awaited<ReturnType<typeof buildAuthCookies>>["cookies"]>();

async function installCookies(
  context: BrowserContext,
  cookies: Awaited<ReturnType<typeof buildAuthCookies>>["cookies"],
): Promise<void> {
  const baseUrl = process.env.RTB_TEST_BASE_URL ?? "http://127.0.0.1:3000";
  const base = new URL(baseUrl);
  await context.addCookies(
    cookies.map((cookie) => ({
      name: cookie.name,
      value: cookie.value,
      domain: base.hostname,
      path: typeof cookie.options.path === "string" ? cookie.options.path : "/",
      sameSite:
        cookie.options.sameSite === "strict"
          ? "Strict"
          : cookie.options.sameSite === "none"
            ? "None"
            : "Lax",
      httpOnly: Boolean(cookie.options.httpOnly),
      secure: base.protocol === "https:",
    })),
  );
}

/** Signs in with the fixture password and installs Supabase's SSR cookies (cached per email). */
export async function signInAsFixtureUser(
  context: BrowserContext,
  email: string,
  password = certUserPassword(),
): Promise<void> {
  let cookies = cookieCache.get(email);
  if (!cookies) {
    const built = await buildAuthCookies(email, password);
    cookies = built.cookies;
    cookieCache.set(email, cookies);
  }
  await installCookies(context, cookies);
}
