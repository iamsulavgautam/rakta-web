import React, { useEffect, useState } from "react";
import { DropletIcon, MessageSquare, UserPlus, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatsCard from "@/components/dashboard/StatsCard";
import DonorTable from "@/components/dashboard/DonorTable";
import { fetchBloodGroupCounts } from "@/services/donorService";

import {
  fetchDashboardStats,
  fetchTotalSmsSent,
} from "@/services/donorService"; // <-- ADD fetchTotalSmsSent
import { DashboardStats } from "@/types";
import { useToast } from "@/components/ui/use-toast";

export default function Dashboard() {
  const [bloodGroups, setBloodGroups] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBloodGroups = async () => {
      try {
        setIsLoading(true);
        const data = await fetchBloodGroupCounts();
        setBloodGroups(data);
      } catch (error) {
        console.error("Error fetching blood groups:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBloodGroups();
  }, []);
  const [stats, setStats] = useState<DashboardStats>({
    totalDonors: 0,
    recentDonors: [],
    totalSms: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);

        const [dashboardStats, totalSms] = await Promise.all([
          fetchDashboardStats(),
          fetchTotalSmsSent(), // <-- fetch real total SMS
        ]);

        setStats({
          ...dashboardStats,
          totalSms: totalSms,
        });
      } catch (error) {
        console.error("Error loading dashboard stats:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard statistics",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [toast]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of your blood donation management system
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            title="Total Donors"
            value={stats.totalDonors}
            icon={<Users />}
            description="Total registered donors in the system"
          />
          <StatsCard
            title="Recent Registrations"
            value={isLoading ? "..." : stats.recentDonors.length}
            icon={<UserPlus />}
            description="New donors in the last 30 days"
          />
          <StatsCard
            title="Total SMS Sent"
            value={stats.totalSms}
            icon={<MessageSquare />}
            description="SMS messages sent to donors"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Blood Group Distribution</CardTitle>
            <CardDescription>Number of donors by blood group</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-center py-6 gap-6">
            {Object.entries(bloodGroups).length > 0 ? (
              Object.entries(bloodGroups).map(([group, count]) => (
                <div key={group} className="flex flex-col items-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rakta-100 text-rakta-900 mb-1">
                    <DropletIcon className="h-8 w-8" />
                  </div>
                  <div className="text-sm font-medium">{group}</div>
                  <div className="text-2xl font-bold mt-1">
                    {isLoading ? "..." : count}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-1">
          <DonorTable
            donors={stats.recentDonors}
            title="Recent Donor Registrations"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
