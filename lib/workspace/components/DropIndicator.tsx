import { useRef, useState, type CSSProperties } from "react";
import { useIsomorphicLayoutEffect } from "../../shared/hooks/useIsomorphicLayoutEffect";
import type { TabDropTarget } from "../types";
import { findTabsetPanels } from "../utils/findTabsetPanels";
import { isSameDropIndicatorInsets } from "../utils/isSameDropIndicatorInsets";
import {
  measureDropIndicatorInsets,
  type DropIndicatorInsets
} from "../utils/measureDropIndicatorInsets";

function DropIndicatorComponent({
  className,
  dropTarget,
  rootElement,
  style
}: {
  className: string | undefined;
  dropTarget: TabDropTarget | undefined;
  rootElement: HTMLElement | null;
  style: CSSProperties | undefined;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Kept while the dragged tab isn't over a tabset's panels (e.g. it's over a tab list, or between tabsets),
  // so that the indicator is animated from where it was to the next region
  const [insets, setInsets] = useState<DropIndicatorInsets | undefined>();

  const region =
    dropTarget && "region" in dropTarget ? dropTarget.region : undefined;
  const tabsetId = region ? dropTarget?.tabsetId : undefined;

  // Measured when the target changes, and again if the layout changes during the drag (e.g. the window is resized);
  // only the indicator re-renders (before the browser paints), and only when its insets change
  useIsomorphicLayoutEffect(() => {
    const containerElement = containerRef.current;
    const panelsElement =
      rootElement && tabsetId
        ? findTabsetPanels(rootElement, tabsetId)
        : undefined;
    if (!containerElement || !panelsElement || !region) {
      return;
    }

    const measure = () => {
      const next = measureDropIndicatorInsets(
        containerElement,
        panelsElement,
        region
      );
      setInsets((prev) =>
        isSameDropIndicatorInsets(prev, next) ? prev : next
      );
    };

    measure();

    const ResizeObserver =
      containerElement.ownerDocument.defaultView?.ResizeObserver;
    if (ResizeObserver) {
      const resizeObserver = new ResizeObserver(measure);
      resizeObserver.observe(containerElement);
      resizeObserver.observe(panelsElement);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [region, rootElement, tabsetId]);

  // The container covers the workspace's root element (and a maximized tabset, which is rendered before it)
  return (
    <div
      ref={containerRef}
      style={{
        inset: 0,
        pointerEvents: "none",
        position: "absolute",
        zIndex: 1
      }}
    >
      <div
        className={className}
        data-drop-indicator
        data-region={region}
        style={{
          ...style,
          ...insets,
          ...(!region && { opacity: 0 }),
          pointerEvents: "none",
          position: "absolute"
        }}
      />
    </div>
  );
}

/**
 * Shows where a dragged tab (or tabset) will be dropped within a tabset's panels.
 *
 * ℹ️ It's rendered within the workspace's root element for the whole drag (rather than within each tabset's panels),
 * so that it can be animated between regions and tabsets.
 */
export const DropIndicator = /* @__PURE__ */ Object.assign(
  DropIndicatorComponent,
  {
    displayName: "Workspace.DropIndicator"
  }
);
