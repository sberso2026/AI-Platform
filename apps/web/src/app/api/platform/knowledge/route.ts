import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [nodes, edges] = await Promise.all([
    ctx.kernel.knowledgeGraph.listNodes(ctx.tenantId),
    ctx.kernel.knowledgeGraph.listEdges(ctx.tenantId),
  ]);

  return NextResponse.json({ data: { nodes, edges } });
}

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  if (body.type === "edge") {
    const edge = await ctx.kernel.knowledgeGraph.createEdge({
      tenantId: ctx.tenantId,
      fromNodeId: body.fromNodeId,
      toNodeId: body.toNodeId,
      edgeType: body.edgeType,
      createdBy: ctx.userId,
    });
    return NextResponse.json({ data: edge }, { status: 201 });
  }

  const node = await ctx.kernel.knowledgeGraph.createNode({
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    nodeType: body.nodeType ?? "document",
    title: body.title,
    content: body.content,
    createdBy: ctx.userId,
  });

  return NextResponse.json({ data: node }, { status: 201 });
}
