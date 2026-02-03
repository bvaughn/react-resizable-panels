"use client";

import { useState } from "react";

export type ClickableProps = {
  className?: string;
  id?: string;
  ignoredDefaultPrevented?: boolean;
};

export function Clickable({
  className = "",
  id,
  ignoredDefaultPrevented
}: ClickableProps) {
  const [counts, setCounts] = useState({
    click: 0,
    pointerDown: 0,
    pointerUp: 0
  });

  const label = id ? `Clickable ${id}` : "Clickable";

  return (
    <pre
      className={className}
      onPointerDown={(event) => {
        if (event.defaultPrevented && !ignoredDefaultPrevented) {
          return;
        }

        setCounts({
          click: counts.click,
          pointerDown: counts.pointerDown + 1,
          pointerUp: counts.pointerUp
        });
      }}
      onPointerUp={(event) => {
        if (event.defaultPrevented && !ignoredDefaultPrevented) {
          return;
        }

        setCounts({
          click: counts.click,
          pointerDown: counts.pointerDown,
          pointerUp: counts.pointerUp + 1
        });
      }}
      onClick={(event) => {
        if (event.defaultPrevented && !ignoredDefaultPrevented) {
          return;
        }

        setCounts({
          click: counts.click + 1,
          pointerDown: counts.pointerDown,
          pointerUp: counts.pointerUp
        });
      }}
    >
      <code>
        {label} down:{counts.pointerDown} up:{counts.pointerUp} click:
        {counts.click}
      </code>
    </pre>
  );
}
