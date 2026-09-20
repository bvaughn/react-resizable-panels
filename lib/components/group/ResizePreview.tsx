import { isValidElement } from "react";
import type { ResizePreview as ResizePreviewState } from "../../global/mutable-state/types";
import { SeparatorClone } from "../separator/SeparatorClone";
import { SeparatorOverlay } from "../separator/SeparatorOverlay";
import { SeparatorOverlayRenderer } from "../separator/SeparatorOverlayRenderer";
import type { SeparatorOverlayProps } from "../separator/types";

export function ResizePreview({
  overlay,
  preview
}: {
  overlay?: SeparatorOverlayProps | undefined;
  preview: ResizePreviewState;
}) {
  const { group, offset, rect, separator } = preview;

  const horizontal = group.orientation === "horizontal";

  let rendered = separator?.preview;
  let overlayProps = overlay;

  if (
    isValidElement<SeparatorOverlayProps>(rendered) &&
    rendered.type === SeparatorOverlay
  ) {
    overlayProps = rendered.props;
    rendered = undefined;
  }

  if (rendered == null) {
    if (overlayProps) {
      rendered = (
        <SeparatorOverlayRenderer
          {...overlayProps}
          active={preview.active}
          orientation={group.orientation}
        />
      );
    } else if (separator) {
      rendered = <SeparatorClone separator={separator} />;
    }
  }

  return (
    <div
      aria-hidden="true"
      data-resize-preview
      inert
      style={{
        height: rect.height,
        left: rect.left,
        pointerEvents: "none",
        position: "absolute",
        top: rect.top,
        transform: horizontal
          ? `translateX(${offset}px)`
          : `translateY(${offset}px)`,
        width: rect.width
      }}
    >
      {rendered}
    </div>
  );
}
