import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

interface FormSwitchProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * FormSwitch component for toggle switches in forms.
 * Renders a labeled switch control with optional description in a bordered container.
 * Integrates with react-hook-form for state management.
 * 
 * @param {FormSwitchProps<T>} props - Component props
 * @param {Path<T>} props.name - Field name for form registration
 * @param {Control<T>} props.control - React Hook Form control object
 * @param {string} props.label - Label text for the switch
 * @param {string} props.description - Optional helper text displayed below the label
 * @param {boolean} props.disabled - Whether the switch is disabled
 * @param {string} props.className - Additional CSS classes
 */
export const FormSwitch = <T extends FieldValues>({
  control,
  label,
  name,
  description,
  disabled = false,
  className,
}: FormSwitchProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className={cn("flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm", className)}>
          <div className="space-y-0.5">
            <Label htmlFor={name} className="text-base font-medium">
              {label}
            </Label>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <Switch
            id={name}
            checked={field.value}
            onCheckedChange={field.onChange}
            disabled={disabled}
            aria-readonly={disabled}
          />
        </div>
      )}
    />
  );
};


