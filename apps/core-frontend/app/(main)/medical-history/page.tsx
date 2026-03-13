"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, FileText, Loader2, Stethoscope, Syringe, UserPlus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  const [selectedId, setSelectedId] = React.useState<string>(TIMELINE_ITEMS[0]?.id ?? "");
  const [date, setDate] = React.useState<Date>(() => new Date());
  const [calendarMonth, setCalendarMonth] = React.useState<Date>(() => new Date());
  const [isDateLoading, setIsDateLoading] = React.useState(false);

  const handleDateSelect = React.useCallback((newDate: Date | undefined) => {
    if (newDate == null) return;
    setIsDateLoading(true);
    setDate(newDate);
    setCalendarMonth(newDate);
    setTimeout(() => setIsDateLoading(false), 800);
  }, []);

  React.useEffect(() => {
    setCalendarMonth(date);
  }, [date]);

  const selectedDateKey = React.useMemo(() => format(date, "yyyy-MM-dd"), [date]);

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
    <div className="relative w-full">
      {isDateLoading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-3 bg-background/90 backdrop-blur-sm">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Loading...</p>
        </div>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-base font-semibold text-foreground">Medical History</h1>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              className="h-10 min-w-[180px] justify-between gap-3 rounded-xl bg-secondary px-4 text-secondary-foreground shadow-sm hover:bg-secondary/90"
            >
              <span className={cn("truncate text-sm font-medium", !date && "opacity-90")}>
                {date ? format(date, "PPP") : "Select date"}
              </span>
              <CalendarIcon className="h-4 w-4 opacity-90" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-auto rounded-2xl border border-border bg-secondary p-0 text-secondary-foreground shadow-xl"
          >
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              month={calendarMonth}
              onMonthChange={setCalendarMonth}
              captionLayout="dropdown"
              fromYear={1990}
              toYear={new Date().getFullYear() + 1}
              initialFocus
              className="rounded-2xl"
              classNames={{
                caption_label: "hidden",
                nav: "hidden",
                // Weekday header (react-day-picker v9)
                weekdays: "grid grid-cols-7",
                weekday:
                  "flex h-9 w-9 items-center justify-center text-secondary-foreground/70 rounded-md font-normal text-[0.8rem]",
                // Weekday header (back-compat with older mappings)
                head_row: "flex",
                head_cell:
                  "flex h-9 w-9 items-center justify-center text-secondary-foreground/70 rounded-md font-normal text-[0.8rem]",
                cell:
                  "h-9 w-9 p-0 text-center text-sm relative focus-within:relative focus-within:z-20",
                day_selected:
                  "rounded-full bg-accent text-accent-foreground shadow-sm hover:bg-accent/90 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                day_today: "rounded-full bg-white/10 text-secondary-foreground",
                day_outside:
                  "day-outside text-secondary-foreground/50 opacity-60 aria-selected:bg-white/10 aria-selected:text-secondary-foreground/70 aria-selected:opacity-60",
                nav_button:
                  "h-7 w-7 bg-transparent p-0 text-secondary-foreground/80 hover:text-secondary-foreground hover:bg-white/10 rounded-md",
                dropdown:
                  "rounded-md border border-white/15 bg-secondary px-2 py-1 text-sm text-secondary-foreground shadow-sm outline-none focus:ring-2 focus:ring-ring/40",
                dropdown_month: "m-0",
                dropdown_year: "m-0",
                caption_dropdowns: "flex items-center gap-2",
                caption: "flex justify-center pt-1 items-center",
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      {hasHistoryForSelectedDate ? (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
          <Timeline items={filteredItems} selectedId={selectedId} onSelect={setSelectedId} />
          <DetailsCard selectedItem={selectedItem} />
        </div>
      ) : (
        <div className="flex min-h-[60vh] items-center justify-center px-6">
          <p className="text-center text-sm font-medium text-muted-foreground">
            No medical history has been recorded or is available.
          </p>
        </div>
      )}
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
                  "rounded-xl px-2 py-1 transition-colors hover:bg-muted/60"
                )}
              >
                <span
                  className={cn(
                    "absolute -left-7 top-1.5 flex h-7 w-7 items-center justify-center rounded-full border",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground/70 group-hover:bg-muted"
                  )}
                >
                  {item.icon}
                </span>

                <div className="min-w-0">
                  <div className={cn("text-sm font-medium", isActive ? "text-foreground" : "text-foreground/80")}>
                    {item.title}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{item.date}</div>
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
    <div className="rounded-2xl border border-border bg-background shadow-sm">
      <div className="border-b border-border px-6 py-4">
        <div className="text-sm font-semibold text-foreground">
          {selectedItem?.title ?? "—"} — {selectedItem?.date ?? "—"}
        </div>
      </div>

      <div className="px-6 py-5 text-sm text-foreground">
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
      <div className="text-foreground/80">{label}</div>
      <div className="text-foreground">
        <span className="mr-2 text-foreground/60">:</span>
        {value}
      </div>
    </>
  );
}

