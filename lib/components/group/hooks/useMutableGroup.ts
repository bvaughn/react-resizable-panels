import { useMemo, useState, useSyncExternalStore, type RefObject } from "react";
import { addDocumentListeners } from "../../../global/addDocumentListeners";
import { removeDocumentListeners } from "../../../global/removeDocumentListeners";
import { useId } from "../../../hooks/useId";
import { useIsomorphicLayoutEffect } from "../../../hooks/useIsomorphicLayoutEffect";
import { useStableCallback } from "../../../hooks/useStableCallback";
import { MutableGroup } from "../../../state/MutableGroup";
import { registerGroup } from "../../../state/Root";
import type { GroupLayout } from "../../../state/types";
import { assert } from "../../../utils/assert";
import type {
  OnGroupLayoutChange,
  Orientation,
  ResizeTargetMinimumSize
} from "../types";
import { useGroupHTMLElementInterface } from "./useGroupHTMLElementInterface";
import { useGroupImperativeHandle } from "./useGroupImperativeHandle";
import { useStableObject } from "../../../hooks/useStableObject";

/**
 * Creates a MutableGroup instance.
 *
 * This hook also...
 * 1. Watches the Group element and notifies the MutableGroup when its size changes.
 * 2. Listens to the MutableGroup for Layout changes and notifies layout-change handlers and schedules a re-render.
 * 3. Initializes the imperative Group API
 *
 * @returns MutableGroup instance and current Layout.
 */
export function useMutableGroup({
  defaultLayout: defaultLayoutProp,
  disableCursor,
  disabled,
  elementRef,
  id: idProp,
  onLayoutChange: onLayoutChangeUnstable,
  onLayoutChanged: onLayoutChangedUnstable,
  orientation,
  resizeTargetMinimumSize: resizeTargetMinimumSizeProp
}: {
  defaultLayout: GroupLayout | undefined;
  disableCursor: boolean;
  disabled: boolean;
  elementRef: RefObject<HTMLDivElement | null>;
  id: string | number | undefined;
  onLayoutChange: OnGroupLayoutChange | undefined;
  onLayoutChanged: OnGroupLayoutChange | undefined;
  orientation: Orientation | undefined;
  resizeTargetMinimumSize: ResizeTargetMinimumSize;
}) {
  const id = useId(idProp);
  const [defaultLayout] = useState(defaultLayoutProp);

  const elementInterface = useGroupHTMLElementInterface(elementRef);

  const resizeTargetMinimumSize = useStableObject(resizeTargetMinimumSizeProp);

  const group = useMemo(() => {
    return new MutableGroup({
      defaultLayout,
      elementInterface,
      id,
      orientation,
      resizeTargetMinimumSize
    });
  }, [
    defaultLayout,
    elementInterface,
    id,
    orientation,
    resizeTargetMinimumSize
  ]);

  const layout = useSyncExternalStore(
    (change) => group.addListener("layoutChange", change),
    () => group.layout,
    () => group.layout
  );

  const onLayoutChange = useStableCallback(() => {
    onLayoutChangeUnstable?.(group.layout);
  });
  const onLayoutChanged = useStableCallback(() => {
    onLayoutChangedUnstable?.(group.layout);
  });

  useIsomorphicLayoutEffect(() => {
    group.updateMutableValues({
      disableCursor,
      disabled
    });
  }, [disableCursor, disabled, group]);

  useIsomorphicLayoutEffect(() => {
    group.addListener("layoutChange", onLayoutChange);
    group.addListener("layoutChanged", onLayoutChanged);

    group.mount();

    const unregisterGroup = registerGroup(group);

    return () => {
      group.removeListener("layoutChange", onLayoutChange);
      group.removeListener("layoutChanged", onLayoutChanged);

      unregisterGroup();

      group.unmount();
    };
  }, [group, onLayoutChange, onLayoutChanged]);

  useIsomorphicLayoutEffect(() => {
    const element = elementRef.current;
    if (element === null) {
      return;
    }

    const defaultView = element.ownerDocument.defaultView;
    assert(defaultView, "Unexpected null defaultView");

    addDocumentListeners(element.ownerDocument);

    return () => {
      removeDocumentListeners(element.ownerDocument);
    };
  }, [elementRef, group]);

  useIsomorphicLayoutEffect(() => {
    group.flushPendingValidation();
  });

  const imperativeHandle = useGroupImperativeHandle(group);

  return { group, id, imperativeHandle, layout };
}
