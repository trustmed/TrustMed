"use client";

import * as React from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DateOfBirthInputProps {
    value?: Date;
    onChange: (date: Date | undefined) => void;
    className?: string;
}

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const DAYS = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
const CURRENT_YEAR = new Date().getFullYear();

export function DateOfBirthInput({ value, onChange, className }: DateOfBirthInputProps) {
    const [day, setDay] = React.useState<string>(value ? value.getDate().toString() : "");
    const [month, setMonth] = React.useState<string>(value ? value.getMonth().toString() : "");
    const [year, setYear] = React.useState<string>(value ? value.getFullYear().toString() : "");

    React.useEffect(() => {
        if (value) {
            setDay(value.getDate().toString());
            setMonth(value.getMonth().toString());
            setYear(value.getFullYear().toString());
        }
    }, [value]);

    const commit = (d: string, m: string, y: string) => {
        if (!d || !m || !y) return;
        const numY = parseInt(y);
        if (numY < 1900 || numY > CURRENT_YEAR) return;
        const date = new Date(numY, parseInt(m), parseInt(d), 12, 0, 0);
        if (!isNaN(date.getTime())) onChange(date);
    };

    const handleDayChange = (val: string) => { setDay(val); commit(val, month, year); };
    const handleMonthChange = (val: string) => { setMonth(val); commit(day, val, year); };
    const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setYear(val);
        commit(day, month, val);
    };

    return (
        <div className={cn("flex gap-2", className)}>
            {/* Day — 31 items, fast */}
            <Select value={day} onValueChange={handleDayChange}>
                <SelectTrigger className="w-[80px]">
                    <SelectValue placeholder="Day" />
                </SelectTrigger>
                <SelectContent>
                    {DAYS.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Month — 12 items, fast */}
            <Select value={month} onValueChange={handleMonthChange}>
                <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                    {MONTHS.map((m, i) => (
                        <SelectItem key={i} value={i.toString()}>{m}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Year — plain number input avoids 120-item dropdown render */}
            <Input
                type="number"
                placeholder="Year"
                value={year}
                min={1900}
                max={CURRENT_YEAR}
                onChange={handleYearChange}
                className="w-[90px]"
            />
        </div>
    );
}
