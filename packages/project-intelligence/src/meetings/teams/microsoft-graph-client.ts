import type { MicrosoftGraphConfig, MicrosoftGraphTokenService } from "./microsoft-graph-token-service";

export type GraphOnlineMeeting = {
  id: string;
  subject: string | null;
  joinWebUrl: string | null;
  organizerId: string | null;
  startDateTime: string | null;
  endDateTime: string | null;
};

export type GraphParticipant = {
  providerParticipantId: string;
  displayName: string;
  email: string | null;
  role: string | null;
};

export type GraphTranscriptSegment = {
  providerEventId: string;
  text: string;
  startTimeMs: number;
  endTimeMs: number;
  speakerId: string | null;
  speakerLabel: string | null;
  providerSequence: number;
  providerTimestamp: string;
};

export type GraphSubscription = {
  id: string;
  resource: string;
  expirationDateTime: string;
  notificationUrl: string;
  clientState: string;
};

export interface MicrosoftGraphClientPort {
  getOnlineMeeting(meetingId: string, correlationId: string): Promise<GraphOnlineMeeting | null>;
  listParticipants(meetingId: string, correlationId: string): Promise<GraphParticipant[]>;
  listTranscriptSegments(meetingId: string, correlationId: string): Promise<GraphTranscriptSegment[]>;
  createSubscription(input: {
    resource: string;
    changeType: string;
    notificationUrl: string;
    lifecycleNotificationUrl?: string | null;
    clientState: string;
    expirationDateTime: string;
    correlationId: string;
  }): Promise<GraphSubscription>;
  renewSubscription(
    subscriptionId: string,
    expirationDateTime: string,
    correlationId: string,
  ): Promise<GraphSubscription>;
  deleteSubscription(subscriptionId: string, correlationId: string): Promise<void>;
}

export class FixtureMicrosoftGraphClient implements MicrosoftGraphClientPort {
  readonly meetings = new Map<string, GraphOnlineMeeting>();
  readonly participants = new Map<string, GraphParticipant[]>();
  readonly transcripts = new Map<string, GraphTranscriptSegment[]>();
  readonly subscriptions = new Map<string, GraphSubscription>();

  constructor() {
    const fixtureId = "fixture-online-meeting-001";
    this.meetings.set(fixtureId, {
      id: fixtureId,
      subject: "PI Teams certification fixture",
      joinWebUrl: "https://teams.microsoft.com/l/meetup-join/fixture-online-meeting-001",
      organizerId: "fixture-organizer",
      startDateTime: new Date().toISOString(),
      endDateTime: null,
    });
    this.participants.set(fixtureId, [
      {
        providerParticipantId: "aad-participant-1",
        displayName: "Alex Engineer",
        email: null,
        role: "presenter",
      },
      {
        providerParticipantId: "aad-participant-2",
        displayName: "Sam Reviewer",
        email: null,
        role: "attendee",
      },
    ]);
    this.transcripts.set(fixtureId, [
      {
        providerEventId: "fixture-tx-1",
        text: "ACTION: Confirm Teams mapping before go-live.",
        startTimeMs: 0,
        endTimeMs: 4000,
        speakerId: "aad-participant-1",
        speakerLabel: "Alex Engineer",
        providerSequence: 1,
        providerTimestamp: new Date().toISOString(),
      },
      {
        providerEventId: "fixture-tx-2",
        text: "DECIDE: Approve post-meeting transcript ingestion path.",
        startTimeMs: 4000,
        endTimeMs: 9000,
        speakerId: "aad-participant-2",
        speakerLabel: "Sam Reviewer",
        providerSequence: 2,
        providerTimestamp: new Date().toISOString(),
      },
    ]);
  }

  async getOnlineMeeting(meetingId: string): Promise<GraphOnlineMeeting | null> {
    return this.meetings.get(meetingId) ?? null;
  }

  async listParticipants(meetingId: string): Promise<GraphParticipant[]> {
    return this.participants.get(meetingId) ?? [];
  }

  async listTranscriptSegments(meetingId: string): Promise<GraphTranscriptSegment[]> {
    return this.transcripts.get(meetingId) ?? [];
  }

  async createSubscription(input: {
    resource: string;
    notificationUrl: string;
    clientState: string;
    expirationDateTime: string;
    correlationId: string;
  }): Promise<GraphSubscription> {
    const id = `fixture-sub-${this.subscriptions.size + 1}`;
    const sub: GraphSubscription = {
      id,
      resource: input.resource,
      expirationDateTime: input.expirationDateTime,
      notificationUrl: input.notificationUrl,
      clientState: input.clientState,
    };
    this.subscriptions.set(id, sub);
    return sub;
  }

