"use client";

import * as React from "react";
import { Filter, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AppointmentsToolbarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onFilterClick?: () => void;
  onAddClick?: () => void;
};

export function AppointmentsToolbar({
  searchValue,
  onSearchChange,
  onFilterClick,
  onAddClick,
}: AppointmentsToolbarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="button"
          variant="outline"
          className="h-10 w-full justify-center gap-2 rounded-xl bg-background px-4 sm:w-auto"
          onClick={onFilterClick}
        >
          <Filter className="h-4 w-4" />
          Filter
        </Button>

        <div className="relative w-full lg:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-10 rounded-xl pl-9"
            placeholder="Search by Appointment No, Date..."
          />
        </div>
      </div>

      <Button
        type="button"
        className="h-10 w-full gap-2 rounded-xl bg-accent px-5 text-accent-foreground hover:bg-accent/90 sm:w-auto"
        onClick={onAddClick}
      >
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/15">
          <Plus className="h-4 w-4" />
        </span>
        Add Appointment
      </Button>
    </div>
  );
}

