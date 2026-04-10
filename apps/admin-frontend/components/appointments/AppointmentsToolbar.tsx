"use client";

import { useState } from "react";
import type { AppointmentStatus } from "@/lib/appointments/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export type AppointmentStatusFilter = AppointmentStatus | "all";

export interface AppointmentsToolbarProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    onAddClick: () => void;
    statusFilter: AppointmentStatusFilter;
    onStatusFilterChange: (value: AppointmentStatusFilter) => void;
    className?: string;
}

export function AppointmentsToolbar({
    searchQuery,
    onSearchChange,
    onAddClick,
    statusFilter,
    onStatusFilterChange,
    className,
}: Readonly<AppointmentsToolbarProps>) {
    const [filterOpen, setFilterOpen] = useState(false);
    const filterActive = statusFilter !== "all";

    return (
        <div
            className={cn(
                "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
                className
            )}
        >
            {/* Search + Filter group */}
            <div className="flex flex-1 items-center gap-2 sm:max-w-md">
                <div className="relative flex-1">
                    <Search
                        className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400"
                        aria-hidden
                    />
                    <Input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search appointments..."
                        className="h-9 rounded-lg border-neutral-200 bg-neutral-50 pl-8 text-sm shadow-none placeholder:text-neutral-400 focus-visible:border-neutral-400 focus-visible:bg-white dark:border-neutral-700 dark:bg-neutral-800/50"
                        aria-label="Search appointments"
                    />
                </div>

                <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                    <PopoverTrigger asChild>
                        <button
                            type="button"
                            className={cn(
                                "flex h-9 items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm font-medium text-neutral-600 transition-colors hover:bg-white dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-neutral-300",
                                filterActive && "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400"
                            )}
                            aria-expanded={filterOpen}
                        >
                            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
                            Filter
                            {filterActive && (
                                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white">
                                    1
                                </span>
                            )}
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-3" align="start" sideOffset={6}>
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Status</Label>
                            <Select
                                value={statusFilter}
                                onValueChange={(v) => {
                                    onStatusFilterChange(v as AppointmentStatusFilter);
                                    setFilterOpen(false);
                                }}
                            >
                                <SelectTrigger className="h-9 w-full text-sm shadow-none">
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All statuses</SelectItem>
                                    <SelectItem value="accepted">Accepted</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                            {filterActive && (
                                <button
                                    type="button"
                                    className="w-full rounded-md py-1 text-xs text-neutral-500 hover:text-neutral-700 transition-colors"
                                    onClick={() => { onStatusFilterChange("all"); setFilterOpen(false); }}
                                >
                                    Clear filter
                                </button>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Add appointment CTA */}
            <button
                type="button"
                onClick={onAddClick}
                className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg bg-linear-to-b from-indigo-500 to-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:from-indigo-400 hover:to-indigo-500 hover:shadow-md active:scale-[0.98]"
            >
                <Plus className="h-4 w-4" aria-hidden />
                Add appointment
            </button>
        </div>
    );
}
