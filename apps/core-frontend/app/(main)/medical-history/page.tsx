"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, FileText, Stethoscope, Syringe, UserPlus } from "lucide-react";

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

export default function MedicalHistoryPage() {
  const [selectedId, setSelectedId] = React.useState<string>(TIMELINE_ITEMS[0]?.id ?? "");
  const [date, setDate] = React.useState<Date>();

  const selectedItem = React.useMemo(
    () => TIMELINE_ITEMS.find((x) => x.id === selectedId) ?? TIMELINE_ITEMS[0],
    [selectedId]
  );

  return (
    <div className="w-full">
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
              onSelect={setDate}
              initialFocus
              className="rounded-2xl"
              classNames={{
                caption_label: "text-sm font-medium text-secondary-foreground",
                head_cell: "text-secondary-foreground/70 rounded-md w-9 font-normal text-[0.8rem]",
                day: "h-9 w-9 p-0 font-normal text-secondary-foreground hover:bg-white/10 aria-selected:opacity-100",
                day_selected:
                  "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-white/10 text-secondary-foreground",
                day_outside:
                  "day-outside text-secondary-foreground/50 opacity-60 aria-selected:bg-white/10 aria-selected:text-secondary-foreground/70 aria-selected:opacity-60",
                nav_button:
                  "h-7 w-7 bg-transparent p-0 text-secondary-foreground/80 hover:text-secondary-foreground hover:bg-white/10 rounded-md",
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
        <Timeline items={TIMELINE_ITEMS} selectedId={selectedId} onSelect={setSelectedId} />
        <DetailsCard selectedItem={selectedItem} />
      </div>
    </div>
  );
}

