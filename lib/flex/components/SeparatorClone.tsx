import { useRef } from "react";
import type { RegisteredSeparator } from "../../global/types";
import { useIsomorphicLayoutEffect } from "../../shared/hooks/useIsomorphicLayoutEffect";

export function SeparatorClone({
  separator
}: {
  separator: RegisteredSeparator;
}) {
  const { element } = separator;

  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const clone = element.cloneNode(true) as HTMLDivElement;
    const sources = [element, ...element.querySelectorAll("*")];
    const targets = [clone, ...clone.querySelectorAll("*")];
    const ownerWindow = element.ownerDocument.defaultView!;

    sources.forEach((source, index) => {
      const target = targets[index];

      // HTML and SVG elements are detected by their inline styles rather than "instanceof",
      // which is false for elements created by another window (e.g. a popup's opener), as are their clones
      const { style } = target as Partial<ElementCSSInlineStyle>;
      if (style) {
        const computed = ownerWindow.getComputedStyle(source);

        for (let index = 0; index < computed.length; index++) {
          const property = computed.item(index);
          style.setProperty(property, computed.getPropertyValue(property));
        }
      }

      target.removeAttribute("data-testid");
      target.removeAttribute("id");
    });

    Object.assign(clone.style, {
      boxSizing: "border-box",
      height: "100%",
      margin: "0",
      position: "static",
      transform: "none",
      width: "100%"
    });

    ref.current!.appendChild(clone);

    return () => clone.remove();
  }, [element]);

  return (
    <div
      ref={ref}
      style={{
        height: "100%",
        opacity: 0.65,
        pointerEvents: "none",
        width: "100%"
      }}
    />
  );
}
