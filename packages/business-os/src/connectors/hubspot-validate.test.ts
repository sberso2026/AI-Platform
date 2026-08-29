import { describe, expect, it } from "vitest";
import { HubSpotConnectorError } from "./hubspot-errors";
import { minimiseCompany, minimiseContact, minimiseDeal, validateHubSpotPaging } from "./hubspot-validate";

describe("HubSpot response validation", () => {
  it("rejects schema-invalid CRM objects and discards PII", () => {
    expect(() => minimiseContact({})).toThrow(HubSpotConnectorError);
    const contact = minimiseContact({
      id: "1",
      archived: false,
      properties: {
        firstname: "Jordan",
        lastname: "Buyer",
        company: "Acme",
        email: "jordan@example.com",
        phone: "+1-555-0199",
        address: "99 Leak Street",
        notes: "private note",
      },
    });
    expect(contact.payload.name).toBe("Jordan Buyer");
    expect(contact.payload.company).toBe("Acme");
    expect(JSON.stringify(contact)).not.toContain("jordan@example.com");
    expect(JSON.stringify(contact)).not.toContain("+1-555-0199");
    expect(JSON.stringify(contact)).not.toContain("private note");
    expect(() =>
      minimiseContact({
        id: "2",
        archived: true,
        properties: { firstname: "Gone" },
      }),
    ).toThrow("hubspot_schema_invalid");
  });

  it("keeps required deal fields and rejects hostile pagination", () => {
    const company = minimiseCompany({
      id: "10",
      properties: { name: "Acme", domain: "acme.test", phone: "+1-555-0100", address: "1 Secret Lane" },
    });
    expect(company.payload.name).toBe("Acme");
    expect(JSON.stringify(company)).not.toContain("+1-555-0100");
    const deal = minimiseDeal({
      id: "20",
      properties: { dealname: "Expansion", amount: "1200", dealstage: "qualifiedtobuy", pipeline: "default", description: "secret" },
    });
    expect(deal.payload.dealstage).toBe("qualifiedtobuy");
    expect(deal.payload.amount).toBe("1200");
    expect(JSON.stringify(deal)).not.toContain("secret");
    expect(validateHubSpotPaging(null, "/crm/v3/objects/contacts")).toBeNull();
    expect(() =>
      validateHubSpotPaging(
        { next: { after: "1", link: "https://evil.example/crm/v3/objects/contacts" } },
        "/crm/v3/objects/contacts",
      ),
    ).toThrow("hubspot_pagination_failed");
  });
});
