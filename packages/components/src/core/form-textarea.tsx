"use client";

import { Textarea } from "../components/ui/textarea";
import { cn } from "../lib/utils";
import React from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

interface FormTextareaProps<T extends FieldValues> extends Omit<React.ComponentProps<"textarea">, "name"> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  errorMessage?: string;
  additionalClass?: string;
}

export const FormTextarea = <T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  required = false,
  errorMessage,
  additionalClass,
  className,
  ...props
}: FormTextareaProps<T>) => {
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
      <Controller
        name={name}
        control={control}
        rules={{ required: required && "Required" }}
        render={({ field }) => (
          <Textarea
            {...field}
            id={name}
            placeholder={placeholder}
            className={cn("min-h-[120px] resize-y", className)}
            aria-invalid={!!errorMessage}
            onChange={(e) => {
              field.onChange(e);
              props.onChange?.(e);
            }}
            {...props}
          />
        )}
      />
      {errorMessage && <p className="text-red-500 text-sm mt-1">{errorMessage}</p>}
    </div>
  );
};
