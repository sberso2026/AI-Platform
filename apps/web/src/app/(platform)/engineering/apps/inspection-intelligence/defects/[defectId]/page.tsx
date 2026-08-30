import { InspectionDefectDetail } from "@/components/engineering/inspection-defect-detail";

export default async function InspectionDefectDetailPage({
  params,
}: {
  params: Promise<{ defectId: string }>;
}) {
  const { defectId } = await params;
  return <InspectionDefectDetail defectId={defectId} />;
}
