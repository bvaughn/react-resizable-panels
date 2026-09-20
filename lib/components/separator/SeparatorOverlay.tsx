"use client";

import { useRef } from "react";
import { objectsEqual } from "../../global/utils/objectsEqual";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";
import { useGroupContext } from "../group/useGroupContext";
import type { SeparatorOverlayProps } from "./types";

/**
 * Customizes separator previews when resizePreviewMode is "separator".
 * Render within a `Group` to style all overlay previews, or pass to an individual `Separator` to style its overlay preview.
 *
 * Use `data-separator-overlay="active"` to style the separator being dragged,
 * or `data-separator-overlay="inactive"` for separators moved indirectly.
 *
 * Set `width` (horizontal groups) or `height` (vertical groups) using `style` or `className`.
 */
export function SeparatorOverlay(props: SeparatorOverlayProps) {
  const { registerOverlay } = useGroupContext();

  const propsRef = useRef(props);

  if (!objectsEqual(propsRef.current, props)) {
    propsRef.current = props;
  }

  const stableProps = propsRef.current;

  useIsomorphicLayoutEffect(
    () => registerOverlay(stableProps),
    [registerOverlay, stableProps]
  );

  return null;
}

SeparatorOverlay.displayName = "SeparatorOverlay";
