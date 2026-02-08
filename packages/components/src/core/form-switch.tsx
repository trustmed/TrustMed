import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { cn } from "../lib/utils";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

interface FormSwitchProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

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


