import { getDashboardStats, getUserUploads } from "@/app/actions/dashboard-actions";
import { DashboardTabs } from "./dashboard-tabs";

interface DashboardContentProps {
  userId: string;
  userEmail: string;
}

export async function DashboardContent({ userId, userEmail }: DashboardContentProps) {
  const [stats, uploads] = await Promise.all([
    getDashboardStats(userId),
    getUserUploads(userId),
  ]);

  return <DashboardTabs stats={stats} uploads={uploads} userEmail={userEmail} />;
}

