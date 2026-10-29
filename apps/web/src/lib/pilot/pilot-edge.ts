/** Edge-safe pilot controls. No scanner or database imports. */

export function pilotKillSwitchSuspended(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.EOS_CONTROLLED_PILOT_ENABLED === "0";
}

export function hasAuthSessionCookie(cookieHeader: string | null): boolean {
  return (cookieHeader ?? "").includes("auth-token");
}

export function logPilotEdgeEvent(event: { eventClass: string; action: string; result: string }): void {
  console.info(
    JSON.stringify({
      source: "eos-pilot",
      timestamp: new Date().toISOString(),
      eventClass: event.eventClass,
      action: event.action,
      result: event.result,
    }),
  );
}
