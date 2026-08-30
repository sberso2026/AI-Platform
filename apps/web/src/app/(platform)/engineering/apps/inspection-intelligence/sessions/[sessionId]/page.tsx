import { InspectionSessionWorkspace } from "@/components/engineering/inspection-session-workspace";

export default async function InspectionSessionDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  return <InspectionSessionWorkspace sessionId={sessionId} />;
}
