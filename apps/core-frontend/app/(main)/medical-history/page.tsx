"use client";

import * as React from "react";
import { format } from "date-fns";
import { FileText, History, Stethoscope, Syringe, UserPlus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type MedicalHistoryItem = {
  id: string;
  title: string;
  date: string;
  icon: React.ReactNode;
};

const TIMELINE_ITEMS: MedicalHistoryItem[] = [
  {
    id: "visit-2025-11-30",
    title: "Appointment/Visit",
    date: "2025-11-30",
    icon: <Stethoscope className="h-4 w-4" />,
  },
  {
    id: "vaccinations-2025-11-15",
    title: "Vaccinations",
    date: "2025-11-15",
    icon: <Syringe className="h-4 w-4" />,
  },
  {
    id: "report-2025-11-15",
    title: "Report Received",
    date: "2025-11-15",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    id: "account-2025-11-10",
    title: "Account Creation",
    date: "2025-11-10",
    icon: <UserPlus className="h-4 w-4" />,
  },
];

export default function MedicalHistoryPage() {
  const dateFieldId = React.useId();
  const [selectedId, setSelectedId] = React.useState<string>(TIMELINE_ITEMS[0]?.id ?? "");
  const [selectedDateKey, setSelectedDateKey] = React.useState(() => format(new Date(), "yyyy-MM-dd"));

  const filteredItems = React.useMemo(
    () => TIMELINE_ITEMS.filter((x) => x.date === selectedDateKey),
    [selectedDateKey]
  );

  React.useEffect(() => {
    if (filteredItems.length === 0) {
      setSelectedId("");
      return;
    }
    if (!filteredItems.some((x) => x.id === selectedId)) {
      setSelectedId(filteredItems[0].id);
    }
  }, [filteredItems, selectedId]);

  const selectedItem = React.useMemo(
    () => filteredItems.find((x) => x.id === selectedId) ?? filteredItems[0],
    [filteredItems, selectedId]
  );

  const hasHistoryForSelectedDate = filteredItems.length > 0;

  return (
    <div className="relative container mx-auto max-w-6xl w-full py-6 md:py-8 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Medical History</h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            Browse your health timeline and event details by date.
          </p>
        </div>

        <div className="w-full space-y-2 sm:w-auto sm:min-w-[200px]">
          <Label htmlFor={dateFieldId}>Date</Label>
          <Input
            id={dateFieldId}
            type="date"
            value={selectedDateKey}
            onChange={(e) => {
              const v = e.target.value;
              if (v) setSelectedDateKey(v);
            }}
            className="h-10"
          />
        </div>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardContent className="p-4 md:p-6 flex flex-col gap-6">
          {hasHistoryForSelectedDate ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
              <Timeline items={filteredItems} selectedId={selectedId} onSelect={setSelectedId} />
              <DetailsCard selectedItem={selectedItem} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 md:py-20 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <History className="h-7 w-7 text-muted-foreground" aria-hidden />
              </div>
              <h3 className="text-sm font-medium text-foreground">No history for this date</h3>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                No medical history has been recorded or is available.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Timeline({
  items,
  selectedId,
  onSelect,
}: {
  items: MedicalHistoryItem[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="relative">
      <div className="relative pl-7">
        <div className="absolute left-[13px] top-0 h-full w-px bg-border" />

        <div className="space-y-8">
          {items.map((item) => {
            const isActive = item.id === selectedId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className={cn(
                  "group relative flex w-full items-start gap-3 text-left",
                  "rounded-md px-2 py-1.5 transition-colors hover:bg-muted/60"
                )}
              >
                <span
                  className={cn(
                    "absolute -left-7 top-1.5 flex h-7 w-7 items-center justify-center rounded-full border",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-neutral-200 bg-background text-neutral-500 group-hover:bg-muted dark:border-neutral-700"
                  )}
                >
                  {item.icon}
                </span>

                <div className="min-w-0">
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
                  <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{item.date}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DetailsCard({ selectedItem }: { selectedItem?: MedicalHistoryItem }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
      <div className="border-b border-neutral-200 px-6 py-4 dark:border-neutral-700">
        <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          {selectedItem?.title ?? "—"} — {selectedItem?.date ?? "—"}
        </div>
      </div>

      <div className="px-6 py-5 text-sm text-neutral-900 dark:text-neutral-100">
        <div className="grid grid-cols-[160px_1fr] gap-y-3">
          <LabelValue label="Hospital Name" value="City General Hospital" />
          <LabelValue label="Doctor Name" value="Dr. Malik Perera" />
          <LabelValue label="Visit Type" value="In-person Consultation" />
          <LabelValue label="Reason for Visit" value="Routine health check and discussion." />
          <LabelValue
            label="Description"
            value="Routine consultation to review overall symptoms, and determine if further diagnostic testing is required."
          />
          <LabelValue label="Outcome" value="No immediate concerns; doctor recommended monitoring for 2 weeks." />
          <LabelValue label="Next Steps" value="Book follow-up appointment and complete lab tests before next visit." />
          <LabelValue label="Attachments" value="Doctor’s notes (PDF), Lab test order" />
        </div>
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

