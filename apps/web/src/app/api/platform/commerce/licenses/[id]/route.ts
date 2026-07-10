import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";
import { CommerceDomainError } from "@rtb/platform-commerce";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const licenses = await ctx.commerce.licenses.listByTenant(ctx.tenantId);
    const license = licenses.find((l) => l.id === id);

    if (!license) {
      return NextResponse.json(
        { error: "Licence not found", code: "licence_not_found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: license });
  } catch (err) {
    if (err instanceof CommerceDomainError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
    }
    throw err;
  }
}
