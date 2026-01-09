import { useState } from "react";

export type ClickableProps = { className?: string; id?: string };

export function Clickable({ className = "", id }: ClickableProps) {
  const [counts, setCounts] = useState({
    pointerDown: 0,
    pointerUp: 0
  });

  const label = id ? `Clickable ${id}` : "Clickable";

  return (
    <pre
      className={className}
      onPointerDown={(event) => {
        if (event.defaultPrevented) {
          return;
        }

        setCounts({
          pointerDown: counts.pointerDown + 1,
          pointerUp: counts.pointerUp
        });
      }}
      onPointerUp={(event) => {
        if (event.defaultPrevented) {
          return;
        }

        setCounts({
          pointerDown: counts.pointerDown,
          pointerUp: counts.pointerUp + 1
        });
      }}
    >
      <code>
        {label} down:{counts.pointerDown} up:{counts.pointerUp}
      </code>
    </pre>
  );
}
