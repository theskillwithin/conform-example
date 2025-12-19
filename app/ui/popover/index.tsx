import { Popover as BasePopover } from "@base-ui/react/popover";

import { cn } from "~/utils/cn";

function ArrowSvg(props: React.ComponentProps<"svg">) {
  return (
    <svg width="20" height="10" viewBox="0 0 20 10" fill="none" {...props}>
      <path
        d="M9.66437 2.60207L4.80758 6.97318C4.07308 7.63423 3.11989 8 2.13172 8H0V10H20V8H18.5349C17.5468 8 16.5936 7.63423 15.8591 6.97318L11.0023 2.60207C10.622 2.2598 10.0447 2.25979 9.66437 2.60207Z"
        className="fill-[canvas]"
      />
      <path
        d="M8.99542 1.85876C9.75604 1.17425 10.9106 1.17422 11.6713 1.85878L16.5281 6.22989C17.0789 6.72568 17.7938 7.00001 18.5349 7.00001L15.89 7L11.0023 2.60207C10.622 2.2598 10.0447 2.2598 9.66436 2.60207L4.77734 7L2.13171 7.00001C2.87284 7.00001 3.58774 6.72568 4.13861 6.22989L8.99542 1.85876Z"
        className="fill-gray-200 dark:fill-none"
      />
      <path
        d="M10.3333 3.34539L5.47654 7.71648C4.55842 8.54279 3.36693 9 2.13172 9H0V8H2.13172C3.11989 8 4.07308 7.63423 4.80758 6.97318L9.66437 2.60207C10.0447 2.25979 10.622 2.2598 11.0023 2.60207L15.8591 6.97318C16.5936 7.63423 17.5468 8 18.5349 8H20V9H18.5349C17.2998 9 16.1083 8.54278 15.1901 7.71648L10.3333 3.34539Z"
        className="dark:fill-gray-300"
      />
    </svg>
  );
}
function InfoIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
      <circle
        cx="8"
        cy="8"
        r="7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <circle cx="8" cy="4.5" r="1" fill="currentColor" />
      <path
        d="M8 12V7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Popover({
  content,
  children,
  side = "top",
  sideOffset = 8,
  className,
}: {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
  className?: string;
}) {
  return (
    <BasePopover.Root>
      <BasePopover.Trigger
        className={cn(
          "inline-flex items-center justify-center rounded-full text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:text-gray-400 dark:hover:text-gray-300",
          className,
        )}
        aria-label="Show information"
      >
        {children}
      </BasePopover.Trigger>
      <BasePopover.Portal>
        <BasePopover.Positioner side={side} sideOffset={sideOffset}>
          <BasePopover.Popup className="-outline-offset-1 origin-(--transform-origin) rounded-lg bg-[canvas] px-6 py-4 shadow-gray-200 shadow-lg outline-1 outline-gray-200 transition-[transform,scale,opacity] data-ending-style:scale-90 data-starting-style:scale-90 data-ending-style:opacity-0 data-starting-style:opacity-0 dark:shadow-none dark:outline-gray-300">
            <BasePopover.Arrow className="data-[side=right]:-rotate-90 data-[side=bottom]:top-[-8px] data-[side=left]:right-[-13px] data-[side=top]:bottom-[-8px] data-[side=right]:left-[-13px] data-[side=left]:rotate-90 data-[side=top]:rotate-180">
              <ArrowSvg />
            </BasePopover.Arrow>
            {content}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}

export function InfoPopover({
  content,
  className,
}: {
  content: React.ReactNode;
  className?: string;
}) {
  return (
    <Popover content={content} className={className}>
      <InfoIcon className="h-4 w-4" />
    </Popover>
  );
}
