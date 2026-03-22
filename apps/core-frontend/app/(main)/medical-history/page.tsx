"use client";

import * as React from "react";
import { FileText, History, Stethoscope } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORY_LABELS, RecordCategory } from "@/types/medical-records";

const PAGE_SIZE = 10;

type HistoryKind = "appointment" | "report";

type MedicalHistoryRow = {
  id: string;
  kind: HistoryKind;
  title: string;
  date: string;
};

/** Hardcoded dataset: latest first (sorted by date desc). Only appointments & report received. */
const ALL_RECORDS: MedicalHistoryRow[] = [
  { id: "r-01", kind: "appointment", title: "Appointment", date: "2025-03-20" },
  { id: "r-02", kind: "report", title: "Report Received", date: "2025-03-19" },
  { id: "r-03", kind: "appointment", title: "Appointment", date: "2025-03-18" },
  { id: "r-04", kind: "report", title: "Report Received", date: "2025-03-17" },
  { id: "r-05", kind: "appointment", title: "Appointment", date: "2025-03-16" },
  { id: "r-06", kind: "report", title: "Report Received", date: "2025-03-15" },
  { id: "r-07", kind: "appointment", title: "Appointment", date: "2025-03-14" },
  { id: "r-08", kind: "report", title: "Report Received", date: "2025-03-13" },
  { id: "r-09", kind: "appointment", title: "Appointment", date: "2025-03-12" },
  { id: "r-10", kind: "report", title: "Report Received", date: "2025-03-11" },
  { id: "r-11", kind: "appointment", title: "Appointment", date: "2025-03-10" },
  { id: "r-12", kind: "report", title: "Report Received", date: "2025-03-09" },
  { id: "r-13", kind: "appointment", title: "Appointment", date: "2025-03-08" },
  { id: "r-14", kind: "report", title: "Report Received", date: "2025-03-07" },
  { id: "r-15", kind: "appointment", title: "Appointment", date: "2025-03-06" },
  { id: "r-16", kind: "report", title: "Report Received", date: "2025-03-05" },
  { id: "r-17", kind: "appointment", title: "Appointment", date: "2025-03-04" },
  { id: "r-18", kind: "report", title: "Report Received", date: "2025-03-03" },
  { id: "r-19", kind: "appointment", title: "Appointment", date: "2025-03-02" },
  { id: "r-20", kind: "report", title: "Report Received", date: "2025-03-01" },
  { id: "r-21", kind: "appointment", title: "Appointment", date: "2025-02-28" },
  { id: "r-22", kind: "report", title: "Report Received", date: "2025-02-27" },
  { id: "r-23", kind: "appointment", title: "Appointment", date: "2025-02-26" },
  { id: "r-24", kind: "report", title: "Report Received", date: "2025-02-25" },
  { id: "r-25", kind: "appointment", title: "Appointment", date: "2025-02-24" },
];

function rowIcon(kind: HistoryKind) {
  return kind === "appointment" ? (
    <Stethoscope className="h-4 w-4" aria-hidden />
  ) : (
    <FileText className="h-4 w-4" aria-hidden />
  );
}

