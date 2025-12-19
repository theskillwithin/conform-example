import { Progress as BaseProgress } from "@base-ui/react/progress";

import { cn } from "~/utils/cn";

export function Progress({
  value,
  max = 100,
  min = 0,
  label,
  showValue = false,
  className,
  trackClassName,
  indicatorClassName,
  labelClassName,
  valueClassName,
  getAriaValueText,
  format,
  locale,
}: {
  value: number | null;
  max?: number;
  min?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
  trackClassName?: string;
  indicatorClassName?: string;
  labelClassName?: string;
  valueClassName?: string;
  getAriaValueText?: (
    formattedValue: string | null,
    value: number | null,
  ) => string;
  format?: Intl.NumberFormatOptions;
  locale?: Intl.LocalesArgument;
}) {
  return (
    <BaseProgress.Root
      value={value}
      min={min}
      max={max}
      getAriaValueText={getAriaValueText}
      format={format}
      locale={locale}
      className={cn("w-full", className)}
    >
      {label && (
        <div className="mb-2 flex justify-between text-sm">
          <BaseProgress.Label className={cn("text-gray-900", labelClassName)}>
            {label}
          </BaseProgress.Label>
          {showValue && (
            <BaseProgress.Value className={cn("text-gray-900", valueClassName)}>
              {(formattedValue, currentValue) =>
                currentValue !== null
                  ? `${currentValue} / ${max}`
                  : formattedValue
              }
            </BaseProgress.Value>
          )}
        </div>
      )}
      <BaseProgress.Track
        className={cn(
          "h-2 w-full overflow-hidden rounded-full bg-gray-200",
          trackClassName,
        )}
      >
        <BaseProgress.Indicator
          className={cn(
            "h-full bg-blue-600 transition-[width] duration-300 ease-in-out",
            indicatorClassName,
          )}
        />
      </BaseProgress.Track>
      {!label && showValue && (
        <BaseProgress.Value
          className={cn("mt-2 text-gray-900 text-sm", valueClassName)}
        >
          {(formattedValue, currentValue) =>
            currentValue !== null ? `${currentValue} / ${max}` : formattedValue
          }
        </BaseProgress.Value>
      )}
    </BaseProgress.Root>
  );
}
