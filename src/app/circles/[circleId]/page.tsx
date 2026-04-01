import { CircleDashboard } from "@/components/circle/circle-dashboard";
import { fetchCircleDashboard } from "@/lib/internal-api";

type CirclePageProps = {
  params: Promise<{
    circleId: string;
  }>;
};

export default async function CirclePage({ params }: CirclePageProps) {
  const { circleId } = await params;
  const dashboard = await fetchCircleDashboard(circleId);

  return <CircleDashboard dashboard={dashboard} />;
}
