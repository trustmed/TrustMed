"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AppointmentsToolbarProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    onAddClick: () => void;
    onFilterClick?: () => void;
    filterActive?: boolean;
    className?: string;
}

export function AppointmentsToolbar({
    searchQuery,
    onSearchChange,
    onAddClick,
    onFilterClick,
    filterActive,
    className,
}: AppointmentsToolbarProps) {
    return (
        <div
            className={cn(
                "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4",
                className
            )}
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-1 sm:min-w-0 sm:gap-3">
                <Button
                    type="button"
                    variant="outline"
                    className={cn(
                        "h-10 shrink-0 justify-center gap-2 rounded-md border-border bg-background px-4 font-medium text-foreground shadow-none hover:bg-muted/60",
                        filterActive && "border-primary ring-1 ring-primary/30"
                    )}
                    onClick={onFilterClick}
                >
                    <Filter className="h-4 w-4" aria-hidden />
                    Filter
                </Button>

                <div className="relative w-full sm:max-w-xl sm:flex-1">
                    <Search
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden
                    />
                    <Input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search by appointment no, date..."
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
