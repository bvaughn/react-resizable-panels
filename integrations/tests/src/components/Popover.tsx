import { useEffect, useRef, type PropsWithChildren } from "react";

export type PopoverProps = PropsWithChildren<{
  className?: string | undefined;
}>;

// Opens itself (via showPopover()) once mounted
// Uses a "manual" popover so that clicks outside of it don't close it
// Uses a passive effect so that the popover is connected to the document before it's opened
export function Popover({ children, className }: PopoverProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const popover = ref.current;
    if (popover) {
      popover.showPopover();

      return () => {
        popover.hidePopover();
      };
    }
  }, []);

  return (
    <div className={className} popover="manual" ref={ref}>
      {children}
    </div>
  );
}
