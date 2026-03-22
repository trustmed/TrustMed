"use client";

import * as React from "react";
import {
  FileText,
  History,
  Stethoscope,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileImage,
  Activity,
  SlidersHorizontal,
  Download,
} from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

type EventKind = "appointment" | "report";

interface HistoryEvent {
  id: string;
  kind: EventKind;
  title: string;
  date: string;
  doctorName: string;
  hospitalName: string;
  notes?: string;
  fileName?: string;
  categoryLabel?: string;
}

// Demo Data
const ALL_EVENTS: HistoryEvent[] = Array.from({ length: 40 }).map((_, i) => {
  const d = new Date(2025, Math.floor(i / 8), 20 - (i % 8));
  const isReport = i % 3 === 0;
  return {
    id: `evt-${i + 1}`,
    kind: isReport ? "report" : "appointment",
    title: isReport ? "Lab Report Received" : "General Checkup",
    date: format(d, "yyyy-MM-dd"),
    doctorName: isReport ? "Dr. Sarah Silva" : "Dr. Malik Perera",
    hospitalName: "City General Hospital",
    notes: isReport
      ? "Fasting glucose and lipid panel — routine follow-up. LDL slightly elevated; dietary adjustments recommended."
      : "Routine 6-month checkup. Blood pressure: 118/76 mmHg. Patient reports no issues with current medication.",
    fileName: isReport ? `lab-summary-${format(d, "yyyy-MM-dd")}.pdf` : undefined,
    categoryLabel: isReport ? "Lab Report" : "General",
  };
});

const PAGE_SIZE = 8;

// Stat Card

function StatCard({
  label,
  value,
  icon,
  accent,
  sublabel,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
  sublabel?: string;
}) {
  return (
    <div className="flex items-center gap-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm px-5 py-4 flex-1 min-w-0">
      <div className={cn("h-12 w-12 shrink-0 rounded-xl flex items-center justify-center", accent)}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight tabular-nums">
          {value}
        </p>
        <p className="text-xs font-medium text-neutral-500 mt-0.5">{label}</p>
        {sublabel && (
          <p className="text-[10px] text-neutral-400 mt-0.5">{sublabel}</p>
        )}
      </div>
    </div>
  );
}

// Event Row 

