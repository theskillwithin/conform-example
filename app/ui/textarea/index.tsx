import { Field as BaseField } from "@base-ui/react/field";
import { useEffect, useRef } from "react";

import { cn } from "~/utils/cn";

import { InfoPopover } from "~/ui/popover";

export default function Textarea({
  name,
  label,
  required,
  errors,
  value,
  onChange,
  onValueChange,
  placeholder,
  autoComplete,
  defaultValue,
  id,
  rows = 4,
  disabled,
  autoGrow = true,
  info,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: {
  name: string;
  label: string;
  required?: boolean;
  errors?: string[];
  info?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  defaultValue?: string;
  id?: string;
  rows?: number;
  disabled?: boolean;
  autoGrow?: boolean;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!autoGrow) return;
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [autoGrow]);

  return (
    <BaseField.Root name={name}>
      <BaseField.Label htmlFor={id || name} className="flex items-center">
        {label}
        {required && <span className="text-red-500">*</span>}
        {info && (
          <span className="ml-1.5 shrink-0">
            <InfoPopover content={info} />
          </span>
        )}
      </BaseField.Label>
      <BaseField.Control
        id={id || name}
        name={name}
        required={required}
        defaultValue={defaultValue}
        value={value}
        onValueChange={onValueChange}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        render={(props) => (
          <textarea
            {...props}
            ref={textareaRef}
            rows={rows}
            placeholder={placeholder}
            autoComplete={autoComplete}
            disabled={disabled}
            onChange={(e) => {
              props.onChange?.(e);
              onChange?.(e);
              if (autoGrow) {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = `${el.scrollHeight}px`;
              }
            }}
            className={cn(
              "w-full max-w-64 resize-none rounded-md border bg-white px-3.5 py-2.5 text-base placeholder:text-gray-500",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0",
              "disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500",
              errors?.[0] ? "border-2 border-red-500" : "border-gray-200",
            )}
          />
        )}
      />
      <BaseField.Error match className="text-red-500 text-sm mt-1">{errors?.[0]}</BaseField.Error>
    </BaseField.Root>
  );
}
