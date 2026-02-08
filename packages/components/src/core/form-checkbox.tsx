import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { cn } from "../lib/utils";

interface FormCheckboxProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  description?: string;
  className?: string;
}

export const FormCheckbox = <T extends FieldValues>({
  name,
  control,
  label,
  description,
  className,
}: FormCheckboxProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <div className={cn("space-y-2", className)}>
          <div className="flex flex-row items-start space-x-3 space-y-0 p-1">
            <Checkbox
              id={name}
              checked={value}
              onCheckedChange={onChange}
            />
            <div className="space-y-1 leading-none">
              <Label htmlFor={name} className="cursor-pointer">
                {label}
              </Label>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          {error && (
            <p className="text-sm font-medium text-destructive">
              {error.message}
            </p>
          )}
        </div>
      )}
    />
  );
};
