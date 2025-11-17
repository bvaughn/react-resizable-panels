import type { PropsWithChildren } from "react";

export function Text({ children }: PropsWithChildren) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-1">
      {children}
    </div>
  );
}
