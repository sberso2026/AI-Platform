import type { AuthContext } from "@/lib/kernel";

export async function loadSeatedProductIds(ctx: AuthContext): Promise<string[]> {
  const pools = await ctx.commerce.seats.listByTenant(ctx.tenantId);
  const seated: string[] = [];
  await Promise.all(
    pools.map(async (pool) => {
      const rows = await ctx.commerce.seatAssignment.listAssignments(ctx.tenantId, pool.id);
      if (rows.some((row) => row.user_id === ctx.userId && row.status === "active")) {
        seated.push(pool.product_id);
      }
    }),
  );
  return seated;
}