  async renewSubscription(
    subscriptionId: string,
    expirationDateTime: string,
  ): Promise<GraphSubscription> {
    const existing = this.subscriptions.get(subscriptionId);
    if (!existing) {
      throw Object.assign(new Error("teams_subscription_failed"), { code: "teams_subscription_failed" });
    }
    const next = { ...existing, expirationDateTime };
    this.subscriptions.set(subscriptionId, next);
    return next;
  }

  async deleteSubscription(subscriptionId: string): Promise<void> {
    this.subscriptions.delete(subscriptionId);
  }
}

export class LiveMicrosoftGraphClient implements MicrosoftGraphClientPort {
  constructor(
    private readonly tokenService: MicrosoftGraphTokenService,
    private readonly config: MicrosoftGraphConfig,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  private async graphFetch(
    path: string,
    correlationId: string,
    init?: RequestInit,
  ): Promise<Response> {
    const token = await this.tokenService.getAccessToken(correlationId);
    const response = await this.fetchImpl(`https://graph.microsoft.com/v1.0${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "client-request-id": correlationId,
        ...(init?.headers ?? {}),
      },
    });
    if (response.status === 429) {
      throw Object.assign(new Error("teams_rate_limited"), { code: "teams_rate_limited" });
    }
    if (response.status === 401 || response.status === 403) {
      throw Object.assign(new Error("teams_provider_permission_missing"), {
        code: "teams_provider_permission_missing",
      });
    }
    return response;
  }

  async getOnlineMeeting(
    meetingId: string,
    correlationId: string,
  ): Promise<GraphOnlineMeeting | null> {
    const response = await this.graphFetch(
      `/communications/onlineMeetings/${encodeURIComponent(meetingId)}`,
      correlationId,
    );
    if (response.status === 404) return null;
    if (!response.ok) {
      throw Object.assign(new Error("teams_meeting_not_found"), { code: "teams_meeting_not_found" });
    }
    const json = (await response.json()) as Record<string, unknown>;
    return {
      id: String(json.id),
      subject: json.subject == null ? null : String(json.subject),
      joinWebUrl: json.joinWebUrl == null ? null : String(json.joinWebUrl),
      organizerId:
        (json.participants as { organizer?: { identity?: { user?: { id?: string } } } } | undefined)
          ?.organizer?.identity?.user?.id ?? null,
      startDateTime: json.startDateTime == null ? null : String(json.startDateTime),
      endDateTime: json.endDateTime == null ? null : String(json.endDateTime),
    };
  }

  async listParticipants(meetingId: string, correlationId: string): Promise<GraphParticipant[]> {
    // Prefer attendance reports when available; fixture-compatible empty fallback on 404.
    const response = await this.graphFetch(
      `/communications/onlineMeetings/${encodeURIComponent(meetingId)}/attendanceReports`,
      correlationId,
    );
    if (response.status === 404) return [];
    if (!response.ok) return [];
    const json = (await response.json()) as { value?: Array<Record<string, unknown>> };
    return (json.value ?? []).flatMap((report, idx) => {
      const id = String(report.id ?? `attendee-${idx}`);
      return [
        {
          providerParticipantId: id,
          displayName: String(report.displayName ?? "Unknown participant"),
          email: null,
          role: null,
        },
      ];
    });
  }

  async listTranscriptSegments(
    meetingId: string,
    correlationId: string,
  ): Promise<GraphTranscriptSegment[]> {
    const list = await this.graphFetch(
      `/communications/onlineMeetings/${encodeURIComponent(meetingId)}/transcripts`,
      correlationId,
    );
    if (list.status === 404) {
      throw Object.assign(new Error("teams_transcript_unavailable"), {
        code: "teams_transcript_unavailable",
      });
    }
    if (list.status === 403) {
      throw Object.assign(new Error("teams_transcript_access_denied"), {
        code: "teams_transcript_access_denied",
      });
    }
    if (!list.ok) {
      throw Object.assign(new Error("teams_transcript_unavailable"), {
        code: "teams_transcript_unavailable",
      });
    }
    const json = (await list.json()) as { value?: Array<{ id?: string }> };
    const firstId = json.value?.[0]?.id;
    if (!firstId) {
      throw Object.assign(new Error("teams_transcript_unavailable"), {
        code: "teams_transcript_unavailable",
      });
    }
    const content = await this.graphFetch(
      `/communications/onlineMeetings/${encodeURIComponent(meetingId)}/transcripts/${encodeURIComponent(firstId)}/content?$format=text/vtt`,
      correlationId,
    );
    if (!content.ok) {
      throw Object.assign(new Error("teams_transcript_unavailable"), {
        code: "teams_transcript_unavailable",
      });
    }
    const vtt = await content.text();
    return parseVttToSegments(vtt, firstId);
  }

  async createSubscription(input: {
    resource: string;
    changeType: string;
    notificationUrl: string;
    lifecycleNotificationUrl?: string | null;
    clientState: string;
    expirationDateTime: string;
    correlationId: string;
  }): Promise<GraphSubscription> {
    const body: Record<string, unknown> = {
      changeType: input.changeType,
      notificationUrl: input.notificationUrl,
      resource: input.resource,
      expirationDateTime: input.expirationDateTime,
      clientState: input.clientState,
    };
    if (input.lifecycleNotificationUrl) {
      body.lifecycleNotificationUrl = input.lifecycleNotificationUrl;
    }
    const response = await this.graphFetch("/subscriptions", input.correlationId, {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw Object.assign(new Error("teams_subscription_failed"), {
        code: "teams_subscription_failed",
      });
    }
    const json = (await response.json()) as Record<string, unknown>;
    return {
      id: String(json.id),
      resource: String(json.resource),
      expirationDateTime: String(json.expirationDateTime),
      notificationUrl: String(json.notificationUrl),
      clientState: String(json.clientState ?? input.clientState),
    };
  }

  async renewSubscription(
    subscriptionId: string,
    expirationDateTime: string,
    correlationId: string,
  ): Promise<GraphSubscription> {
    const response = await this.graphFetch(
      `/subscriptions/${encodeURIComponent(subscriptionId)}`,
      correlationId,
      {
        method: "PATCH",
        body: JSON.stringify({ expirationDateTime }),
      },
    );
    if (response.status === 404) {
      throw Object.assign(new Error("teams_subscription_expired"), {
        code: "teams_subscription_expired",
      });
    }
    if (!response.ok) {
      throw Object.assign(new Error("teams_subscription_failed"), {
        code: "teams_subscription_failed",
      });
    }
    const json = (await response.json()) as Record<string, unknown>;
    return {
      id: String(json.id),
      resource: String(json.resource),
      expirationDateTime: String(json.expirationDateTime),
      notificationUrl: String(json.notificationUrl),
      clientState: String(json.clientState ?? ""),
    };
  }

  async deleteSubscription(subscriptionId: string, correlationId: string): Promise<void> {
    await this.graphFetch(`/subscriptions/${encodeURIComponent(subscriptionId)}`, correlationId, {
      method: "DELETE",
    });
  }
}

export function createMicrosoftGraphClient(
  config: MicrosoftGraphConfig,
  tokenService: MicrosoftGraphTokenService,
): MicrosoftGraphClientPort {
  if (config.mode === "fixture") {
    return new FixtureMicrosoftGraphClient();
  }
  return new LiveMicrosoftGraphClient(tokenService, config);
}

function parseVttToSegments(vtt: string, transcriptId: string): GraphTranscriptSegment[] {
  const blocks = vtt.split(/\n\n+/).filter((b) => b.includes("-->"));
  return blocks.map((block, index) => {
    const lines = block.split(/\r?\n/).filter(Boolean);
    const timeLine = lines.find((l) => l.includes("-->")) ?? "";
    const text = lines.filter((l) => !l.includes("-->") && !/^\d+$/.test(l)).join(" ").trim();
    const [startRaw, endRaw] = timeLine.split("-->").map((s) => s.trim());
    return {
      providerEventId: `${transcriptId}:${index + 1}`,
      text: text || "(empty)",
      startTimeMs: vttTimestampToMs(startRaw),
      endTimeMs: vttTimestampToMs(endRaw),
      speakerId: null,
      speakerLabel: null,
      providerSequence: index + 1,
      providerTimestamp: new Date().toISOString(),
    };
  });
}

function vttTimestampToMs(value: string | undefined): number {
  if (!value) return 0;
  const match = value.match(/(?:(\d+):)?(\d+):(\d+)[.,](\d+)/);
  if (!match) return 0;
  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2]);
  const seconds = Number(match[3]);
  const frac = Number(match[4].padEnd(3, "0").slice(0, 3));
  return ((hours * 60 + minutes) * 60 + seconds) * 1000 + frac;
}

export function extractOnlineMeetingIdFromGraphResource(resource: string): string | null {
  const match = resource.match(/onlineMeetings\('([^']+)'\)/i);
  const raw = match?.[1]?.trim();
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}
