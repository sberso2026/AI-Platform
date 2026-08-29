import { describe, expect, it } from "vitest";
import { minimiseAccount, minimiseContact, minimiseInvoice, minimiseOrganisation, moneyToMinor } from "./xero-validate";
import { XeroConnectorError } from "./xero-errors";

describe("Xero response validation and minimisation", () => {
  it("requires provider IDs and preserves unknown money as null", () => {
    expect(() => minimiseOrganisation({})).toThrow(XeroConnectorError);
    const org = minimiseOrganisation({
      OrganisationID: "org-1",
      Name: "Demo Company",
      IsDemoCompany: true,
      CountryCode: "AU",
    });
    expect(org.payload.canonical).toBe(false);
    expect(org.payload.IsDemoCompany).toBe(true);

    const invoice = minimiseInvoice({ InvoiceID: "inv-1", Status: "AUTHORISED", CurrencyCode: "AUD" });
    expect(invoice.payload.totalMinor).toBeNull();
    expect(invoice.payload.unknown).toBe(true);
    expect(invoice.payload).not.toHaveProperty("LineItems");
    expect(invoice.payload).not.toHaveProperty("Contact");

    expect(moneyToMinor(12.34).amountMinor).toBe(1234);
    expect(moneyToMinor(null).unknown).toBe(true);
  });

  it("discards bank numbers and contact PII", () => {
    const account = minimiseAccount({
      AccountID: "acc-1",
      Code: "090",
      BankAccountNumber: "123-456",
      TaxType: "OUTPUT",
    });
    expect(account.payload).not.toHaveProperty("BankAccountNumber");
    expect(account.payload.balanceMinor).toBeNull();

    const contact = minimiseContact({
      ContactID: "c-1",
      Name: "Jordan",
      EmailAddress: "hidden@example.com",
      Phones: [{ PhoneNumber: "555" }],
    });
    expect(contact.payload).not.toHaveProperty("EmailAddress");
    expect(contact.payload).not.toHaveProperty("Phones");
    expect(contact.payload.unknown).toBe(true);
  });
});
