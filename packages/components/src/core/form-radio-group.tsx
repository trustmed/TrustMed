"use client";

import React from "react";
import { Controller, Control, FieldValues } from "react-hook-form";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { cn } from "../lib/utils";

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