function EventRow({ event }: { event: HistoryEvent }) {
  const [open, setOpen] = React.useState(false);
  const isReport = event.kind === "report";

  return (
    <div
      className={cn(
        "border rounded-xl bg-white dark:bg-neutral-900 overflow-hidden transition-all duration-200",
        open
          ? "border-blue-200 dark:border-blue-900 shadow-[0_0_0_3px_rgba(219,234,254,0.5)] dark:shadow-[0_0_0_3px_rgba(30,58,138,0.2)]"
          : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-sm"
      )}
    >
      {/* Clickable Header Row */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-4 px-4 sm:px-5 py-3.5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors"
      >
        {/* Icon */}
        <div
          className={cn(
            "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center transition-transform duration-200",
            isReport
              ? "bg-emerald-50 dark:bg-emerald-900/20"
              : "bg-blue-50 dark:bg-blue-900/20",
            open && "scale-105"
          )}
        >
          {isReport ? (
            <FileText className="h-4.5 w-5 text-emerald-500 dark:text-emerald-400" />
          ) : (
            <Stethoscope className="h-5 w-5 text-blue-500 dark:text-blue-400" />
          )}
        </div>

        {/* Title + Doctor */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
            {event.title}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
            {event.doctorName}
            <span className="mx-1.5 opacity-40">·</span>
            {event.hospitalName}
          </p>
        </div>

        {/* Category Badge — enterprise style: 6px radius */}
        <span
          className={cn(
            "hidden sm:inline-flex shrink-0 items-center rounded-[6px] px-2.5 py-0.5 text-[11px] font-semibold",
            isReport
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
          )}
        >
          {event.categoryLabel}
        </span>

        {/* Date Column */}
        <div className="hidden md:flex flex-col items-end shrink-0 min-w-[72px]">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {format(new Date(event.date), "MMM d")}
          </span>
          <span className="text-[11px] text-neutral-400">
            {format(new Date(event.date), "yyyy")}
          </span>
        </div>

        {/* Chevron — bolder, tinted on hover */}
        <ChevronDown
          className={cn(
            "h-[18px] w-[18px] shrink-0 ml-2 transition-all duration-200",
            open
              ? "rotate-180 text-indigo-500"
              : "text-neutral-300 group-hover:text-neutral-500"
          )}
        />
      </button>

      {/* Expandable Detail Panel */}
      {open && (
        <div className="px-4 sm:px-5 pb-6 border-t border-neutral-100 dark:border-neutral-800">
          <div className="pt-4 flex flex-col gap-5">

            {/* Info Grid — Date only (Doctor+Hospital already visible in header) */}
            <div className="flex items-center gap-6">
              <div className="flex flex-col gap-0.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Date</p>
                <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                  {format(new Date(event.date), "MMMM d, yyyy")}
                </p>
              </div>
              {event.categoryLabel && (
                <div className="flex flex-col gap-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Type</p>
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{event.categoryLabel}</p>
                </div>
              )}
            </div>

            {/* Compact File Card */}
            {event.fileName && (
              <div className="inline-flex items-center gap-3 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 cursor-pointer hover:border-neutral-300 dark:hover:border-neutral-600 hover:bg-white dark:hover:bg-neutral-800 transition-all w-fit group/file">
                <div className="h-8 w-8 shrink-0 flex items-center justify-center rounded-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700">
                  {event.fileName.endsWith(".pdf") ? (
                    <FileText className="h-4 w-4 text-red-500" />
                  ) : (
                    <FileImage className="h-4 w-4 text-indigo-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-[180px]">{event.fileName}</p>
                  <p className="text-[11px] text-neutral-400">PDF · 2.4 MB</p>
                </div>
                <Download className="h-3.5 w-3.5 text-neutral-400 group-hover/file:text-neutral-700 dark:group-hover/file:text-neutral-300 transition-colors ml-1 shrink-0" />
              </div>
            )}

            {/* Doctor's Notes — thin accent bar, pale bg, spacious line-height */}
            {event.notes && (
              <div className="flex gap-3">
                <div className="w-[2px] shrink-0 bg-indigo-300 dark:bg-indigo-700 rounded-full" />
                <div className="flex flex-col gap-1.5 py-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                    Doctor&apos;s Notes
                  </p>
                  <p className="text-sm italic text-neutral-600 dark:text-neutral-400 leading-[1.75]">
                    &quot;{event.notes}&quot;
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

//  Pagination 

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Compute visible pages: always show first, last, current ±1
  const visible = pages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );
  // Insert ellipsis markers
  const withGaps: (number | "…")[] = [];
  let prev: number | null = null;
  for (const p of visible) {
    if (prev !== null && p - prev > 1) withGaps.push("…");
    withGaps.push(p);
    prev = p;
  }

  return (
    <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-800 mt-2">
      <p className="text-sm text-neutral-500">
        Page <span className="font-semibold text-neutral-900 dark:text-neutral-100">{page}</span> of{" "}
        <span className="font-semibold text-neutral-900 dark:text-neutral-100">{totalPages}</span>
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg border-neutral-200 dark:border-neutral-700"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {withGaps.map((p, idx) =>
          p === "…" ? (
            <span key={`gap-${idx}`} className="px-1 text-sm text-neutral-400 select-none">
              …
            </span>
          ) : (
            <Button
              key={p}
              variant={page === p ? "default" : "outline"}
              size="icon"
              className={cn(
                "h-8 w-8 rounded-lg text-sm font-medium",
                page === p
                  ? "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700"
                  : "border-neutral-200 dark:border-neutral-700"
              )}
              onClick={() => onPageChange(p as number)}
            >
              {p}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg border-neutral-200 dark:border-neutral-700"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

//Filter Tabs

const FILTER_TABS = [
  { label: "All", value: "all" },
  { label: "Appointments", value: "appointment" },
  { label: "Reports", value: "report" },
] as const;

type FilterValue = (typeof FILTER_TABS)[number]["value"];


export default function MedicalHistoryPage() {
  const [activeFilter, setActiveFilter] = React.useState<FilterValue>("all");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);

  const filtered = React.useMemo(() => {
    let items = ALL_EVENTS;
    if (activeFilter !== "all") items = items.filter((e) => e.kind === activeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.doctorName.toLowerCase().includes(q) ||
          (e.notes && e.notes.toLowerCase().includes(q))
      );
    }
    return items;
  }, [activeFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const pageItems = React.useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const resetPage = React.useCallback(() => setPage(1), []);

  const apptCount = ALL_EVENTS.filter((e) => e.kind === "appointment").length;
  const reportCount = ALL_EVENTS.filter((e) => e.kind === "report").length;

  const handleFilterChange = (v: FilterValue) => {
    setActiveFilter(v);
    resetPage();
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    resetPage();
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-neutral-950 w-full">
      <div className="container mx-auto max-w-4xl py-10 md:py-12 px-4 sm:px-6 flex flex-col gap-8">

        {/* Page Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Medical History
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1.5 text-sm">
              Complete log of your appointments and lab reports, newest first.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-400 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-1.5 shadow-sm mt-1.5 shrink-0">
            <SlidersHorizontal className="h-3 w-3" />
            <span>{ALL_EVENTS.length} total events</span>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <StatCard
            label="Total Events"
            value={ALL_EVENTS.length}
            icon={<Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
            accent="bg-indigo-50 dark:bg-indigo-900/30"
            sublabel="All time"
          />
          <StatCard
            label="Appointments"
            value={apptCount}
            icon={<Stethoscope className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
            accent="bg-blue-50 dark:bg-blue-900/30"
            sublabel="Checkups & visits"
          />
          <StatCard
            label="Reports Received"
            value={reportCount}
            icon={<FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
            accent="bg-emerald-50 dark:bg-emerald-900/30"
            sublabel="Lab results & scans"
          />
        </div>

        {/* Action Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm shrink-0">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleFilterChange(tab.value)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                  activeFilter === tab.value
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search events, doctors, notes..."
              value={search}
              onChange={handleSearch}
              className="pl-9 h-10 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm"
            />
          </div>
        </div>

        {/* Results Meta  */}
        {(search || activeFilter !== "all") && (
          <div className="flex items-center justify-between -mt-4">
            <p className="text-xs text-neutral-500">
              Showing{" "}
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                {filtered.length}
              </span>{" "}
              {filtered.length === 1 ? "result" : "results"}
            </p>
            <button
              type="button"
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              onClick={() => {
                setSearch("");
                setActiveFilter("all");
                resetPage();
              }}
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Event List */}
        <div className="flex flex-col gap-2.5">
          {pageItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 shadow-sm">
              <div className="mb-4 h-14 w-14 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                <History className="h-7 w-7 text-neutral-400" />
              </div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                No events found
              </h3>
              <p className="text-sm text-neutral-500 mt-1 max-w-xs">
                {search || activeFilter !== "all"
                  ? "Try adjusting your filters or search term."
                  : "Your medical events will appear here once recorded."}
              </p>
            </div>
          ) : (
            pageItems.map((event) => <EventRow key={event.id} event={event} />)
          )}
        </div>

        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(p) => {
            setPage(p);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </div>
    </div>
  );
}
