import { useIsomorphicLayoutEffect } from "../../shared/hooks/useIsomorphicLayoutEffect";
import { positionPreview } from "../utils/positionPreview";
import {
  useRef,
  type CSSProperties,
  type ReactNode,
  type RefObject
} from "react";

function DragPreviewComponent({
  children,
  className,
  elementRef,
  pointRef,
  style
}: {
  children: ReactNode;
  className: string | undefined;
  elementRef: RefObject<HTMLElement | null>;
  pointRef: RefObject<{ clientX: number; clientY: number }>;
  style: CSSProperties | undefined;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    elementRef.current = ref.current;
    positionPreview(ref.current, pointRef.current);

    return () => {
      elementRef.current = null;
    };
  }, [elementRef, pointRef]);

  return (
    <div
      className={className}
      data-drag-preview
      ref={ref}
      style={{
        zIndex: 2,
        ...style,
        left: 0,
        pointerEvents: "none",
        position: "fixed",
        top: 0
      }}
    >
      {children}
    </div>
  );
}

export const DragPreview = /* @__PURE__ */ Object.assign(DragPreviewComponent, {
  displayName: "Workspace.DragPreview"
});
