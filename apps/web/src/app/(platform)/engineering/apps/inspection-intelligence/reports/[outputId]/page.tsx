import { InspectionReportDetail } from "@/components/engineering/inspection-report-detail";

export default async function InspectionReportDetailPage({
  params,
}: {
  params: Promise<{ outputId: string }>;
}) {
  const { outputId } = await params;
  return <InspectionReportDetail outputId={outputId} />;
}
