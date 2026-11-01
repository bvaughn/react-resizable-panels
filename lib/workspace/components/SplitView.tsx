import { Group } from "../../flex/components/Group";
import { Panel } from "../../flex/components/Panel";
import { Separator } from "../../flex/components/Separator";
import { useGroupRef } from "../../flex/hooks/useGroupRef";
import { getMountedAxisState } from "../../global/mutable-state/axes";
import { calculateDefaultLayout } from "../../global/utils/calculateDefaultLayout";
import { useIsomorphicLayoutEffect } from "../../shared/hooks/useIsomorphicLayoutEffect";
import { isHTMLElement } from "../../shared/utils/isHTMLElement";
import { useWorkspaceContext } from "../hooks/useWorkspaceContext";
import { setSplitLayout } from "../models/setSplitLayout";
import type { SplitNode } from "../types";
import { Fragment, useRef, useState } from "react";
import { NodeView } from "./NodeView";

function SplitViewComponent({ split }: { split: SplitNode }) {
  const {
    classNames,
    disabled,
    id: workspaceId,
    minimumSizes,
    renderSeparator,
    reportSeparatorsSize,
    resizePreviewMode,
    splitGeneration,
    styles,
    updateModel
  } = useWorkspaceContext("SplitView");

  // Group ids must be unique within the page (not just the workspace)
  const groupId = `${workspaceId}-${split.id}`;
  const groupRef = useGroupRef();

  const [groupElement, setGroupElement] = useState<HTMLDivElement | null>(null);

  const childIds = split.children.map(({ id }) => id).join();

  // The Group is uncontrolled, so the model's sizes are applied to it when its children change (or the model is replaced);
  // it isn't remounted, so that its descendants (e.g. tabsets) aren't either.
  // The Group re-registers its Panels after they change, and then reports its layout (see onLayoutChanged below);
  // the model's sizes are applied once its Panels match the model's children.
  const structureKey = `${splitGeneration}:${split.orientation}:${childIds}`;
  const appliedStructureKeyRef = useRef(structureKey);
  const [layoutCheck, requestLayoutCheck] = useState(0);

  useIsomorphicLayoutEffect(() => {
    if (appliedStructureKeyRef.current === structureKey) {
      return;
    }

    const axisState = getMountedAxisState(groupId);
    if (
      !axisState ||
      axisState.defaultLayoutDeferred ||
      axisState.derivedItemConstraints.map(({ itemId }) => itemId).join() !==
        childIds
    ) {
      // Not registered (or not visible) yet
      return;
    }

    appliedStructureKeyRef.current = structureKey;

    // Panel default sizes come from the model; constraints have them converted to percentages
    groupRef.current?.setLayout(
      calculateDefaultLayout(axisState.derivedItemConstraints)
    );
  }, [childIds, groupId, groupRef, layoutCheck, structureKey]);

  // Separators (and gaps between the split's panels and separators, e.g. CSS "gap") count toward the split's minimum size;
  // they're observed, since they can change size (e.g. responsive styles) or be replaced (e.g. by a different renderSeparator)
  // without the split changing
  useIsomorphicLayoutEffect(() => {
    const ownerWindow = groupElement?.ownerDocument.defaultView;
    if (!groupElement || !ownerWindow) {
      return;
    }

    // Elements are detected without "instanceof", which is false for elements created by another window (e.g. a popup's opener)
    const isSeparator = (node: Node): node is Element =>
      isHTMLElement(node) && node.hasAttribute("data-separator");

    const measure = () => {
      let total = 0;

      // Gaps are only placed between the Group's panels and separators (e.g. not beside resize previews, which are positioned)
      let itemCount = 0;
      const computedStyle = ownerWindow.getComputedStyle(groupElement);
      const gap =
        parseFloat(
          split.orientation === "horizontal"
            ? computedStyle.columnGap
            : computedStyle.rowGap
        ) || 0;

      for (const child of groupElement.children) {
        if (isHTMLElement(child) && child.hasAttribute("data-panel")) {
          itemCount++;
        }

        if (isSeparator(child)) {
          itemCount++;

          // Measured in layout pixels, since minimum sizes are applied in layout pixels (see TabsetSlot);
          // other elements (e.g. SVG) have no layout size, so their client size is used instead
          if ("offsetWidth" in child) {
            const { offsetHeight, offsetWidth } = child as HTMLElement;
            total +=
              split.orientation === "horizontal" ? offsetWidth : offsetHeight;
          } else {
            const rect = child.getBoundingClientRect();
            total +=
              split.orientation === "horizontal" ? rect.width : rect.height;
          }
        }
      }

      total += gap * Math.max(0, itemCount - 1);

      reportSeparatorsSize(split.id, total);
    };

    // The split itself is observed since responsive gaps generally change along with its size
    const resizeObserver = ownerWindow.ResizeObserver
      ? new ownerWindow.ResizeObserver(measure)
      : null;
    resizeObserver?.observe(groupElement);
    for (const child of groupElement.children) {
      if (isSeparator(child)) {
        resizeObserver?.observe(child);
      }
    }

    // Separators are added and removed as the split's children change
    const mutationObserver = ownerWindow.MutationObserver
      ? new ownerWindow.MutationObserver((records) => {
          for (const record of records) {
            record.addedNodes.forEach((node) => {
              if (isSeparator(node)) {
                resizeObserver?.observe(node);
              }
            });
            record.removedNodes.forEach((node) => {
              if (isSeparator(node)) {
                resizeObserver?.unobserve(node);
              }
            });
          }

          measure();
        })
      : null;
    mutationObserver?.observe(groupElement, { childList: true });

    measure();

    return () => {
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
    };
  }, [
    classNames?.split,
    groupElement,
    reportSeparatorsSize,
    split.id,
    split.orientation,
    styles?.split
  ]);

  return (
    <Group
      className={classNames?.split}
      data-split=""
      data-split-id={split.id}
      disabled={disabled}
      elementRef={setGroupElement}
      groupRef={groupRef}
      id={groupId}
      onLayoutChanged={(layout, { isUserInteraction, requestedLayout }) => {
        if (isUserInteraction) {
          updateModel("resize", true, (prev) =>
            setSplitLayout(prev, split.id, requestedLayout ?? layout)
          );
        } else if (appliedStructureKeyRef.current !== structureKey) {
          requestLayoutCheck((count) => count + 1);
        }
      }}
      orientation={split.orientation}
      resizePreviewMode={resizePreviewMode}
      style={styles?.split}
    >
      {split.children.map((child, index) => {
        const minimumSize = minimumSizes.get(child.id);
        const minSize =
          split.orientation === "horizontal"
            ? minimumSize?.width
            : minimumSize?.height;

        return (
          <Fragment key={child.id}>
            {index > 0 &&
              (renderSeparator ? (
                renderSeparator(split.orientation)
              ) : (
                <Separator />
              ))}
            <Panel
              defaultSize={
                typeof child.size === "number" ? `${child.size}%` : child.size
              }
              id={child.id}
              minSize={minSize ? minSize : undefined}
            >
              <NodeView node={child} />
            </Panel>
          </Fragment>
        );
      })}
    </Group>
  );
}

/**
 * Renders a split as a Group, with a Panel for each child.
 */
export const SplitView = /* @__PURE__ */ Object.assign(SplitViewComponent, {
  displayName: "Workspace.SplitView"
});
