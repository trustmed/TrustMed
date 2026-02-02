"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import React from "react";
import { Control, useController, FieldValues, Path } from "react-hook-form";

interface FormInputProps<T extends FieldValues> extends Omit<React.ComponentProps<"input">, "name"> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  errorMessage?: string;
  additionalClass?: string;
  StartIcon?: React.ElementType;
}

/**
 * FormInput component for text input fields in forms.
 * Renders a customizable input field with optional label, icon, and validation error display.
 * Integrates with react-hook-form for state management and validation.
 * 
 * @param {FormInputProps<T>} props - Component props
 * @param {Path<T>} props.name - Field name for form registration
 * @param {Control<T>} props.control - React Hook Form control object
 * @param {string} props.label - Optional label text
 * @param {string} props.errorMessage - Custom error message to display
 * @param {string} props.additionalClass - Additional CSS classes for the container
 * @param {React.ElementType} props.StartIcon - Optional icon component to display at the start of the input
 */
export const FormInput = <T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  type = "text",
  required = false,
  errorMessage,
  additionalClass,
  disabled,
  className,
  StartIcon,
  ...props
}: FormInputProps<T>) => {
  const { field, fieldState: { error } } = useController({
    name,
    control,
    rules: { required: required && "Required" },
  });

  return (
    <div className={cn("flex flex-col gap-2", additionalClass)}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-gray-700">
          <span className="flex flex-row gap-1 items-center">
            {label}
            {required && <span className="text-red-500">*</span>}
          </span>
        </label>
      )}
      <div className="relative">
        {StartIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <StartIcon className="h-4 w-4" />
          </div>
        )}
        <Input
          {...field}
          id={name}
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            "w-full",
            StartIcon && "pl-9",
            className
          )}
          aria-invalid={!!error || !!errorMessage}
          onChange={(e) => {
            field.onChange(e);
            props.onChange?.(e);
          }}
          {...props}
        />
      </div>
      {(error?.message || errorMessage) && (
        <p className="text-red-500 text-sm mt-1">{error?.message || errorMessage}</p>
      )}
    </div>
  );
};
