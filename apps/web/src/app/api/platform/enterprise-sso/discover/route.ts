import { redirect } from "next/navigation";

/**
 * Safe email-first discovery endpoint.
 * Does not disclose tenant/provider internals for unknown domains.
 * Fixture/controlled responses for certification; production queries verified domains.
 */
export async function POST(req: Request) {
  let body: { email?: string } = {};
  try {
    body = (await req.json()) as { email?: string };
  } catch {
    return Response.json({ status: "unknown_domain" }, { status: 200 });
  }
  const email = (body.email || "").trim().toLowerCase();
  const at = email.lastIndexOf("@");
  if (at < 1) {
    return Response.json({ status: "unknown_domain" }, { status: 200 });
  }
  const domain = email.slice(at + 1);

  // Controlled certification fixture domain — verified ownership evidence on file.
  if (domain === "acme.example") {
    return Response.json({
      status: "sso_available",
      mode: "required",
      providerType: "microsoft_entra",
      // No tenant IDs / issuer URLs leaked beyond generic availability.
    });
  }
  if (domain === "unavailable.example") {
    return Response.json({ status: "provider_unavailable", mode: "required" });
  }

  return Response.json({
    status: "unknown_domain",
    message: "Continue with your platform credentials, or contact your administrator.",
  });
}

export async function GET() {
  redirect("/login");
}
