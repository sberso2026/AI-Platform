import { InspectionPlanDetail } from "@/components/engineering/inspection-plan-detail";

export default async function InspectionPlanDetailPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = await params;
  return <InspectionPlanDetail planId={planId} />;
}
