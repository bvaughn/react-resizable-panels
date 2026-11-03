import { Group } from "../../flex/components/Group";
import { Panel } from "../../flex/components/Panel";
import { Separator } from "../../flex/components/Separator";
import { useGroupRef } from "../../flex/hooks/useGroupRef";
import {
  getMountedAxisState,
  subscribeToMountedAxis
} from "../../global/mutable-state/axes";
import { getInteractionState } from "../../global/mutable-state/interactions";
import type { Layout } from "../../global/types";
import { layoutNumbersEqual } from "../../global/utils/layoutNumbersEqual";
import { useIsomorphicLayoutEffect } from "../../shared/hooks/useIsomorphicLayoutEffect";
import { useStableCallback } from "../../shared/hooks/useStableCallback";
import { isHTMLElement } from "../../shared/utils/isHTMLElement";
import { useWorkspaceContext } from "../hooks/useWorkspaceContext";
import { canCollapseTabset } from "../models/canCollapseTabset";
import { getSplitLayoutSignature } from "../models/getSplitLayoutSignature";
import { setMeasuredSplitLayout } from "../models/setMeasuredSplitLayout";
import { setSplitLayout } from "../models/setSplitLayout";
import type { SplitNode } from "../types";
import { calculateSplitLayout } from "../utils/calculateSplitLayout";
import { getResizeReason } from "../utils/getResizeReason";
import { Fragment, useEffect, useRef, useState } from "react";
import { NodeView } from "./NodeView";

