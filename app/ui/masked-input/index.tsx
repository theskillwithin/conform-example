import type { MaskType } from "~/services/form/config.server";

import Input from "~/ui/input";

const applyMask = (value: string, maskType: MaskType) => {
  switch (maskType) {
    case "ein": {
      const digits = value.replace(/\D/g, "").slice(0, 9);
      if (digits.length <= 2) return digits;
      return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    }
    case "zipcode": {
      return value.replace(/\D/g, "").slice(0, 5);
    }
    case "phone": {
      const digits = value.replace(/\D/g, "");
      if (digits.length <= 3) return digits.length > 0 ? `(${digits}` : digits;
      if (digits.length <= 6)
        return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
    default:
      return value;
  }
};

export default function MaskedInput({
  name,
  label,
  maskType,
  required,
  errors,
  placeholder,
  autoComplete,
  defaultValue,
  id,
  info,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: {
  name: string;
  label: string;
  maskType: MaskType;
  required?: boolean;
  errors?: string[];
  info?: string;
  placeholder?: string;
  autoComplete?: string;
  defaultValue?: string;
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const maskedValue = applyMask(rawValue, maskType);

    // If the value changed after masking, update it synchronously
    // This prevents invalid values from reaching Conform's validation
    if (maskedValue !== rawValue) {
      // Use the native setter to update the value
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      )?.set;
      nativeInputValueSetter?.call(e.target, maskedValue);

      // Create a new input event with the masked value for Conform's onInput validation
      const inputEvent = new Event("input", {
        bubbles: true,
        cancelable: true,
      });
      e.target.dispatchEvent(inputEvent);
    }
  };

  const handleValueChange = (newValue: string) => {
    // Apply mask - BaseUI will use this value
    const maskedValue = applyMask(newValue, maskType);
    // Return the masked value so BaseUI/Conform receives it
    return maskedValue;
  };

  return (
    <Input
      name={name}
      label={label}
      type="text"
      required={required}
      errors={errors}
      placeholder={placeholder}
      autoComplete={autoComplete}
      defaultValue={
        defaultValue ? applyMask(defaultValue, maskType) : undefined
      }
      onChange={handleChange}
      onValueChange={handleValueChange}
      id={id}
      info={info}
      aria-invalid={ariaInvalid}
      aria-describedby={ariaDescribedBy}
    />
  );
}
