import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { cn } from "@/lib/utils";

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

/**
 * FormSelect component for dropdown selection in forms.
 * Renders a select dropdown with customizable options and validation.
 * Integrates with react-hook-form for state management and validation.
 * 
 * @param {FormSelectProps<T, V>} props - Component props
 * @param {Path<T>} props.name - Field name for form registration
 * @param {Control<T>} props.control - React Hook Form control object
 * @param {string} props.label - Optional label text
 * @param {string} props.placeholder - Placeholder text when no option is selected
 * @param {SelectOption<V>[]} props.options - Array of selectable options with id and label
 * @param {boolean} props.required - Whether the field is required (shows asterisk)
 * @param {string} props.description - Helper text displayed below the select
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.disabled - Whether the select is disabled
 */
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
