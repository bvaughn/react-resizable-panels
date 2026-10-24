import type { ReactNode } from "react";

/**
 * Documents a single hook parameter; render within a <dl>.
 */
export function Param({
  children,
  defaultValue,
  name,
  optional = false,
  type
}: {
  children: ReactNode;
  defaultValue?: string;
  name: string;
  optional?: boolean;
  type: ReactNode;
}) {
  return (
    <>
      <dt className="text-lg font-mono">
        <span className="tok-propertyName">{name}</span>
        <span className="tok-punctuation">{optional ? "?:" : ":"}</span> {type}
        {defaultValue !== undefined && (
          <>
            {" "}
            <span className="tok-punctuation">=</span> {defaultValue}
          </>
        )}
      </dt>
      <dd className="mb-2 flex flex-col gap-4">{children}</dd>
    </>
  );
}
