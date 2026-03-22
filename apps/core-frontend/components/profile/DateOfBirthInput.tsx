import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format, parseISO, isValid } from "date-fns";

interface DateOfBirthInputProps {
    value?: Date;
    onChange: (date: Date | undefined) => void;
    className?: string;
}

export function DateOfBirthInput({ value, onChange, className }: DateOfBirthInputProps) {
    // Format the date for the HTML5 input (YYYY-MM-DD)
    const dateString = value && isValid(value) ? format(value, "yyyy-MM-dd") : "";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (!val) {
            onChange(undefined);
            return;
        }
        
        const parsed = parseISO(val);
        
        // Ensure the parsed date makes sense and isn't a partial input glitch
        if (isValid(parsed) && parsed.getFullYear() > 1900 && parsed.getFullYear() <= new Date().getFullYear() + 1) {
            // we create a local date at noon so timezone shifts don't bump the day
            onChange(new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 12, 0, 0));
        }
    };

    return (
        <Input
            type="date"
            value={dateString}
            onChange={handleChange}
            className={cn("w-full appearance-none", className)}
            max={new Date().toISOString().split("T")[0]}
        />
    );
}
