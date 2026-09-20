import { useSyncExternalStore } from "react";
import {
  getInteractionState,
  subscribeToInteractionState
} from "../../global/mutable-state/interactions";

export function ResizePreview({ groupId }: { groupId: string }) {
  const read = () => {
    const interaction = getInteractionState();
    return interaction.state === "active" &&
      interaction.preview?.hitRegion.group.id === groupId
      ? interaction.preview
      : undefined;
  };
  const preview = useSyncExternalStore(
    subscribeToInteractionState,
    read,
    () => undefined
  );
  if (!preview) {
    return null;
  }

  const { hitRegion, rect, offset } = preview;
  const { group, separator } = hitRegion;
  const horizontal = group.orientation === "horizontal";
  const { children, className, style } = separator ?? {};

  return (
    <div
      aria-hidden="true"
      inert
      data-resize-preview
      style={{
        position: "absolute",
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        transform: horizontal
          ? `translateX(${offset}px)`
          : `translateY(${offset}px)`,
        pointerEvents: "none"
      }}
    >
      <div
        className={className}
        data-separator="active"
        style={{
          ...style,
          boxSizing: "border-box",
          width: "100%",
          height: "100%",
          pointerEvents: "none"
        }}
      >
        {children}
      </div>
    </div>
  );
}
