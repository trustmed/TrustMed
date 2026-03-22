import Link from "next/link";
import { CalendarClock } from "lucide-react";
import type { Appointment } from "@/lib/appointments/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface UpcomingAppointmentsProps {
  appointments: Appointment[];
}

const STATUS_PILL: Record<string, { bg: string; text: string; label: string }> = {
  accepted: {
    bg: "bg-emerald-500/10 dark:bg-emerald-400/10",
    text: "text-emerald-700 dark:text-emerald-400",
    label: "Confirmed",
  },
  pending: {
    bg: "bg-amber-400/10 dark:bg-amber-400/10",
    text: "text-amber-700 dark:text-amber-400",
    label: "Pending",
  },
  cancelled: {
    bg: "bg-neutral-200/60 dark:bg-neutral-700/40",
    text: "text-neutral-500 dark:text-neutral-400",
    label: "Cancelled",
  },
};

export function UpcomingAppointments({ appointments }: Readonly<UpcomingAppointmentsProps>) {
  const upcoming = appointments
    .filter((a) => a.status !== "cancelled")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="flex flex-col rounded-2xl border border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600/10 dark:bg-indigo-400/10">
            <CalendarClock className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" strokeWidth={2} />
          </div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
            Upcoming Appointments
          </h3>
        </div>
        <Link
          href="/appointments"
          className="text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400"
        >
          View all →
        </Link>
      </div>

      {upcoming.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <p className="text-sm text-neutral-400">No upcoming appointments</p>
        </div>
      ) : (
        <div className="px-3 pb-3">
          <div className="divide-y divide-neutral-100 rounded-xl bg-neutral-50/60 dark:divide-neutral-800 dark:bg-neutral-800/30">
            {upcoming.map((apt) => {
              const pill = STATUS_PILL[apt.status] ?? STATUS_PILL.pending;
              const dateObj = new Date(`${apt.date}T12:00:00`);
              return (
                <div
                  key={apt.id}
                  className="flex items-center gap-4 px-4 py-3.5 transition-colors first:rounded-t-xl last:rounded-b-xl hover:bg-neutral-100/60 dark:hover:bg-neutral-800/50"
                >
                  {/* Date badge — tinted background, no hard border */}
                  <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-indigo-600/8 dark:bg-indigo-400/10">
                    <span className="text-[9px] font-bold uppercase leading-none tracking-widest text-indigo-500 dark:text-indigo-400">
                      {format(dateObj, "MMM")}
                    </span>
                    <span className="text-[17px] font-extrabold leading-tight text-indigo-700 dark:text-indigo-300">
                      {format(dateObj, "dd")}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-neutral-900 dark:text-neutral-100">
                      {apt.doctorName}
                    </p>
                    <p className="truncate text-xs text-neutral-400 dark:text-neutral-500">
                      {apt.appointmentType} · {apt.hospitalLocation}
                    </p>
                  </div>

                  {/* Pill badge instead of just a dot */}
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                      pill.bg,
                      pill.text
                    )}
                  >
                    {pill.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
