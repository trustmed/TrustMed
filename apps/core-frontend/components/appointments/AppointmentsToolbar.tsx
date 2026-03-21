"use client";

import { useState } from "react";
import type { AppointmentStatus } from "@/lib/appointments/types";
import { Button } from "@/components/ui/button";
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
import { Filter, Plus, Search } from "lucide-react";
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
}: AppointmentsToolbarProps) {
    const [filterOpen, setFilterOpen] = useState(false);
    const filterActive = statusFilter !== "all";

    return (
        <div
            className={cn(
                "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
                className
            )}
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-1 sm:min-w-0 sm:gap-3">
                <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className={cn(
                                "h-10 shrink-0 justify-center gap-2 rounded-md border-border bg-background px-4 font-medium text-foreground shadow-none hover:bg-muted/60",
                                filterActive && "border-primary ring-1 ring-primary/30"
                            )}
                            aria-expanded={filterOpen}
                            aria-haspopup="dialog"
                        >
                            <Filter className="h-4 w-4" aria-hidden />
                            Filter
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72" align="start">
                        <div className="space-y-2">
                            <Label htmlFor="appointments-status-filter">Status</Label>
                            <Select
                                value={statusFilter}
                                onValueChange={(v) => {
                                    onStatusFilterChange(v as AppointmentStatusFilter);
                                    setFilterOpen(false);
                                }}
                            >
                                <SelectTrigger
                                    id="appointments-status-filter"
                                    className="h-10 w-full shadow-none"
                                >
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All statuses</SelectItem>
                                    <SelectItem value="accepted">Accepted</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </PopoverContent>
                </Popover>

                <div className="relative w-full sm:max-w-xl sm:flex-1">
                    <Search
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden
                    />
                    <Input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search by number, doctor, type, location, date..."
                        className="h-10 w-full rounded-md border-border pl-9 shadow-none"
                        aria-label="Search appointments"
                    />
                </div>
            </div>

            <Button
                type="button"
                onClick={onAddClick}
                className="h-10 shrink-0 gap-2 rounded-md px-4 font-semibold"
            >
                <Plus className="h-4 w-4" aria-hidden />
                Add appointment
            </Button>
        </div>
    );
}
