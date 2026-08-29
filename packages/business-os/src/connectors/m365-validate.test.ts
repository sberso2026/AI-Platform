import { describe, expect, it } from "vitest";
import { Ms365ConnectorError } from "./m365-errors";
import { minimiseDriveItem, minimiseEvent, minimiseUser, validateMs365NextLink } from "./m365-validate";

describe("Microsoft 365 response validation", () => {
  it("rejects schema-invalid Graph objects and preserves missing values", () => {
    expect(() => minimiseUser({})).toThrow(Ms365ConnectorError);
    const user = minimiseUser({ id: "user-1", displayName: "Pat", mail: "pat@contoso.test", businessPhones: ["+1"] });
    expect(user.payload.displayName).toBe("Pat");
    expect(JSON.stringify(user)).not.toContain("pat@contoso.test");
    expect(JSON.stringify(user)).not.toContain("+1");
    const event = minimiseEvent({
      id: "evt-1",
      subject: "Standup",
      start: { dateTime: "2026-08-29T01:00:00.000Z" },
      body: { content: "secret body" },
      attendees: [{ emailAddress: { address: "hidden@contoso.test" } }],
    });
    expect(event.payload.start).toBe("2026-08-29T01:00:00.000Z");
    expect(event.payload.isCancelled).toBeNull();
    expect(JSON.stringify(event)).not.toContain("secret body");
    expect(JSON.stringify(event)).not.toContain("hidden@contoso.test");
  });

  it("discards drive content and rejects hostile pagination links", () => {
    const item = minimiseDriveItem({
      id: "file-1",
      name: "plan.docx",
      file: {},
      content: "file-bytes",
      webUrl: "https://contoso.sharepoint.com/secret",
    });
    expect(item.payload.kind).toBe("file");
    expect(JSON.stringify(item)).not.toContain("file-bytes");
    expect(JSON.stringify(item)).not.toContain("sharepoint.com");
    expect(validateMs365NextLink(null, "/v1.0/me/events")).toBeNull();
    expect(() =>
      validateMs365NextLink("https://evil.example/v1.0/me/events", "/v1.0/me/events"),
    ).toThrow("m365_pagination_failed");
  });
});
