import type { PropsWithChildren } from "react";

export function PanelText({ children }: PropsWithChildren) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-1">
      {children}
    </div>
  );
}
