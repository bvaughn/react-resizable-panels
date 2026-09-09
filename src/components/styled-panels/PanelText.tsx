import type { PropsWithChildren } from "react";

export function PanelText({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-full w-full flex-col items-center justify-center px-3 py-2.5 text-center">
      {children}
    </div>
  );
}
