import type { PropsWithChildren } from "react";
import { cn } from "react-lib-tools";

export function DemoButton({
  children,
  className,
  onClick,
  title
}: PropsWithChildren<{
  className?: string;
  onClick: () => void;
  title?: string;
}>) {
  return (
    <button
      aria-label={title}
      className={cn(
        "bg-sky-700 hover:bg-sky-600 text-white py-1 px-2 rounded cursor-pointer",
        className
      )}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
}
