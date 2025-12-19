import { Field } from "@base-ui/react/field";
import { Switch as BaseSwitch } from "@base-ui/react/switch";

import { InfoPopover } from "~/ui/popover";

export default function Switch({
  name,
  label,
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
  required?: boolean;
  info?: string;
  errors?: string[];
  defaultValue?: string | boolean;
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}) {
  return (
    <Field.Root name={name} className="py-2">
      <Field.Label
        htmlFor={id || name}
        className="flex cursor-pointer items-center gap-3"
      >
        <BaseSwitch.Root
          id={id || name}
          name={name}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
          defaultChecked={defaultValue === "on"}
          uncheckedValue="off"
          className="-outline-offset-1 relative flex h-6 w-10 rounded-full bg-linear-to-r bg-position-[100%_0%] bg-size-[6.5rem_100%] from-35% from-gray-700 to-65% to-gray-200 bg-no-repeat p-px shadow-[inset_0_1.5px_2px] shadow-gray-200 outline outline-gray-200 transition-[background-position,box-shadow] duration-125 ease-[cubic-bezier(0.26,0.75,0.38,0.45)] before:absolute before:rounded-full before:outline-blue-500 before:outline-offset-2 focus-visible:before:inset-0 focus-visible:before:outline-2 active:bg-gray-100 data-checked:bg-position-[0%_0%] data-checked:from-blue-600 data-checked:to-blue-600 data-checked:active:from-blue-600 data-checked:active:to-blue-600 dark:from-gray-500 dark:shadow-black/75 dark:outline-white/15 dark:data-checked:shadow-none"
        >
          <BaseSwitch.Thumb className="aspect-square h-full rounded-full bg-white shadow-[0_0_1px_1px,0_1px_1px,1px_2px_4px_-1px] shadow-gray-100 transition-transform duration-150 data-checked:translate-x-4 dark:shadow-black/25" />
        </BaseSwitch.Root>
        <span className="flex items-center text-sm">
          {label}
          {required && <span className="text-red-500">*</span>}
          {info && (
            <span className="ml-1.5 shrink-0">
              <InfoPopover content={info} />
            </span>
          )}
        </span>
      </Field.Label>
      <Field.Error match className="text-red-500 text-sm mt-1">{errors?.[0]}</Field.Error>
    </Field.Root>
  );
}
