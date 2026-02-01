"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormPasswordInputProps<T extends FieldValues> extends Omit<React.ComponentProps<"input">, "name"> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  errorMessage?: string;
  additionalClass?: string;
}

export const FormPasswordInput = <T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  required = false,
  errorMessage,
  additionalClass,
  className,
  ...props
}: FormPasswordInputProps<T>) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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
          <div className="relative">
            <Input
              {...field}
              id={name}
              type={showPassword ? "text" : "password"}
              placeholder={placeholder}
              className={cn("pr-10", className)}
              aria-invalid={!!errorMessage}
              onChange={(e) => {
                field.onChange(e);
                props.onChange?.(e);
              }}
              {...props}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={togglePasswordVisibility}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-500" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4 text-gray-500" aria-hidden="true" />
              )}
              <span className="sr-only">
                {showPassword ? "Hide password" : "Show password"}
              </span>
            </Button>
          </div>
        )}
      />
      {errorMessage && <p className="text-red-500 text-sm mt-1">{errorMessage}</p>}
    </div>
  );
};