export default function MedicalHistoryPage() {
  const dateFieldId = React.useId();
  /** `null` = default: all records, latest first, paginated by scroll. Set to `yyyy-MM-dd` to filter that day only. */
  const [dateFilter, setDateFilter] = React.useState<string | null>(null);
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);
  const [selectedId, setSelectedId] = React.useState<string>(ALL_RECORDS[0]?.id ?? "");
  const scrollRootRef = React.useRef<HTMLDivElement>(null);
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const loadLockRef = React.useRef(false);

  const filteredByDate = React.useMemo(() => {
    if (dateFilter == null) return ALL_RECORDS;
    return ALL_RECORDS.filter((x) => x.date === dateFilter);
  }, [dateFilter]);

  const visibleItems = React.useMemo(() => {
    if (dateFilter == null) return filteredByDate.slice(0, visibleCount);
    return filteredByDate;
  }, [dateFilter, filteredByDate, visibleCount]);

  const hasMore = dateFilter == null && visibleCount < ALL_RECORDS.length;

  const selectedItem = React.useMemo(
    () => visibleItems.find((x) => x.id === selectedId) ?? visibleItems[0],
    [visibleItems, selectedId]
  );

  React.useEffect(() => {
    if (visibleItems.length === 0) {
      setSelectedId("");
      return;
    }
    if (!visibleItems.some((x) => x.id === selectedId)) {
      setSelectedId(visibleItems[0].id);
    }
  }, [visibleItems, selectedId]);

  React.useEffect(() => {
    const root = scrollRootRef.current;
    const sentinel = sentinelRef.current;
    if (!root || !sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || loadLockRef.current) return;
        loadLockRef.current = true;
        setVisibleCount((c) => Math.min(c + PAGE_SIZE, ALL_RECORDS.length));
        window.setTimeout(() => {
          loadLockRef.current = false;
        }, 150);
      },
      { root, rootMargin: "0px 0px 80px 0px", threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, visibleCount]);

  const handleDateChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (!v) {
      setDateFilter(null);
      setVisibleCount(PAGE_SIZE);
      return;
    }
    setDateFilter(v);
  }, []);

  const clearDateFilter = React.useCallback(() => {
    setDateFilter(null);
    setVisibleCount(PAGE_SIZE);
  }, []);

  const showFilteredEmpty = dateFilter != null && filteredByDate.length === 0;

  return (
    <div className="relative container mx-auto max-w-6xl w-full py-6 md:py-8 flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Medical History</h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            By default, the latest events load first (scroll for more). Choose a date to see only
            events on that day.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[220px]">
          <Label htmlFor={dateFieldId}>Date</Label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              id={dateFieldId}
              type="date"
              value={dateFilter ?? ""}
              onChange={handleDateChange}
              className="h-10 sm:min-w-[200px]"
            />
            {dateFilter != null && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 shrink-0"
                onClick={clearDateFilter}
              >
                Show all
              </Button>
            )}
          </div>
        </div>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardContent className="p-4 md:p-6 flex flex-col gap-6">
          {showFilteredEmpty ? (
            <div className="flex flex-col items-center justify-center py-16 md:py-20 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <History className="h-7 w-7 text-muted-foreground" aria-hidden />
              </div>
              <h3 className="text-sm font-medium text-foreground">No events on this date</h3>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Try another date, or use &quot;Show all&quot; to return to the full timeline.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(280px,340px)_1fr] lg:items-start">
              <div className="flex min-h-0 flex-col gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Timeline
                  {dateFilter != null && (
                    <span className="ml-2 font-normal normal-case text-muted-foreground">
                      (filtered: {dateFilter})
                    </span>
                  )}
                </p>
                <div
                  ref={scrollRootRef}
                  className="relative max-h-[min(70vh,560px)] min-h-[280px] overflow-y-auto rounded-lg border border-neutral-200 bg-muted/20 pr-1 dark:border-neutral-700"
                >
                  <div className="relative pl-7 pr-2 py-3">
                    <div className="absolute left-[13px] top-3 bottom-3 w-px bg-border" />

                    <div className="space-y-1 pb-24">
                      {visibleItems.map((item) => {
                        const isActive = item.id === selectedId;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedId(item.id)}
                            className={cn(
                              "group relative flex w-full items-start gap-3 rounded-md px-2 py-2.5 text-left",
                              "transition-colors hover:bg-muted/80",
                              isActive && "bg-muted/90"
                            )}
                          >
                            <span
                              className={cn(
                                "absolute -left-7 top-2.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                                isActive
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-neutral-200 bg-background text-neutral-500 group-hover:bg-muted dark:border-neutral-700"
                              )}
                            >
                              {rowIcon(item.kind)}
                            </span>

                            <div className="min-w-0 flex-1">
                              <div
                                className={cn(
                                  "text-sm font-medium",
                                  isActive
                                    ? "text-neutral-900 dark:text-neutral-100"
                                    : "text-neutral-700 dark:text-neutral-300"
                                )}
                              >
                                {item.title}
                              </div>
                              <div className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                                {item.date}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {hasMore && (
                      <div
                        ref={sentinelRef}
                        className="flex h-10 items-center justify-center py-2"
                        aria-hidden
                      >
                        <span className="text-xs text-muted-foreground">Scroll for more…</span>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {dateFilter == null ? (
                    <>
                      Showing {visibleItems.length} of {ALL_RECORDS.length}
                      {hasMore ? " · scroll to load more" : ""}
                    </>
                  ) : (
                    <>
                      {visibleItems.length} event{visibleItems.length !== 1 ? "s" : ""} on{" "}
                      {dateFilter}
                    </>
                  )}
                </p>
              </div>

              <DetailsCard selectedItem={selectedItem} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/** Demo values aligned with appointments table + AppointmentFormDialog fields. */
const DEMO_APPOINTMENT = {
  appointmentNo: "D014",
  appointmentType: "General",
  doctor: "Dr. Malik Perera",
  hospitalLocation: "City General Hospital",
  address: "42 Flower Road, Colombo 07",
  phone: "+94 77 123 4567",
  email: "patient@example.com",
};

/** Demo values aligned with UploadRecordModal / MedicalRecord fields. */
const DEMO_RECORD = {
  categoryLabel: CATEGORY_LABELS[RecordCategory.LAB_REPORT],
  doctorName: "Dr. Malik Perera",
  hospitalName: "City General Hospital",
  notes: "Fasting glucose and lipid panel — routine follow-up.",
  fileName: "lab-summary-2025-03-19.pdf",
};

function DetailsCard({ selectedItem }: { selectedItem?: MedicalHistoryRow }) {
  const isReport = selectedItem?.kind === "report";

  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
      <div className="border-b border-neutral-200 px-6 py-4 dark:border-neutral-700">
        <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          {selectedItem ? `${selectedItem.title} — ${selectedItem.date}` : "—"}
        </div>
      </div>

      <div className="px-6 py-5 text-sm text-neutral-900 dark:text-neutral-100">
        {isReport ? (
          <div className="grid grid-cols-[minmax(140px,180px)_1fr] gap-y-3 sm:grid-cols-[180px_1fr]">
            <LabelValue label="Category" value={DEMO_RECORD.categoryLabel} />
            <LabelValue label="Date of Record" value={selectedItem?.date ?? "—"} />
            <LabelValue label="Doctor Name" value={DEMO_RECORD.doctorName} />
            <LabelValue label="Hospital Name" value={DEMO_RECORD.hospitalName} />
            <LabelValue label="Notes" value={DEMO_RECORD.notes} />
            <LabelValue label="File name" value={DEMO_RECORD.fileName} />
          </div>
        ) : (
          <div className="grid grid-cols-[minmax(140px,180px)_1fr] gap-y-3 sm:grid-cols-[180px_1fr]">
            <LabelValue label="Appointment no" value={DEMO_APPOINTMENT.appointmentNo} />
            <LabelValue label="Date" value={selectedItem?.date ?? "—"} />
            <LabelValue label="Hospital location" value={DEMO_APPOINTMENT.hospitalLocation} />
            <LabelValue label="Address" value={DEMO_APPOINTMENT.address} />
            <LabelValue label="Phone number" value={DEMO_APPOINTMENT.phone} />
            <LabelValue label="Email" value={DEMO_APPOINTMENT.email} />
            <LabelValue label="Doctor" value={DEMO_APPOINTMENT.doctor} />
            <LabelValue label="Appointment type" value={DEMO_APPOINTMENT.appointmentType} />
          </div>
        )}
      </div>
    </div>
  );
}

function LabelValue({ label, value }: { label: string; value: string }) {
  return (
    <>
      <div className="text-neutral-600 dark:text-neutral-400">{label}</div>
      <div>
        <span className="mr-2 text-neutral-400 dark:text-neutral-500">:</span>
        {value}
      </div>
    </>
  );
}
