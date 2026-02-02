"use client";

import React from "react";
import { Controller, Control, FieldValues } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

interface Option {
  label: string;
  value: string;
}

interface FormRadioGroupProps {
  control: Control<FieldValues>;
  name: string;
  label?: string;
  options: Option[];
  defaultValue?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

/**
 * FormRadioGroup component for radio button groups in forms.
 * Renders a group of radio buttons with optional label and validation.
 * Integrates with react-hook-form for state management and validation.
 * 
 * @param {FormRadioGroupProps} props - Component props
 * @param {Control<FieldValues>} props.control - React Hook Form control object
 * @param {string} props.name - Field name for form registration
 * @param {string} props.label - Optional label text
 * @param {Option[]} props.options - Array of radio options with label and value
 * @param {string} props.defaultValue - Default selected value
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.required - Whether the field is required (shows asterisk)
 * @param {boolean} props.disabled - Whether the radio group is disabled
 */
export const FormRadioGroup: React.FC<FormRadioGroupProps> = ({
  control,
  name,
  label,
  options,
  defaultValue,
  className,
  required = false,
  disabled = false,
}) => {
  return (
    <div className={cn("space-y-3", className)}>
      {label && <Label className={cn(required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>{label}</Label>}
      <Controller
        name={name}
        control={control}
        defaultValue={defaultValue}
        rules={{ required: required ? `${label || name} is required` : false }}
        render={({ field, fieldState: { error } }) => (
          <>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
              disabled={disabled}
            >
              {options.map((option) => (
                <div key={option.value} className="flex items-center space-x-3 space-y-0">
                  <RadioGroupItem value={option.value} id={`${name}-${option.value}`} />
                  <Label htmlFor={`${name}-${option.value}`} className="font-normal cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {error && <p className="text-sm text-red-500">{error.message}</p>}
          </>
        )}
      />
    </div>
  );
};
