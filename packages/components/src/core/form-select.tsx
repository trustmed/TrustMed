import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Label } from "../components/ui/label";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { cn } from "../lib/utils";

interface SelectOption<T extends string> {
  id: T;
  label: string;
}

interface FormSelectProps<T extends FieldValues, V extends string> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  options: SelectOption<V>[];
  required?: boolean;
  description?: string;
  className?: string;
  disabled?: boolean;
}

export const FormSelect = <T extends FieldValues, V extends string>({
  name,
  control,
  label,
  placeholder = "Select an option",
  options,
  required = false,
  description,
  className,
  disabled = false,
}: FormSelectProps<T, V>) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={{ required: required && "Required" }}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
         <div className={cn("flex flex-col gap-2", className)}>
          {label && (
            <Label htmlFor={name} className="text-sm font-medium text-gray-700">
              <span className="flex flex-row gap-1 items-center">
                {label}
                {required && <span className="text-red-500">*</span>}
              </span>
            </Label>
          )}
          <Select
            value={value}
            onValueChange={onChange}
            disabled={disabled}
          >
            <SelectTrigger
              id={name}
              className={cn("w-full", error && "border-red-500 focus:ring-red-500")}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && !error && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
        </div>
      )}
    />
  );
};
