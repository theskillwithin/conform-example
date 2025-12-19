import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { CheckboxGroup as BaseCheckboxGroup } from "@base-ui/react/checkbox-group";
import { Field } from "@base-ui/react/field";
import { Fieldset as BaseFieldset } from "@base-ui/react/fieldset";

import { InfoPopover } from "~/ui/popover";

function CheckIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      fill="currentcolor"
      width="10"
      height="10"
      viewBox="0 0 10 10"
      {...props}
    >
      <path d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z" />
    </svg>
  );
}

export default function CheckboxGroup({
  name,
  label,
  options,
  required,
  errors,
  defaultValue,
  defaultOptions,
  id,
  info,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: {
  name: string;
  label: string;
  options: Array<{ label: string; value: string }>;
  required?: boolean;
  errors?: string[];
  info?: string;
  defaultValue?: string;
  defaultOptions?: string[];
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
      <BaseCheckboxGroup
        id={id}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        defaultValue={defaultOptions || (defaultValue ? [defaultValue] : [])}
        className="flex flex-col items-start gap-1"
      >
        {options.map((option) => (
          <Field.Item key={option.value}>
            <Field.Label className="flex items-center gap-2">
              <BaseCheckbox.Root
                value={option.value}
                className="flex size-5 items-center justify-center rounded-sm focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 data-unchecked:border data-unchecked:border-gray-300 data-checked:bg-blue-600"
              >
                <BaseCheckbox.Indicator className="flex text-gray-50 data-unchecked:hidden">
                  <CheckIcon className="size-3" />
                </BaseCheckbox.Indicator>
              </BaseCheckbox.Root>
              {option.label}
            </Field.Label>
          </Field.Item>
        ))}
      </BaseCheckboxGroup>
      <Field.Error match className="text-red-500 text-sm mt-1">{errors?.[0]}</Field.Error>
    </Field.Root>
  );
}