function SplitViewComponent({ split }: { split: SplitNode }) {
  const {
    classNames,
    collapsedSizes,
    disabled,
    id: workspaceId,
    maximumSizes,
    minimumSizes,
    queueLayoutUpdate,
    renderSeparator,
    reportCollapsePreview,
    reportSeparatorsSize,
    resizePreviewMode,
    splitGeneration,
    styles,
    updateModel
  } = useWorkspaceContext("SplitView");

  // Group and Panel ids are rendered as element ids, so they must be unique within the page (not just the workspace);
  // Panel ids use a different separator so that they can't match the id of a nested split's Group
  const groupId = `${workspaceId}-${split.id}`;
  const getPanelId = (nodeId: string) => `${workspaceId}:${nodeId}`;
  const groupRef = useGroupRef();

  const [groupElement, setGroupElement] = useState<HTMLDivElement | null>(null);

  const childIds = split.children.map(({ id }) => id).join();
  const panelIds = split.children.map(({ id }) => getPanelId(id)).join();

  const collapsedPanelIds = new Set(
    split.children
      .filter((child) => child.type === "tabset" && child.collapsed)
      .map(({ id }) => getPanelId(id))
  );

  // The Group is uncontrolled, so the model's sizes are applied to it when its children change, tabsets are collapsed or expanded,
  // or the model is replaced; it isn't remounted, so that its descendants (e.g. tabsets) aren't either.
  // The Group re-registers its Panels after they change, and then reports its layout (see onLayoutChanged below);
  // the model's sizes are applied once its Panels match the model's children.
  const collapsedKey = split.children
    .filter((child) => child.type === "tabset" && child.collapsed)
    .map(({ id }) => `${id}=${collapsedSizes[id] ?? 0}`)
    .join();
  const structureKey = `${splitGeneration}:${split.orientation}:${childIds}:${collapsedKey}`;

  // Collapsed sizes are converted to percentages by the Group, which change when it's resized,
  // so they're part of the applied key (applied again so that collapsed tabsets stay the size of their headers);
  // the model's sizes are always applied once the Group is registered, since the Group's own default layout doesn't apply minimum sizes the same way (see calculateSplitLayout)
  const appliedKeyRef = useRef<string | null>(null);
  // Re-renders (running the effect below) after the Group reports a layout
  const [, requestLayoutCheck] = useState(0);

  // The key of the model's layout, once the Group's Panels match the model's children (see the layout effect below)
  const getAppliedKey = () => {
    const axisState = getMountedAxisState(groupId);
    if (
      !axisState ||
      axisState.defaultLayoutDeferred ||
      axisState.derivedItemConstraints.map(({ itemId }) => itemId).join() !==
        panelIds
    ) {
      return null;
    }

    return `${structureKey}|${axisState.derivedItemConstraints
      .filter(({ itemId }) => collapsedPanelIds.has(itemId))
      .map(({ collapsedSize }) => collapsedSize)
      .join()}`;
  };

  // The model's sizes, keyed by Panel id
  const getPanelSizes = () => {
    const sizes: { [panelId: string]: number | string | undefined } = {};
    for (const child of split.children) {
      sizes[getPanelId(child.id)] = child.size;
    }

    return sizes;
  };

  // The children (by node id) that a layout collapses: collapsible Panels at their collapsed sizes
  const getCollapsedIds = (layout: Layout) => {
    const constraints =
      getMountedAxisState(groupId)?.derivedItemConstraints ?? [];
    const collapsedIds = new Set<string>();
    for (const { id } of split.children) {
      const panelId = getPanelId(id);
      const constraint = constraints.find(({ itemId }) => itemId === panelId);
      if (
        constraint?.collapsible &&
        layout[panelId] !== undefined &&
        layout[panelId] <= constraint.collapsedSize + 0.01
      ) {
        collapsedIds.add(id);
      }
    }

    return collapsedIds;
  };

  // The model only changes when a resize ends, so while a tabset is dragged past its collapsed size (or back),
  // it's shown as it will be (e.g. its content is hidden as soon as it reaches its collapsed size); see isTabsetCollapsed
  const updateCollapsePreview = useStableCallback((layout: Layout) => {
    const collapsedIds = getCollapsedIds(layout);
    const previews: { [tabsetId: string]: boolean | undefined } = {};
    for (const child of split.children) {
      if (child.type === "tabset") {
        const isCollapsed = collapsedIds.has(child.id);
        previews[child.id] =
          isCollapsed === !!child.collapsed ? undefined : isCollapsed;
      }
    }

    reportCollapsePreview(previews);
  });

  // Panels re-register when their collapsed sizes are measured (or change), which the Group handles in a later commit,
  // so the layout is checked again once the Group's constraints have changed
  const hasCollapsible = split.children.some(
    (child) => child.type === "tabset" && child.collapsible
  );
  useEffect(() => {
    if (!hasCollapsible) {
      return;
    }

    return subscribeToMountedAxis(groupId, ({ axis, next, prev }) => {
      // Layout changes (e.g. each pointer move while resizing) keep the same constraints, so they're skipped
      if (prev?.derivedItemConstraints !== next.derivedItemConstraints) {
        requestLayoutCheck((count) => count + 1);
      }

      // Only resizes of this split are previewed (e.g. resizing an outer split changes this split's percentages too);
      // the Workspace ends previews when the resize ends
      const interactionState = getInteractionState();
      if (
        interactionState.state === "active" &&
        interactionState.hitRegions.some((region) => region.axis === axis)
      ) {
        updateCollapsePreview(next.layout);
      }
    });
  }, [groupId, hasCollapsible, updateCollapsePreview]);

  // The Group can change the layout itself, e.g. collapsing a tabset (or growing it to its minimum size) when the workspace is made narrower,
  // or when the model's sizes can't be applied as they are (see calculateSplitLayout); the model is updated to match.
  // Only called once the model's layout has been applied (see appliedKeyRef); before that, the Group's layout is its own default rather than the model's.
  // The update is queued (see queueLayoutUpdate), and isn't applied if the split has changed by then (see setMeasuredSplitLayout).
  const updateModelToMatchLayout = (layout: Layout) => {
    const collapsedIds = getCollapsedIds(layout);
    const modelLayout = calculateSplitLayout(
      getMountedAxisState(groupId)!.derivedItemConstraints,
      collapsedPanelIds,
      getPanelSizes(),
      { applyMinAndMaxSizes: false }
    );
    const isChanged = split.children.some((child) => {
      const panelId = getPanelId(child.id);
      return (
        (child.type === "tabset" &&
          collapsedIds.has(child.id) !== !!child.collapsed) ||
        !layoutNumbersEqual(layout[panelId], modelLayout[panelId], 0.01)
      );
    });
    if (isChanged) {
      const nodeLayout: Layout = {};
      for (const { id } of split.children) {
        nodeLayout[id] = layout[getPanelId(id)];
      }

      const signature = getSplitLayoutSignature(split);
      queueLayoutUpdate(
        split.id,
        getResizeReason(split.children, collapsedIds),
        (prev) =>
          setMeasuredSplitLayout(
            prev,
            split.id,
            signature,
            nodeLayout,
            collapsedIds
          )
      );
    }
  };

  // Runs after every render, since the Group's constraints (e.g. its Panels' collapsed sizes) aren't part of its rendered state
  useIsomorphicLayoutEffect(() => {
    const appliedKey = getAppliedKey();
    if (appliedKey === null) {
      // Not registered (or not visible) yet
      return;
    } else if (appliedKeyRef.current === appliedKey) {
      return;
    }

    appliedKeyRef.current = appliedKey;

    // Sizes come from the model; constraints have collapsed sizes (and sizes with other units) converted to percentages
    groupRef.current?.setLayout(
      calculateSplitLayout(
        getMountedAxisState(groupId)!.derivedItemConstraints,
        collapsedPanelIds,
        getPanelSizes()
      )
    );

    // The Group only reports layouts that differ from the previous one it reported,
    // so if it had already changed the layout itself (e.g. growing a tabset to its minimum size), the model is compared with it here
    // (layouts it does report are compared again, but updates are batched; see queueLayoutUpdate)
    updateModelToMatchLayout(getMountedAxisState(groupId)!.layout);
  });

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
          // The Group's layout is keyed by Panel id; the model's is keyed by node id
          const panelLayout = requestedLayout ?? layout;
          const nodeLayout: Layout = {};
          for (const { id } of split.children) {
            const size = panelLayout[getPanelId(id)];
            if (size !== undefined) {
              nodeLayout[id] = size;
            }
          }

          // Resizing can collapse or expand collapsible tabsets (like collapsible Panels)
          const collapsedIds = getCollapsedIds(layout);
          const reason = getResizeReason(split.children, collapsedIds);
          updateModel(reason, true, (prev) =>
            setSplitLayout(prev, split.id, nodeLayout, collapsedIds)
          );
        } else {
          const appliedKey = getAppliedKey();
          if (appliedKey !== null && appliedKeyRef.current === appliedKey) {
            updateModelToMatchLayout(layout);
          } else {
            requestLayoutCheck((count) => count + 1);
          }
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
        // Infinity if there's no maximum (or it can't be applied); minimums take precedence (like CSS)
        const maximumSize = maximumSizes.get(child.id);
        const maxSize =
          split.orientation === "horizontal"
            ? maximumSize?.width
            : maximumSize?.height;

        return (
          <Fragment key={child.id}>
            {index > 0 &&
              (renderSeparator ? (
                renderSeparator(split.orientation)
              ) : (
                <Separator />
              ))}
            <Panel
              collapsedSize={
                child.type === "tabset" && child.collapsible
                  ? `${collapsedSizes[child.id] ?? 0}px`
                  : undefined
              }
              collapsible={
                child.type === "tabset" &&
                (!!child.collapsed || canCollapseTabset(split, child))
              }
              defaultSize={
                typeof child.size === "number" ? `${child.size}%` : child.size
              }
              id={getPanelId(child.id)}
              maxSize={
                maxSize !== undefined && Number.isFinite(maxSize)
                  ? `${Math.max(maxSize, minSize ?? 0)}px`
                  : undefined
              }
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
