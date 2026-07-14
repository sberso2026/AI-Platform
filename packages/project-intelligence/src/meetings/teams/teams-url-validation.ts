import { createHash } from "node:crypto";

import { throwTeamsError } from "./capability-contract";

const TEAMS_HOSTS = new Set([
  "teams.microsoft.com",
  "teams.live.com",
  "teams.office.com",
]);

export type ValidatedTeamsMeetingUrl = {
  joinUrl: string;
  joinUrlHash: string;
  host: string;
  meetingIdHint: string | null;
  threadIdHint: string | null;
};

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/**
 * Strict Teams meeting URL validation.
 * Does not fetch the URL. Rejects credentials, non-HTTPS, and non-Teams hosts.
 */
export function validateTeamsMeetingUrl(raw: string): ValidatedTeamsMeetingUrl {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 2048) {
    throwTeamsError("teams_meeting_url_invalid", "Teams meeting URL is invalid", {
      reason: "length",
    });
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throwTeamsError("teams_meeting_url_invalid", "Teams meeting URL is invalid", {
      reason: "parse",
    });
  }

  if (url.protocol !== "https:") {
    throwTeamsError("teams_meeting_url_invalid", "Teams meeting URL must use HTTPS", {
      reason: "protocol",
    });
  }

  if (url.username || url.password) {
    throwTeamsError("teams_meeting_url_invalid", "Teams meeting URL must not embed credentials", {
      reason: "credentials",
    });
  }

  const host = url.hostname.toLowerCase();
  if (!TEAMS_HOSTS.has(host) && !host.endsWith(".teams.microsoft.com")) {
    throwTeamsError("teams_meeting_url_invalid", "Teams meeting URL host is not allowed", {
      reason: "host",
    });
  }

  const path = url.pathname.toLowerCase();
  const looksLikeMeeting =
    path.includes("/l/meetup-join/") ||
    path.includes("/meet/") ||
    path.includes("/_#/l/meetup-join/") ||
    url.searchParams.has("meetup-join") ||
    /\/l\/meetup-join\//i.test(trimmed);

  if (!looksLikeMeeting && !path.includes("meetup-join") && !path.includes("meetup")) {
    // Allow deep links that still sit on Teams hosts with meeting-style query.
    if (!url.search.toLowerCase().includes("meetup") && !path.includes("launch")) {
      throwTeamsError("teams_meeting_url_invalid", "URL is not a Teams meeting join link", {
        reason: "path",
      });
    }
  }

  const meetingIdHint =
    url.searchParams.get("meetingId") ??
    url.pathname.match(/meetup-join\/([^/?#]+)/i)?.[1] ??
    null;
  const threadIdHint = url.searchParams.get("threadId") ?? url.searchParams.get("threadId2");

  return {
    joinUrl: url.toString(),
    joinUrlHash: sha256(url.toString()),
    host,
    meetingIdHint,
    threadIdHint,
  };
}

export function hashTeamsJoinUrl(joinUrl: string): string {
  return sha256(joinUrl.trim());
}
