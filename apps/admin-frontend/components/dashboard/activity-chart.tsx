"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Activity } from "lucide-react";

const CHART_DATA = [
  { month: "Jan", appointments: 2, records: 1 },
  { month: "Feb", appointments: 3, records: 2 },
  { month: "Mar", appointments: 5, records: 3 },
  { month: "Apr", appointments: 4, records: 1 },
  { month: "May", appointments: 6, records: 4 },
  { month: "Jun", appointments: 3, records: 2 },
];

interface TooltipEntry {
  value: number;
  dataKey: string;
  color: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}

function ChartTooltip({ active, payload, label }: Readonly<ChartTooltipProps>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
        {label}
      </p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            {entry.dataKey === "appointments" ? "Appointments" : "Records"}
            {": "}
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              {entry.value}
            </span>
          </p>
        </div>
      ))}
    </div>
  );
}

export function ActivityChart() {
  return (
    <div className="flex flex-col rounded-2xl border border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center gap-2.5 border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400">
          <Activity className="h-3.5 w-3.5" strokeWidth={2} />
        </div>
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
          Health Activity
        </h3>
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            <span className="text-xs text-neutral-400">Appointments</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-neutral-400">Records</span>
          </div>
        </div>
      </div>
      <div className="px-2 py-5">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={CHART_DATA} margin={{ top: 4, right: 20, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="gradAppointments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradRecords" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              vertical={false}
              strokeOpacity={0.6}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#9ca3af" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6b7280" }}
              allowDecimals={false}
              width={24}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{
                stroke: "#6366f1",
                strokeWidth: 1,
                strokeDasharray: "4 4",
                strokeOpacity: 0.5,
              }}
            />
            {/* type="monotone" gives the Bezier/organic smooth curve */}
            <Area
              type="monotone"
              dataKey="appointments"
              stroke="#6366f1"
              strokeWidth={2.5}
              fill="url(#gradAppointments)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2.5, fill: "#fff", stroke: "#6366f1" }}
            />
            <Area
              type="monotone"
              dataKey="records"
              stroke="#10b981"
              strokeWidth={2.5}
              fill="url(#gradRecords)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2.5, fill: "#fff", stroke: "#10b981" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
