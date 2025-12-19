import { Field } from "@base-ui/react/field";
import { Fieldset as BaseFieldset } from "@base-ui/react/fieldset";
import { Radio as BaseRadio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";

import { InfoPopover } from "~/ui/popover";

export default function RadioGroup({
  name,
  label,
  options,
  required,
  errors,
  defaultValue,
  id,
  info,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: {
  name: string;
  label: string;
  options: Array<{ label: string; value: string }>;
  required?: boolean;
  info?: string;
  errors?: string[];
  defaultValue?: string;
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}) {
  return (
    <Field.Root name={name} render={<BaseFieldset.Root />}>
      <BaseFieldset.Legend className="flex items-center font-medium">
        {label}
        {required && <span className="text-red-500">*</span>}
        {info && (
          <span className="ml-1.5 shrink-0">
            <InfoPopover content={info} />
          </span>
        )}
      </BaseFieldset.Legend>
      <BaseRadioGroup
        name={name}
        id={id}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        defaultValue={defaultValue}
        className="flex flex-col items-start gap-1"
      >
        {options.map((option) => (
          <Field.Item key={option.value}>
            <Field.Label className="flex items-center gap-2">
              <BaseRadio.Root
                value={option.value}
                className="flex size-5 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 data-unchecked:border data-unchecked:border-gray-300 data-checked:bg-blue-600"
              >
                <BaseRadio.Indicator className="flex before:size-2 before:rounded-full before:bg-gray-50 data-unchecked:hidden" />
              </BaseRadio.Root>
              {option.label}
            </Field.Label>
          </Field.Item>
        ))}
      </BaseRadioGroup>
      <Field.Error match className="mt-1 text-red-500 text-sm">
        {errors?.[0]}
      </Field.Error>
    </Field.Root>
  );
}
