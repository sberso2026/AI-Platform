import type { BrowserContext, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { requirePiFixturesManifest } from "../src/fixtures/env.js";
import { signInAsFixtureUser } from "./auth.js";

const basePath = "/engineering/apps/project-intelligence";

export function piCertFixtures() {
  return requirePiFixturesManifest();
}

export async function signInPiOwner(context: BrowserContext): Promise<{ email: string; projectId: string }> {
  const fixtures = piCertFixtures();
  const owner = fixtures.baseline.users.owner;
  if (!owner?.email) throw new Error("Missing baseline.users.owner fixture");
  await signInAsFixtureUser(context, owner.email);
  return { email: owner.email, projectId: fixtures.baseline.engineeringProjectId };
}

export async function openProjectIntelligence(page: Page): Promise<void> {
  await page.goto(basePath);
}

export async function selectCanonicalProject(page: Page, projectId: string, selectTestId = "command-centre-project-select"): Promise<void> {
  const select = page.getByTestId(selectTestId);
  await expect(select).toBeVisible();
  await select.selectOption(projectId);
  await select.blur();
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(new RegExp(`projectId=${projectId}`), { timeout: 45_000 });
}

/** Follow a PI shell nav link, using its rendered href if the App Router swallows the click. */
export async function followPiNav(page: Page, testId: string, urlPattern: RegExp): Promise<void> {
  const link = page.getByTestId(testId);
  await expect(link).toBeVisible();
  const href = await link.getAttribute("href");
  if (!href) throw new Error(`${testId} is missing href`);
  await page.keyboard.press("Escape");
  await link.click({ force: true });
  try {
    await page.waitForURL(urlPattern, { timeout: 8_000 });
  } catch {
    await page.goto(href);
  }
  await expect(page).toHaveURL(urlPattern, { timeout: 45_000 });
}
