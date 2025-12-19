import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { Field } from "@base-ui/react/field";
import { useId } from "react";

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

function ClearIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

function ChevronDownIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export default function Combobox({
  name,
  label,
  options,
  required,
  placeholder = "Type to search...",
  errors,
  defaultValue,
  id: providedId,
  info,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: {
  name: string;
  label: string;
  options: Array<{ label: string; value: string }>;
  required?: boolean;
  info?: string;
  placeholder?: string;
  errors?: string[];
  defaultValue?: string;
  id?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}) {
  const generatedId = useId();
  const id = providedId || generatedId;

  return (
    <Field.Root name={name}>
      <BaseCombobox.Root
        name={name}
        items={options.map((opt) => opt.value)}
        defaultValue={defaultValue}
      >
        <div className="relative flex flex-col gap-1 font-medium text-sm leading-5">
          <Field.Label htmlFor={id} className="flex items-center">
            {label}
            {required && <span className="text-red-500">*</span>}
            {info && (
              <span className="ml-1.5 shrink-0">
                <InfoPopover content={info} />
              </span>
            )}
          </Field.Label>
          <BaseCombobox.Input
            placeholder={placeholder}
            id={id}
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedBy}
            className="focus:-outline-offset-1 h-10 w-full rounded-md border border-gray-200 bg-[canvas] pl-3.5 font-normal text-base focus:outline-2 focus:outline-blue-500"
          />
          <div className="absolute right-2 bottom-0 flex h-10 items-center justify-center text-gray-600">
            <BaseCombobox.Clear
              className="flex h-10 w-6 items-center justify-center rounded bg-transparent p-0"
              aria-label="Clear selection"
            >
              <ClearIcon className="size-4" />
            </BaseCombobox.Clear>
            <BaseCombobox.Trigger
              className="flex h-10 w-6 items-center justify-center rounded bg-transparent p-0"
              aria-label="Open popup"
            >
              <ChevronDownIcon className="size-4" />
            </BaseCombobox.Trigger>
          </div>
        </div>

        <BaseCombobox.Portal>
          <BaseCombobox.Positioner className="outline-none" sideOffset={4}>
            <BaseCombobox.Popup className="dark:-outline-offset-1 max-h-[min(var(--available-height),23rem)] w-(--anchor-width) max-w-(--available-width) origin-(--transform-origin) scroll-pt-2 scroll-pb-2 overflow-y-auto overscroll-contain rounded-md bg-[canvas] py-2 shadow-gray-200 shadow-lg outline-1 outline-gray-200 transition-[transform,scale,opacity] data-ending-style:scale-95 data-starting-style:scale-95 data-ending-style:opacity-0 data-starting-style:opacity-0 dark:shadow-none dark:outline-gray-300">
              <BaseCombobox.Empty className="px-4 py-2 text-[0.925rem] text-gray-600 leading-4 empty:m-0 empty:p-0">
                No items found.
              </BaseCombobox.Empty>
              <BaseCombobox.List>
                {(item: string) => {
                  const option = options.find((opt) => opt.value === item);
                  return (
                    <BaseCombobox.Item
                      key={item}
                      value={item}
                      className="grid cursor-default select-none grid-cols-[0.75rem_1fr] items-center gap-2 py-2 pr-8 pl-4 text-base leading-4 outline-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-gray-50 data-highlighted:before:absolute data-highlighted:before:inset-x-2 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:rounded-sm data-highlighted:before:bg-blue-600"
                    >
                      <BaseCombobox.ItemIndicator className="col-start-1">
                        <CheckIcon className="size-3" />
                      </BaseCombobox.ItemIndicator>
                      <div className="col-start-2">{option?.label || item}</div>
                    </BaseCombobox.Item>
                  );
                }}
              </BaseCombobox.List>
            </BaseCombobox.Popup>
          </BaseCombobox.Positioner>
        </BaseCombobox.Portal>
      </BaseCombobox.Root>
      <Field.Error match className="mt-1 text-red-500 text-sm">
        {errors?.[0]}
      </Field.Error>
    </Field.Root>
  );
}
