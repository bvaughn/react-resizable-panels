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
import { setSplitLayout } from "../models/setSplitLayout";
import type { SplitNode } from "../types";
import { calculateSplitLayout } from "../utils/calculateSplitLayout";
import { getGrowingShares } from "../utils/getGrowingShares";
import { getResizeReason } from "../utils/getResizeReason";
import { sizeToPixels } from "../utils/sizeToPixels";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { NodeView } from "./NodeView";

function SplitViewComponent({ split }: { split: SplitNode }) {
  const {
    classNames,
    collapsedSizes,
    collapseToFit,
    defaultGrowSize,
    disabled,
    growingSplitId,
    id: workspaceId,
    maximumSizes,
    minimumSizes,
    renderSeparator,
    reportCollapsePreview,
    reportCollapseToFit,
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
  // Also available to effects in the commit that mounts the Group (before groupElement is updated)
  const groupElementRef = useRef<HTMLDivElement | null>(null);
  const setGroupElementRefs = useCallback((element: HTMLDivElement | null) => {
    groupElementRef.current = element;
    setGroupElement(element);
  }, []);

  // The Group's size along the split, in layout pixels
  const getGroupSize = () => {
    const element = groupElementRef.current;
    return element
      ? split.orientation === "horizontal"
        ? element.offsetWidth
        : element.offsetHeight
      : 0;
  };

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
  // The rows of a workspace that grows (see the growDirection prop) are sized by lengths, and the split is as large as its rows,
  // so the model's sizes are applied whenever they change (e.g. a row is resized, or one is added and the split grows)
  const isGrowing = split.id === growingSplitId;

  // The split is as large as its rows' lengths (and its separators), so each expanded row's share of it is its length's share of theirs;
  // computed from the lengths (rather than from the Panels' default sizes, which the Group converts using its size before it grows)
  const growingShares = isGrowing
    ? getGrowingShares(
        split,
        defaultGrowSize,
        (value) => sizeToPixels(value, groupElementRef.current) ?? 0
      )
    : undefined;
  const sizesKey = isGrowing
    ? split.children.map(({ size }) => size ?? "").join()
    : "";
  const structureKey = `${splitGeneration}:${split.orientation}:${childIds}:${collapsedKey}:${sizesKey}`;

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
      sizes[getPanelId(child.id)] = growingShares?.[child.id] ?? child.size;
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

  // Whether a layout shows each of the split's tabsets collapsed (by id);
  // tabsets shown as the model has them are undefined, unless all of them are included
  const getShownCollapsed = (layout: Layout, includeAll: boolean) => {
    const collapsedIds = getCollapsedIds(layout);
    const shown: { [tabsetId: string]: boolean | undefined } = {};
    for (const child of split.children) {
      if (child.type === "tabset") {
        const isCollapsed = collapsedIds.has(child.id);
        shown[child.id] =
          includeAll || isCollapsed !== !!child.collapsed
            ? isCollapsed
            : undefined;
      }
    }

    return shown;
  };

  // Whether this split's Group is being resized by the user (e.g. dragging one of its separators)
  const isResizing = () => {
    const interactionState = getInteractionState();
    return (
      interactionState.state === "active" &&
      interactionState.hitRegions.some((region) => region.axis.id === groupId)
    );
  };

  // The model only changes when a resize ends, so while a tabset is dragged past its collapsed size (or back),
  // it's shown as it will be (e.g. its content is hidden as soon as it reaches its collapsed size); see isTabsetCollapsed.
  // Every tabset in the split is previewed (even those shown as the model has them), so that:
  // - none of them are measured during the resize (see TabsetSlot), since a change to the Group's constraints would interrupt it
  // - previews take precedence over tabsets that were collapsed to fit (e.g. one that's dragged open again is shown expanded)
  const updateCollapsePreview = useStableCallback((layout: Layout) =>
    reportCollapsePreview(
      getShownCollapsed(layout, true) as { [tabsetId: string]: boolean }
    )
  );

  // When a split's tabsets don't fit (e.g. the workspace is made narrower than their minimum sizes), its Group may collapse some of them;
  // they're shown collapsed without changing the model (see isTabsetCollapsed), so they're shown as the model has them again once they fit.
  // While the split is being resized, its tabsets are previewed instead (see updateCollapsePreview).
  const updateCollapseToFit = (layout: Layout) => {
    if (!isResizing()) {
      reportCollapseToFit(getShownCollapsed(layout, false));
    }
  };

  // The Group's layout, constraints, and size (and the split's structure) the collapsed-to-fit tabsets were last checked for (see the layout effect below)
  const collapseToFitCheckRef = useRef<{
    constraints: unknown;
    layout: Layout;
    size: number;
    structureKey: string;
  } | null>(null);

  // As the workspace is resized, the Group scales the layout it was last given, which may have been limited by its constraints
  // (e.g. a tabset held at its minimum size, or collapsed to fit); when the Group is resized,
  // the model's layout is applied again if what's shown differs from it, so that tabsets are shown as the model has them once they fit.
  // Only resizes count (not other changes to the Group's constraints, e.g. a tabset's header being measured after it's collapsed to fit),
  // since applying a layout that doesn't fit can collapse a tabset, which is then measured again.
  // Children with sizes in other units (e.g. "250px") scale with the workspace (see TabsetNode.size), so only their collapsed states are compared.
  const lastResizeCheckSizeRef = useRef<number | null>(null);
  const applyModelLayoutAfterResize = useStableCallback(() => {
    const appliedKey = getAppliedKey();
    if (
      appliedKey === null ||
      appliedKeyRef.current !== appliedKey ||
      isResizing()
    ) {
      return;
    }

    const size = getGroupSize();
    const prevSize = lastResizeCheckSizeRef.current;
    lastResizeCheckSizeRef.current = size;
    if (prevSize === null || prevSize === size) {
      return;
    }

    const { derivedItemConstraints, layout } = getMountedAxisState(groupId)!;
    const modelLayout = calculateSplitLayout(
      derivedItemConstraints,
      collapsedPanelIds,
      getPanelSizes()
    );
    const collapsedIds = getCollapsedIds(layout);
    const isShownDifferently = split.children.some((child) => {
      const panelId = getPanelId(child.id);
      return (
        (child.type === "tabset" &&
          collapsedIds.has(child.id) !== !!child.collapsed) ||
        ((isGrowing || typeof child.size === "number") &&
          !layoutNumbersEqual(layout[panelId], modelLayout[panelId], 0.01))
      );
    });
    if (isShownDifferently) {
      groupRef.current?.setLayout(modelLayout);
    }
  });

  // The Group's constraints change when it's resized (since they're converted to percentages of its size), or when its Panels' sizes are measured;
  // every split checks whether its layout needs to be applied again (see above), without re-rendering.
  // Panels re-register when their collapsed sizes are measured (or change), which the Group handles in a later commit,
  // so splits with collapsible tabsets are also rendered again (checking the layout, and which tabsets are collapsed to fit; see the layout effect below)
  const hasCollapsible = split.children.some(
    (child) => child.type === "tabset" && child.collapsible
  );
  useEffect(
    () =>
      subscribeToMountedAxis(groupId, ({ axis, next, prev }) => {
        // Layout changes (e.g. each pointer move while resizing) keep the same constraints, so they're skipped
        if (prev?.derivedItemConstraints !== next.derivedItemConstraints) {
          applyModelLayoutAfterResize();
          if (hasCollapsible) {
            requestLayoutCheck((count) => count + 1);
          }
        }

        // Only resizes of this split are previewed (e.g. resizing an outer split changes this split's percentages too);
        // the Workspace ends previews when the resize ends
        const interactionState = getInteractionState();
        if (
          hasCollapsible &&
          interactionState.state === "active" &&
          interactionState.hitRegions.some((region) => region.axis === axis)
        ) {
          updateCollapsePreview(next.layout);
        }
      }),
    [
      applyModelLayoutAfterResize,
      groupId,
      hasCollapsible,
      updateCollapsePreview
    ]
  );

  // Runs after every render, since the Group's constraints (e.g. its Panels' collapsed sizes) aren't part of its rendered state
  useIsomorphicLayoutEffect(() => {
    const appliedKey = getAppliedKey();
    if (appliedKey === null) {
      // Not registered (or not visible) yet
      return;
    }

    if (appliedKeyRef.current !== appliedKey) {
      appliedKeyRef.current = appliedKey;

      // Sizes come from the model; constraints have collapsed sizes (and sizes with other units) converted to percentages
      groupRef.current?.setLayout(
        calculateSplitLayout(
          getMountedAxisState(groupId)!.derivedItemConstraints,
          collapsedPanelIds,
          getPanelSizes()
        )
      );

      // The size the model's layout was applied at (see applyModelLayoutAfterResize)
      lastResizeCheckSizeRef.current = getGroupSize();
    }

    // While the split is being resized, its tabsets are previewed instead (see updateCollapsePreview)
    if (isResizing()) {
      return;
    }

    const { derivedItemConstraints } = getMountedAxisState(groupId)!;
    const lastCheck = collapseToFitCheckRef.current;

    const size = getGroupSize();

    // Tabsets collapsed to fit are checked after renders, since the model may have changed (e.g. one was collapsed by the user),
    // and the Group only reports layouts that differ from the previous one it reported;
    // only when the Group's layout, constraints, or size (or the split's structure) changed since they were last checked, though
    const { layout } = getMountedAxisState(groupId)!;
    if (
      lastCheck?.constraints !== derivedItemConstraints ||
      lastCheck.layout !== layout ||
      lastCheck.size !== size ||
      lastCheck.structureKey !== structureKey
    ) {
      collapseToFitCheckRef.current = {
        constraints: derivedItemConstraints,
        layout,
        size,
        structureKey
      };
      updateCollapseToFit(layout);
    }
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
      elementRef={setGroupElementRefs}
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

          // Resizing can collapse or expand collapsible tabsets (like collapsible Panels);
          // tabsets that were collapsed to fit before the resize (and still are) weren't collapsed by it,
          // so they keep their sizes and stay expanded in the model (and are shown expanded again once they fit)
          const collapsedIds = getCollapsedIds(layout);
          const collapsedToFitIds = new Set<string>();
          for (const id of collapsedIds) {
            if (collapseToFit[id] === true) {
              collapsedIds.delete(id);
              collapsedToFitIds.add(id);
            }
          }

          const reason = getResizeReason(split.children, collapsedIds);
          updateModel(reason, true, (prev) =>
            setSplitLayout(
              prev,
              split.id,
              nodeLayout,
              collapsedIds,
              collapsedToFitIds
            )
          );
        } else {
          const appliedKey = getAppliedKey();
          if (appliedKey !== null && appliedKeyRef.current === appliedKey) {
            updateCollapseToFit(layout);
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
                growingShares?.[child.id] !== undefined
                  ? `${growingShares[child.id]}%`
                  : typeof child.size === "number"
                    ? `${child.size}%`
                    : child.size
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
