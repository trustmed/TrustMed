"use client";

import React from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormPhoneInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  description?: string;
}

/**
 * FormPhoneInput component for phone number input in forms.
 * Renders an international phone input field with country code selector using react-phone-input-2.
 * Integrates with react-hook-form for validation and state management.
 * 
 * @param {FormPhoneInputProps<T>} props - Component props
 * @param {Path<T>} props.name - Field name for form registration
 * @param {Control<T>} props.control - React Hook Form control object
 * @param {string} props.label - Optional label text
 * @param {boolean} props.required - Whether the field is required (shows asterisk)
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.disabled - Whether the field is disabled
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.description - Helper text displayed below the input
 */
export const FormPhoneInput = <T extends FieldValues>({
  name,
  control,
  label,
  required = false,
  className,
  disabled = false,
  placeholder,
  description,
}: FormPhoneInputProps<T>) => {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <Label htmlFor={name} className={cn(required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
          {label}
        </Label>
      )}
      <Controller
        name={name}
        control={control}
        rules={{ required: required && "Phone number is required" }}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <div>
            <PhoneInput
              country={"us"}
              value={value}
              onChange={onChange}
              disabled={disabled}
              inputClass={cn(
                "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30",
                error && "border-red-500 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
              )}
              containerClass="w-full"
              placeholder={placeholder}
            />
             {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
             {error && <p className="text-sm text-red-500 mt-1">{error.message}</p>}
          </div>
        )}
      />
    </div>
  );
};
