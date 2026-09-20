import type { CSSProperties } from "react";
import type { Orientation } from "../group/types";
import type { SeparatorOverlayProps } from "./types";

/**
 * Renders a visible overlay preview
 */
export function SeparatorOverlayRenderer({
  active,
  orientation,
  style,
  ...rest
}: SeparatorOverlayProps & { active: boolean; orientation: Orientation }) {
  let styleConstraints: CSSProperties;

  switch (orientation) {
    case "horizontal": {
      styleConstraints = {
        height: "100%",
        minWidth: "1px"
      };
      break;
    }
    case "vertical": {
      styleConstraints = {
        minHeight: "1px",
        width: "100%"
      };
      break;
    }
  }

  return (
    <div
      {...rest}
      data-separator-overlay={active ? "active" : "inactive"}
      style={{
        ...styleConstraints,
        ...style,
        flexShrink: 0,
        pointerEvents: "none"
      }}
    />
  );
}
