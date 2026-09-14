import { useState, type CSSProperties, type RefObject } from "react";
import {
  getInteractionState,
  subscribeToInteractionState
} from "../../global/mutable-state/interactions";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";
import type { PanelProps } from "./types";

export function useFrozenContent(
  mode: PanelProps["mode"],
  panelRef: RefObject<HTMLDivElement | null>,
  contentRef: RefObject<HTMLDivElement | null>
) {
  const [styles, setStyles] = useState<CSSProperties>();

  useIsomorphicLayoutEffect(() => {
    setStyles(undefined);
    if (mode !== "freeze") return;

    let frozen = false;
    const update = () => {
      const panel = panelRef.current;
      const content = contentRef.current;
      if (!panel || !content) return;

      const interaction = getInteractionState();
      const freeze =
        interaction.state === "active" &&
        interaction.hitRegions.some(
          ({ group }) =>
            !group.panels.some((panel) => panel.mode === "preview") &&
            group.element.contains(panel)
        );
      if (freeze === frozen) return;
      frozen = freeze;

      if (freeze) {
        // Used CSS sizes retain box-sizing and exclude ancestor transforms.
        const computed =
          content.ownerDocument.defaultView!.getComputedStyle(content);
        const { width, height } = computed;
        setStyles({
          width,
          minWidth: width,
          maxWidth: width,
          height,
          minHeight: height,
          maxHeight: height,
          flexGrow: 0,
          flexShrink: 0,
          flexBasis: "auto",
          // Inherited by nested scrollers; preserves the scrollbar gutter.
          scrollbarColor: "transparent transparent"
        });
      } else {
        setStyles(undefined);
      }
    };

    update();
    return subscribeToInteractionState(update);
  }, [contentRef, mode, panelRef]);

  return mode === "freeze" ? styles : undefined;
}
