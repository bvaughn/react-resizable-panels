import { useEffect, useRef, type PropsWithChildren } from "react";

export type DialogProps = PropsWithChildren<{
  className?: string | undefined;
  modal?: boolean | undefined;
}>;

// Opens itself (via showModal() or show()) once mounted
// Uses a passive effect so that the dialog is connected to the document before it's opened
// (e.g. when rendered in a popup window)
export function Dialog({ children, className, modal = true }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog) {
      if (modal) {
        dialog.showModal();
      } else {
        dialog.show();
      }

      return () => {
        dialog.close();
      };
    }
  }, [modal]);

  return (
    <dialog className={className} ref={ref}>
      {children}
    </dialog>
  );
}
