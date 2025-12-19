import { Field as BaseField } from "@base-ui/react/field";

import { cn } from "~/utils/cn";

import { InfoPopover } from "~/ui/popover";

export default function Input({
  name,
  label,
  type = "text",
  required,
  errors,
  value,
  onChange,
  onValueChange,
  onBlur,
  placeholder,
  autoComplete,
  defaultValue,
  id,
  info,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  labelClassName,
  inputClassName,
}: {
  name: string;
  label: string;
  type?: "text" | "email" | "password" | "tel" | "url" | "number";
  required?: boolean;
  errors?: string[];
  info?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (value: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  autoComplete?: string;
  defaultValue?: string;
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  labelClassName?: string;
  inputClassName?: string;
}) {
  return (
    <BaseField.Root name={name}>
      <BaseField.Label
        htmlFor={id || name}
        className={cn("flex items-center", labelClassName)}
      >
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
        type={type}
        required={required}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        onValueChange={onValueChange}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        className={cn(
          "h-10 w-full rounded-md border bg-white px-3.5 text-base placeholder:text-gray-500",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0",
          errors?.[0] ? "border-2 border-red-500" : "border-gray-200",
          inputClassName,
        )}
      />
      <BaseField.Error match className="text-red-500 text-sm mt-1">{errors?.[0]}</BaseField.Error>
    </BaseField.Root>
  );
}
