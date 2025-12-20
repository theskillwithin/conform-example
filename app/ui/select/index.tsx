import { Field } from "@base-ui/react/field";
import { Select as BaseSelect } from "@base-ui/react/select";

import { InfoPopover } from "~/ui/popover";

function ChevronUpDownIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      width="8"
      height="12"
      viewBox="0 0 8 12"
      fill="none"
      stroke="currentcolor"
      strokeWidth="1.5"
      {...props}
    >
      <path d="M0.5 4.5L4 1.5L7.5 4.5" />
      <path d="M0.5 7.5L4 10.5L7.5 7.5" />
    </svg>
  );
}

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

export default function Select({
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
  errors?: string[];
  info?: string;
  defaultValue?: string;
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}) {
  return (
    <Field.Root name={name}>
      <Field.Label
        id={`${name}-label`}
        htmlFor={id || name}
        className="flex items-center"
      >
        {label}
        {required && <span className="text-red-500">*</span>}
        {info && (
          <span className="ml-1.5 shrink-0">
            <InfoPopover content={info} />
          </span>
        )}
      </Field.Label>
      <BaseSelect.Root
        id={id || name}
        name={name}
        items={options}
        defaultValue={defaultValue}
      >
        <BaseSelect.Trigger
          aria-labelledby={`${name}-label`}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
          className="flex h-10 w-full cursor-default select-none items-center justify-between gap-3 rounded-md border border-gray-200 pr-3 pl-3.5 text-base hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:-outline-offset-1 data-popup-open:bg-gray-100"
        >
          <BaseSelect.Value />
          <BaseSelect.Icon className="flex">
            <ChevronUpDownIcon />
          </BaseSelect.Icon>
        </BaseSelect.Trigger>
        <BaseSelect.Portal>
          <BaseSelect.Positioner
            className="z-10 select-none outline-none"
            sideOffset={8}
          >
            <BaseSelect.Popup className="group origin-(--transform-origin) rounded-md bg-[canvas] bg-clip-padding shadow-gray-200 shadow-lg outline-1 outline-gray-200 transition-[transform,scale,opacity] data-side-none:data-starting-style:scale-100 data-side-none:data-starting-style:opacity-100 data-side-none:data-ending-style:transition-none data-side-none:data-starting-style:transition-none data-ending-style:scale-90 data-starting-style:scale-90 data-ending-style:opacity-0 data-starting-style:opacity-0 dark:shadow-none dark:outline-gray-300">
              <BaseSelect.List className="relative max-h-(--available-height) scroll-py-6 overflow-y-auto py-1">
                {options.map(({ label, value }) => (
                  <BaseSelect.Item
                    key={label}
                    value={value}
                    className="grid min-w-(--anchor-width) cursor-default select-none grid-cols-[0.75rem_1fr] items-center gap-2 pointer-coarse:py-2.5 py-2 pr-4 pl-2.5 pointer-coarse:text-[0.925rem] text-sm leading-4 outline-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-gray-50 data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:rounded-sm data-highlighted:before:bg-blue-600 group-data-side-none:min-w-[calc(var(--anchor-width)+1rem)] group-data-side-none:pr-12 group-data-side-none:text-base group-data-side-none:leading-4"
                  >
                    <BaseSelect.ItemIndicator className="col-start-1">
                      <CheckIcon className="size-3" />
                    </BaseSelect.ItemIndicator>
                    <BaseSelect.ItemText className="col-start-2">
                      {label}
                    </BaseSelect.ItemText>
                  </BaseSelect.Item>
                ))}
              </BaseSelect.List>
            </BaseSelect.Popup>
          </BaseSelect.Positioner>
        </BaseSelect.Portal>
      </BaseSelect.Root>
      <Field.Error match className="mt-1 text-red-500 text-sm">
        {errors?.[0]}
      </Field.Error>
    </Field.Root>
  );
}
