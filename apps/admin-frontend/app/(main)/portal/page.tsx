"use client";

import { useState } from "react";
import { CalendarClock, FolderHeart, FileText, UserCog, Lightbulb } from "lucide-react";
import { SEED_APPOINTMENTS } from "@/lib/appointments/seed-data";
import type { MedicalRecord } from "@/types/medical-records";
import { useMedicalRecordControllerGetAllByAuthUserId } from "@/services/api/medical-records/medical-records";
import { getAuthUser } from "@/utils/auth";

import { StatCard } from "@/components/dashboard/stat-card";
import { UpcomingAppointments } from "@/components/dashboard/upcoming-appointments";
import { RecentRecords } from "@/components/dashboard/recent-records";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { ActivityChart } from "@/components/dashboard/activity-chart";

const HEALTH_TIPS = [
  "Regular health check-ups can help detect potential health issues early.",
  "Stay hydrated - aim for at least 8 glasses of water per day.",
  "Keep your medical records organized for quick access during emergencies.",
  "Don't skip scheduled appointments - consistency is key to good health.",
  "Ensure your vaccinations are up to date for preventive care.",
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {

  // const { data: user, isLoading: userLoading } = useAuthControllerGetMe();
  const [tipIndex] = useState(() => Math.floor(Math.random() * HEALTH_TIPS.length));

  const authUser = getAuthUser();
  const AUTHUSER_ID = authUser?.sub || '';

  const { data: recordsData, isLoading: recordsLoading } = useMedicalRecordControllerGetAllByAuthUserId(AUTHUSER_ID, {
    query: {
      enabled: !!AUTHUSER_ID,
    }
  });
  const records = (recordsData?.records as MedicalRecord[]) || [];

  const appointments = SEED_APPOINTMENTS;
  const upcomingCount = appointments.filter((a) => a.status !== "cancelled").length;
  const pendingCount = appointments.filter((a) => a.status === "pending").length;

  const firstName = authUser?.firstName ?? authUser?.email?.split("@")[0];

  // if (userLoading) {
  //   return (
  //     <div className="flex items-center justify-center h-64">
  //       <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
  //     </div>
  //   );
  // }

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-8">
      {/* Greeting Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
          {firstName ? `${getGreeting()}, ${firstName}` : "Dashboard Summary"}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Here&apos;s your health summary at a glance.
        </p>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={<CalendarClock className="h-5 w-5" />}
          label="Upcoming"
          value={upcomingCount}
          description="Active appointments"
          accent="indigo"
        />
        <StatCard
          icon={<FolderHeart className="h-5 w-5" />}
          label="Records"
          value={recordsLoading ? "—" : records.length}
          description="Medical records stored"
          accent="emerald"
        />
        <StatCard
          icon={<FileText className="h-5 w-5" />}
          label="Pending"
          value={pendingCount}
          description="Awaiting confirmation"
          accent="amber"
        />
        <StatCard
          icon={<UserCog className="h-5 w-5" />}
          label="Profile"
          value={authUser?.firstName && authUser?.lastName ? "100%" : "60%"}
          description="Profile completion"
          accent="rose"
        />
      </div>

      {/* Activity Chart */}
      <ActivityChart />

      {/* Two-Column Content */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <UpcomingAppointments appointments={appointments} />
        <RecentRecords records={records} />
      </div>

      {/* Health Tip */}
      <div className="flex items-start gap-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 px-5 py-4 dark:border-neutral-800 dark:bg-neutral-800/20">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/40">
          <Lightbulb className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <p className="text-[13px] font-medium text-neutral-600 dark:text-neutral-300">
            Health Tip
          </p>
          <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
            {HEALTH_TIPS[tipIndex]}
          </p>
        </div>
      </div>
    </div>
  );
}
