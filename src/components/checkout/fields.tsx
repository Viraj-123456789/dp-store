"use client";

import { ChevronDown, CircleHelp, Search } from "lucide-react";
import { useId } from "react";

import { cn } from "@/lib/utils";

const shellClass =
  "relative flex items-center rounded-sm border bg-card transition-colors has-[input:focus]:shadow-ck-focus has-[input:focus]:outline-3 has-[input:focus]:outline-ck-accent/30 has-[select:focus]:shadow-ck-focus has-[select:focus]:outline-3 has-[select:focus]:outline-ck-accent/30";

function Shell({
  error,
  className,
  children,
}: {
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <div
        className={cn(
          shellClass,
          error
            ? "border-ck-error has-[input:focus]:border-ck-error has-[input:focus]:outline-ck-error/30"
            : "border-ck-border has-[input:focus]:border-ck-accent has-[select:focus]:border-ck-accent",
        )}
      >
        {children}
      </div>
      {error && <p className="mt-1.5 text-[14px] text-ck-error">{error}</p>}
    </div>
  );
}

interface TextFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "text" | "numeric" | "tel" | "email";
  icon?: "help" | "search";
  /** Custom element pinned to the right edge of the field (e.g. a submit arrow). */
  trailing?: React.ReactNode;
  className?: string;
}

/** Floating-label text input matching the hosted checkout. */
export function TextField({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
  inputMode,
  icon,
  trailing,
  className,
}: TextFieldProps) {
  const id = useId();

  return (
    <Shell error={error} className={className}>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        placeholder=" "
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "peer w-full min-w-0 bg-transparent px-2.5 py-3.5 font-system text-[14px] text-ck-text outline-none focus:pb-1.5 focus:pt-[21px] [&:not(:placeholder-shown)]:pb-1.5 [&:not(:placeholder-shown)]:pt-[21px]",
          (icon || trailing) && "pr-12",
        )}
      />
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-2.5 top-[15px] origin-left text-[14px] leading-[1.35] text-ck-muted transition-all duration-150 peer-focus:top-1.5 peer-focus:text-[12px] peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[12px]"
      >
        {label}
      </label>
      {trailing}
      {icon === "help" && (
        <CircleHelp aria-hidden size={18} strokeWidth={1.6} className="absolute right-3 text-ck-muted" />
      )}
      {icon === "search" && (
        <Search aria-hidden size={18} strokeWidth={1.6} className="absolute right-3 text-ck-muted" />
      )}
    </Shell>
  );
}

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  className?: string;
}

export function SelectField({ label, name, value, options, onChange, className }: SelectFieldProps) {
  const id = useId();

  return (
    <Shell className={className}>
      <label htmlFor={id} className="pointer-events-none absolute left-2.5 top-1.5 text-[12px] leading-[1.35] text-ck-muted">
        {label}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[47px] w-full appearance-none bg-transparent pb-1.5 pl-2.5 pr-[30px] pt-[21px] font-system text-[14px] text-ck-text outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden size={16} strokeWidth={1.8} className="pointer-events-none absolute right-3 text-ck-muted" />
    </Shell>
  );
}

interface CheckboxRowProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function CheckboxRow({ label, checked, onChange }: CheckboxRowProps) {
  const id = useId();

  return (
    <div className="flex items-center">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-[18px] flex-none cursor-pointer appearance-none rounded-[8px] border border-transparent bg-card shadow-[inset_0_0_0_1px_var(--ck-border)] checked:border-ck-accent checked:bg-ck-accent checked:shadow-none"
      />
      <label htmlFor={id} className="cursor-pointer pl-2.5 text-[14px]">
        {label}
      </label>
    </div>
  );
}

interface RadioRowProps {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
  className?: string;
}

/** A radio option row; the selected state tints the row and fills the radio with the accent. */
export function RadioRow({ name, value, checked, onChange, children, className }: RadioRowProps) {
  const id = useId();

  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-center gap-2.5 p-3.5 text-[14px] font-semibold",
        checked && "bg-ck-selected shadow-[inset_0_0_0_1px_var(--ck-accent)]",
        className,
      )}
    >
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className={cn(
          "size-[18px] flex-none appearance-none rounded-full bg-card",
          checked ? "border-[6px] border-ck-accent" : "border border-ck-border",
        )}
      />
      {children}
    </label>
  );
}
