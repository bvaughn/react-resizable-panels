import { useRef } from "react";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";
import type { RegisteredSeparator } from "./types";

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

      if (
        target instanceof ownerWindow.HTMLElement ||
        target instanceof ownerWindow.SVGElement
      ) {
        const computed = ownerWindow.getComputedStyle(source);

        for (let index = 0; index < computed.length; index++) {
          const property = computed.item(index);
          target.style.setProperty(
            property,
            computed.getPropertyValue(property)
          );
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
