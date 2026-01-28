import {
  useMemo,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type RefObject
} from "react";
import { useId } from "../../../hooks/useId";
import { useIsomorphicLayoutEffect } from "../../../hooks/useIsomorphicLayoutEffect";
import { useStableCallback } from "../../../hooks/useStableCallback";
import { MutablePanel } from "../../../state/MutablePanel";
import { useGroupContext } from "../../group/hooks/useGroupContext";
import type { OnPanelResize, PanelSize } from "../types";
import { usePanelHTMLElementInterface } from "./usePanelHTMLElementInterface";
import { usePanelImperativeHandle } from "./usePanelImperativeHandle";

/**
 * Creates a MutablePanel instance and registers it with the parent MutableGroup.
 *
 * This hook also...
 * 1. Converts relative size constraints to pixels.
 * 2. Notifies the parent MutableGroup when Panel constraints change.
 * 3. Notifies "onResize" callback of changes in Panel size.
 * 4. Initializes the imperative Panel API
 *
 * @returns MutablePanel instance
 */
export function useMutablePanel({
  collapsedSize,
  collapsible,
  defaultSize: defaultSizeProp,
  elementRef,
  id: idProp,
  maxSize,
  minSize,
  onResize: onResizeUnstable
}: {
  collapsedSize: number | string | undefined;
  collapsible: boolean | undefined;
  defaultSize: number | string | undefined;
  elementRef: RefObject<HTMLDivElement | null>;
  id: string | number | undefined;
  maxSize: number | string | undefined;
  minSize: number | string | undefined;
  onResize: OnPanelResize | undefined;
}) {
  const id = useId(idProp);
  const [defaultSize] = useState(defaultSizeProp);

  const hasOnResize = onResizeUnstable !== undefined;
  const onResizeStable = useStableCallback(
    (
      panelSize: PanelSize,
      _: string | number | undefined,
      prevPanelSize: PanelSize | undefined
    ) => {
      onResizeUnstable?.(panelSize, idProp, prevPanelSize);
    }
  );

  const group = useGroupContext();

  const elementInterface = usePanelHTMLElementInterface(elementRef);

  const panel = useMemo(
    () =>
      new MutablePanel({
        defaultSize,
        elementInterface,
        group,
        id
      }),
    [group, id, defaultSize, elementInterface]
  );

  const panelStyle = useSyncExternalStore(
    (change) => panel.addListener("styleChange", change),
    () => panel.style,
    () => panel.style
  );

  const style = useMemo<CSSProperties>(
    () => ({
      ...PROHIBITED_CSS_PROPERTIES,
      ...panelStyle,

      display: "flex",
      flexBasis: 0,
      flexShrink: 1,

      // Prevent Panel content from interfering with panel size
      overflow: "hidden"
    }),
    [panelStyle]
  );

  useIsomorphicLayoutEffect(() => {
    panel.mount();
    return () => {
      panel.unmount();
    };
  }, [panel]);

  useIsomorphicLayoutEffect(() => {
    panel.updateConstraints({
      collapsedSize,
      collapsible,
      maxSize,
      minSize
    });
  }, [collapsedSize, collapsible, maxSize, minSize, panel]);

  useIsomorphicLayoutEffect(() => {
    const element = elementRef.current;
    if (element && hasOnResize) {
      panel.updateResizeListener(onResizeStable);
    }
  }, [elementRef, hasOnResize, onResizeStable, panel]);

  const imperativeHandle = usePanelImperativeHandle(panel);

  return { id, imperativeHandle, panel, style };
}

const PROHIBITED_CSS_PROPERTIES: CSSProperties = {
  minHeight: 0,
  maxHeight: "100%",
  height: "auto",

  minWidth: 0,
  maxWidth: "100%",
  width: "auto",

  border: "none",
  borderWidth: 0,
  padding: 0,
  margin: 0
};
