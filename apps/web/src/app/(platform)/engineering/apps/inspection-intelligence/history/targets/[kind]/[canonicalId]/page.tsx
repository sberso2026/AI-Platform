import { InspectionTargetHistory } from "@/components/engineering/inspection-target-history";

export default async function InspectionTargetHistoryPage({
  params,
}: {
  params: Promise<{ kind: string; canonicalId: string }>;
}) {
  const { kind, canonicalId } = await params;
  return <InspectionTargetHistory kind={kind} canonicalId={canonicalId} />;
}
