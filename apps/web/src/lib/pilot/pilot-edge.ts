/** Edge-safe pilot controls. No scanner or database imports. */

export function pilotKillSwitchSuspended(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.EOS_CONTROLLED_PILOT_ENABLED === "0";
}

export function hasAuthSessionCookie(cookieHeader: string | null): boolean {
  return (cookieHeader ?? "").includes("auth-token");
}
