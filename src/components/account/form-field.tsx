import { cn } from "@/lib/utils";

interface FormFieldProps extends Omit<React.ComponentProps<"input">, "onChange"> {
  label: string;
  error?: string;
  onValueChange: (value: string) => void;
}

/** Label-above text input matching the storefront's form style. */
export function FormField({ label, error, onValueChange, className, ...props }: FormFieldProps) {
  return (
    <label className={cn("block font-heading text-[13.5px] font-bold", className)}>
      {label}
      <input
        {...props}
        aria-invalid={Boolean(error)}
        onChange={(event) => onValueChange(event.target.value)}
        className={cn(
          "mt-1.5 block w-full rounded-md border-[1.5px] bg-card px-4 py-[13px] font-sans text-[15px] font-normal leading-[normal] focus:outline-2 focus:outline-primary-hover",
          error ? "border-destructive" : "border-border",
        )}
      />
      {error && <span className="mt-1 block font-sans text-[12.5px] font-normal text-destructive">{error}</span>}
    </label>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: readonly string[];
  onValueChange: (value: string) => void;
  className?: string;
}

export function FormSelect({ label, value, options, onValueChange, className }: SelectFieldProps) {
  return (
    <label className={cn("block font-heading text-[13.5px] font-bold", className)}>
      {label}
      <select
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        className="mt-1.5 block w-full rounded-md border-[1.5px] border-border bg-card px-4 py-[13px] font-sans text-[15px] font-normal leading-[normal] focus:outline-2 focus:outline-primary-hover"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
