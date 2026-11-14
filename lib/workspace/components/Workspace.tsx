"use client";

import {
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type Ref
} from "react";
import { createPortal } from "react-dom";
import { subscribeToInteractionState } from "../../global/mutable-state/interactions";
import { useId } from "../../shared/hooks/useId";
import { useIsomorphicLayoutEffect } from "../../shared/hooks/useIsomorphicLayoutEffect";
import { useMergedRefs } from "../../shared/hooks/useMergedRefs";
import { useStableCallback } from "../../shared/hooks/useStableCallback";
import { warnOnce } from "../../shared/utils/warnOnce";
import { getTestId } from "../../shared/utils/getTestId";
import { ParentGridContext } from "../../grid/contexts/ParentGridContext";
import { ParentGroupContext } from "../../flex/contexts/ParentGroupContext";
import { ParentPanelContext } from "../../flex/contexts/ParentPanelContext";
import { ParentWorkspaceContext } from "../contexts/ParentWorkspaceContext";
import {
  WorkspaceContext,
  type TabHost,
  type UpdateModel,
  type WorkspaceContextType
} from "../contexts/WorkspaceContext";
import { WorkspaceStoreContext } from "../contexts/WorkspaceStoreContext";
import { calculateSizeLimits } from "../utils/calculateSizeLimits";
import { getRemovedTabs } from "../models/getRemovedTabs";
import { createDragStore } from "../utils/createDragStore";
import { createTabListStore } from "../utils/createTabListStore";
import { getHiddenTabIds } from "../utils/getHiddenTabIds";
import type { TabListOverflowState } from "../utils/measureTabListOverflow";
import { createTabsetElementRegistry } from "../utils/createTabsetElementRegistry";
import {
  createWorkspaceStore,
  type WorkspaceState
} from "../utils/createWorkspaceStore";
import { addTab } from "../models/addTab";
import { closeTab } from "../models/closeTab";
import { closeTabset } from "../models/closeTabset";
import { collapseTabset } from "../models/collapseTabset";
import { createTearOffModel } from "../models/createTearOffModel";
import { expandTabset } from "../models/expandTabset";
import { floatTab } from "../models/floatTab";
import { floatTabset } from "../models/floatTabset";
import { getModelIndex } from "../models/getModelIndex";
import { getValidModelInput } from "../models/getValidModelInput";
import { hasConflictingIds } from "../models/hasConflictingIds";
import { insertTab } from "../models/insertTab";
import { insertTabset } from "../models/insertTabset";
import { maximizeTabset } from "../models/maximizeTabset";
import { moveTab } from "../models/moveTab";
import { moveTabset } from "../models/moveTabset";
import { normalizeModel } from "../models/normalizeModel";
import { resizeSplit } from "../models/resizeSplit";
import { restoreTabset } from "../models/restoreTabset";
import { selectTab } from "../models/selectTab";
import { updateTab } from "../models/updateTab";
import { updateRecentTabIds } from "../models/updateRecentTabIds";
import { updateTabset } from "../models/updateTabset";
import { TabContent } from "./TabContent";
import type {
  AcceptExternalDrop,
  BeforeModelChangeArgs,
  DisableDropArgs,
  DragNode,
  DragOrigin,
  DragSource,
  HiddenTabBehavior,
  MinimumSize,
  ParentTab,
  ParentTabset,
  ParentWorkspace,
  TabDropTarget,
  TabNode,
  TabRenderProps,
  TabsetNode,
  TearOffArgs,
  WorkspaceClassNames,
  WorkspaceImperativeHandle,
  WorkspaceModel,
  WorkspaceModelInput,
  WorkspaceProps,
  WorkspaceStyles
} from "../types";
import { useFloatingTabsetGesture } from "../hooks/useFloatingTabsetGesture";
import { useExternalDrop } from "../hooks/useExternalDrop";
import { useTabDrag } from "../hooks/useTabDrag";
import { getDefaultFloatingRect } from "../utils/getDefaultFloatingRect";
import { FloatingTabsets } from "./FloatingTabsets";
import { NodeView } from "./NodeView";
import { TabsetSlot } from "./TabsetSlot";
import { isRightToLeft } from "../utils/isRightToLeft";
import { measureAddedTabsetSize } from "../utils/measureAddedTabsetSize";
import { measureSplitSizes } from "../utils/measureSplitSizes";
import { pruneRemovedNodes } from "../utils/pruneRemovedNodes";
import { updateCollapseOverrides } from "../utils/updateCollapseOverrides";
import { sizeToPixels } from "../utils/sizeToPixels";
import { toModelDropTarget } from "../utils/toModelDropTarget";
import {
  createCopiedNode,
  type CopyTab,
  type CopyTabset
} from "../utils/createCopiedNode";
import { subscribeToNothing } from "../../shared/utils/subscribeToNothing";
import { DragPreview } from "./DragPreview";
import { DropIndicator } from "./DropIndicator";

function WorkspaceComponent<TabData = unknown, TabsetData = unknown>({
  acceptExternalDrop,
  className,
  classNames,
  copyTab,
  copyTabset,
  defaultModel,
  disabled = false,
  disableDragBetweenApps = false,
  disableDrop,
  dragGroup,
  dragSourceInfo,
  elementRef: elementRefProp,
  hiddenTabBehavior = "keep-mounted",
  id: idProp,
  lazyTabContent = false,
  onBeforeModelChange,
  onModelChanged,
  onTearOff,
  renderDragPreview,
  renderEmptyTabset,
  renderSeparator,
  renderTab,
  renderTabContent,
  renderTabsetDragPreview,
  renderTabsetToolbar,
  resizePreviewMode,
  serverRenderTabContent = false,
  style,
  styles,
  tabPlacement = "top",
  tabRemovalSelectionBehavior = "adjacent",
  tabsetMinHeight,
  tabsetMinWidth,
  workspaceRef,
  ...rest
}: WorkspaceProps<TabData, TabsetData>) {
  const id = useId(idProp);

  const outerGrid = useContext(ParentGridContext);
  const outerGroup = useContext(ParentGroupContext);
  const outerPanel = useContext(ParentPanelContext);
  const outerParents = useMemo(
    () => ({ grid: outerGrid, group: outerGroup, panel: outerPanel }),
    [outerGrid, outerGroup, outerPanel]
  );

  // The model is typed generically only at the public boundary
  const [model, setModel] = useState<WorkspaceModel>(() =>
    updateRecentTabIds(
      normalizeModel(getValidModelInput(defaultModel as WorkspaceModelInput)),
      tabRemovalSelectionBehavior
    )
  );
  const modelRef = useRef(model);

  // Incremented when the model is replaced, so that splits re-apply its sizes
  const [splitGeneration, setSplitGeneration] = useState(0);

  const [activeTabsetId, setActiveTabsetIdState] = useState<string>();
  const activeTabsetIdRef = useRef<string | undefined>(undefined);
  const setActiveTabsetId = useCallback((tabsetId: string) => {
    if (activeTabsetIdRef.current !== tabsetId) {
      activeTabsetIdRef.current = tabsetId;
      setActiveTabsetIdState(tabsetId);
    }
  }, []);

  const onModelChangedStable = useStableCallback(
    (...args: Parameters<NonNullable<typeof onModelChanged>>) =>
      onModelChanged?.(...args)
  );

  // Read when the model changes (rather than captured), since handles given to tabs and tabsets outlive renders
  const getTabRemovalSelectionBehavior = useStableCallback(
    () => tabRemovalSelectionBehavior
  );

  const onBeforeModelChangeStable = useStableCallback(
    (args: BeforeModelChangeArgs) =>
      onBeforeModelChange?.(
        args as BeforeModelChangeArgs<TabData, TabsetData>
      ) !== false
  );

  const updateModel = useCallback<UpdateModel>(
    (reason, isUserInteraction, update, { canBlock = true, origin } = {}) => {
      // Recently selected tabs are recorded around each change (rather than by each change),
      // starting from the current behavior (which may have changed since the previous change)
      const behavior = getTabRemovalSelectionBehavior();
      const current = modelRef.current;
      const prev = updateRecentTabIds(current, behavior);
      const updated = update(prev);
      if (updated === prev) {
        return false;
      }

      const next = updateRecentTabIds(updated, behavior);

      // Tabs (and tabsets) dropped in from another workspace report where they came from
      const source = origin && {
        sourceInfo: origin.sourceInfo,
        sourceWorkspaceId: origin.sourceWorkspaceId
      };

      // Only changes made by the user can be blocked (the application makes the others itself)
      if (
        isUserInteraction &&
        canBlock &&
        !onBeforeModelChangeStable({
          model: next,
          prevModel: current,
          reason,
          removedTabs: getRemovedTabs(current, next),
          ...source
        })
      ) {
        return false;
      }

      // The change was made to the model as it was before the callback, so it's dropped if the callback changed the model (e.g. with the imperative API)
      if (modelRef.current !== current) {
        return false;
      }

      modelRef.current = next;
      setModel(next);
      onModelChangedStable(next as WorkspaceModel<TabData, TabsetData>, {
        isUserInteraction,
        reason,
        ...source
      });

      return true;
    },
    [
      getTabRemovalSelectionBehavior,
      onBeforeModelChangeStable,
      onModelChangedStable
    ]
  );

  // Tab lists report their free space here (rather than in React state), so that it can be read synchronously, e.g. from outside the Workspace
  const [tabListFreeSpaceStore] = useState(() => createTabListStore<number>());
  const [tabListOverflowStore] = useState(() =>
    // Measured lists are reused while they're the same (see measureTabListOverflow), so they're compared by reference
    createTabListStore<TabListOverflowState>(
      (a, b) => a.hidden === b.hidden && a.hiddenOrClipped === b.hiddenOrClipped
    )
  );

  // The tab (or tabset) being dragged, and where it would be dropped (see createDragStore)
  const [dragStore] = useState(createDragStore);

  // Tabsets register their elements here (see TabsetSlot), so that drags can be hit tested without searching the document
  const [tabsetElements] = useState(createTabsetElementRegistry);

  // Read by imperative methods, e.g. to tell which side of the screen a drop region is on (see toModelDropTarget)
  const rootElementRef = useRef<HTMLDivElement | null>(null);

  // Drags are started by useTabDrag (below), which needs the model's callbacks
  const startExternalDragRef = useRef<
    WorkspaceImperativeHandle["startExternalDrag"] | null
  >(null);

  // Floating tabsets are positioned relative to the layout (see WorkspaceModel.floating);
  // while a tabset is maximized, the rest of the layout is covered (and shouldn't be focusable)
  const layoutRef = useRef<HTMLDivElement | null>(null);

  const handle = useMemo<WorkspaceImperativeHandle>(() => {
    const getActiveTabsetId = () => {
      const tabsetId = activeTabsetIdRef.current;

      return tabsetId !== undefined &&
        getModelIndex(modelRef.current).tabsetsById.has(tabsetId)
        ? tabsetId
        : undefined;
    };

    return {
      addTab: (tab, options = {}) => {
        const target =
          options.target &&
          toModelDropTarget(
            options.target,
            isRightToLeft(rootElementRef.current)
          );

        const result = addTab(modelRef.current, tab, {
          ...options,
          size:
            target &&
            measureAddedTabsetSize(
              modelRef.current,
              target,
              options.size,
              layoutRef.current,
              id,
              (tabsetId) => tabsetElements.get(tabsetId)?.tabset
            ),
          tabsetId: options.tabsetId ?? getActiveTabsetId(),
          target
        });
        updateModel(result.added ? "add" : "select", false, () => result.model);

        return result.added;
      },
      closeTab: (tabId) =>
        updateModel("close", false, (prev) => closeTab(prev, tabId)),
      closeTabset: (tabsetId) =>
        updateModel("close", false, (prev) => closeTabset(prev, tabsetId)),
      collapseTabset: (tabsetId) =>
        updateModel("collapse", false, (prev) =>
          collapseTabset(prev, tabsetId)
        ),
      expandTabset: (tabsetId) =>
        updateModel("expand", false, (prev) => expandTabset(prev, tabsetId)),
      floatTab: (tabId, rect) =>
        updateModel("float", false, (prev) => {
          const tabsetId = getModelIndex(prev).tabsetsByTabId.get(tabId)?.id;

          return floatTab(
            prev,
            tabId,
            getDefaultFloatingRect(
              layoutRef.current,
              tabsetId !== undefined
                ? tabsetElements.get(tabsetId)?.tabset
                : undefined,
              rect
            )
          );
        }),
      floatTabset: (tabsetId, rect) =>
        updateModel("float", false, (prev) =>
          floatTabset(
            prev,
            tabsetId,
            getDefaultFloatingRect(
              layoutRef.current,
              tabsetElements.get(tabsetId)?.tabset,
              rect
            )
          )
        ),
      getActiveTabsetId,
      getModel: () => modelRef.current,
      getTabListFreeSpace: (tabsetId) => tabListFreeSpaceStore.get(tabsetId),
      getTabListOverflow: (tabsetId, options) =>
        getHiddenTabIds(tabListOverflowStore.get(tabsetId), options),
      maximizeTabset: (tabsetId) =>
        updateModel("maximize", false, (prev) =>
          maximizeTabset(prev, tabsetId)
        ),
      moveTab: (tabId, target) =>
        updateModel("move", false, (prev) =>
          moveTab(
            prev,
            tabId,
            toModelDropTarget(target, isRightToLeft(rootElementRef.current))
          )
        ),
      moveTabset: (tabsetId, target) =>
        updateModel("move", false, (prev) =>
          moveTabset(
            prev,
            tabsetId,
            toModelDropTarget(target, isRightToLeft(rootElementRef.current))
          )
        ),
      resizeSplit: (splitId, sizes) => {
        // Splits apply the model's sizes when they change structure (see SplitView), so they're applied again after the sizes change
        if (
          updateModel("resize", false, (prev) =>
            resizeSplit(
              prev,
              splitId,
              measureSplitSizes(prev, splitId, sizes, layoutRef.current, id)
            )
          )
        ) {
          setSplitGeneration((prev) => prev + 1);
        }
      },
      restoreTabset: () => updateModel("restore", false, restoreTabset),
      selectTab: (tabId) =>
        updateModel("select", false, (prev) => selectTab(prev, tabId)),
      setModel: (value) => {
        updateModel("set-model", false, () =>
          normalizeModel(getValidModelInput(value))
        );
        setSplitGeneration((prev) => prev + 1);

        return modelRef.current;
      },
      startExternalDrag: (event, options) =>
        startExternalDragRef.current?.(event, options) ?? Promise.resolve(null),
      subscribeToTabListFreeSpace: (tabsetId, listener) =>
        tabListFreeSpaceStore.subscribe(tabsetId, listener),
      subscribeToTabListOverflow: (tabsetId, listener, options) => {
        // Only changes to the requested list are reported
        let prevTabIds = getHiddenTabIds(
          tabListOverflowStore.get(tabsetId),
          options
        );
        return tabListOverflowStore.subscribe(tabsetId, (state) => {
          const tabIds = getHiddenTabIds(state, options);
          if (tabIds !== prevTabIds) {
            prevTabIds = tabIds;
            listener(tabIds);
          }
        });
      },
      updateTab: (tabId, changes) =>
        updateModel("update", false, (prev) => updateTab(prev, tabId, changes)),
      updateTabset: (tabsetId, changes) =>
        updateModel("update", false, (prev) =>
          updateTabset(prev, tabsetId, changes)
        )
    };
  }, [
    id,
    tabListFreeSpaceStore,
    tabListOverflowStore,
    tabsetElements,
    updateModel
  ]);

  useImperativeHandle(
    workspaceRef as Ref<WorkspaceImperativeHandle> | undefined,
    () => handle,
    [handle]
  );

  const parentWorkspace = useMemo<ParentWorkspace>(
    () => ({ ...handle, id }),
    [handle, id]
  );

  // Handles given to tabs and tabsets (and their content) are stable for their lifetimes
  const [handles] = useState(() => ({
    tabs: new Map<string, ParentTab>(),
    tabsets: new Map<string, ParentTabset>()
  }));

  const getTabHandle = useCallback(
    (tabId: string) => {
      let parentTab = handles.tabs.get(tabId);
      if (!parentTab) {
        parentTab = {
          close: () => handle.closeTab(tabId),
          float: (rect) => handle.floatTab(tabId, rect),
          getTabsetId: () =>
            getModelIndex(modelRef.current).tabsetsByTabId.get(tabId)?.id ?? "",
          id: tabId,
          isSelected: () =>
            getModelIndex(modelRef.current).tabsetsByTabId.get(tabId)
              ?.selectedId === tabId,
          select: () => handle.selectTab(tabId),
          workspaceId: id
        };
        handles.tabs.set(tabId, parentTab);
      }

      return parentTab;
    },
    [handle, handles, id]
  );

  const getTabsetHandle = useCallback(
    (tabsetId: string) => {
      let parentTabset = handles.tabsets.get(tabsetId);
      if (!parentTabset) {
        parentTabset = {
          addTab: (tab, { region, ...options } = {}) =>
            handle.addTab(tab, {
              ...options,
              tabsetId,
              target: region === undefined ? undefined : { region, tabsetId }
            }),
          close: () => handle.closeTabset(tabsetId),
          collapse: () => handle.collapseTabset(tabsetId),
          expand: () => handle.expandTabset(tabsetId),
          float: (rect) => handle.floatTabset(tabsetId, rect),
          id: tabsetId,
          isCollapsed: () =>
            !!getModelIndex(modelRef.current).tabsetsById.get(tabsetId)
              ?.collapsed,
          isFloating: () =>
            getModelIndex(modelRef.current).floatingTabsetIds.has(tabsetId),
          isMaximized: () => modelRef.current.maximizedTabsetId === tabsetId,
          maximize: () => handle.maximizeTabset(tabsetId),
          restore: () => {
            if (modelRef.current.maximizedTabsetId === tabsetId) {
              handle.restoreTabset();
            }
          },
          selectTab: (tabId) => {
            if (
              getModelIndex(modelRef.current).tabsetsByTabId.get(tabId)?.id ===
              tabsetId
            ) {
              handle.selectTab(tabId);
            }
          },
          workspaceId: id
        };
        handles.tabsets.set(tabsetId, parentTabset);
      }

      return parentTabset;
    },
    [handle, handles, id]
  );

  const [rootElement, setRootElement] = useState<HTMLDivElement | null>(null);
  const mergedRef = useMergedRefs(
    rootElementRef,
    setRootElement,
    elementRefProp
  );

  // Tab content is rendered (via portals) into these elements, which are moved between tabsets;
  // this lets a tab be moved without remounting its content
  // (although moving elements resets some browser state, e.g. iframes are reloaded)
  // (they're bare wrappers, shown with "display: contents"; TabContent renders the tab panel element within them)
  const [tabHosts] = useState(() => new Map<string, TabHost>());
  const tabHostCountRef = useRef(0);
  const ownerDocument = rootElement?.ownerDocument;

  const getTabHost = useCallback(
    (tabId: string) => {
      let host = tabHosts.get(tabId);
      if (!host) {
        const index = ++tabHostCountRef.current;
        host = {
          element: null,
          panelId: `${id}-tab-panel-${index}`,
          tabElementId: `${id}-tab-${index}`
        };
        tabHosts.set(tabId, host);
      }

      // Hosts are created by the workspace's own document (e.g. a popup window's) so that tab content belongs to that window;
      // elements created by another document can be moved into it, but they keep that document's prototypes (e.g. HTMLElement)
      if (!host.element && ownerDocument) {
        host.element = ownerDocument.createElement("div");
      }

      return host;
    },
    [id, ownerDocument, tabHosts]
  );

  const modelIndex = getModelIndex(model);

  // Clean up after removed tabs and tabsets
  useEffect(() => {
    for (const [tabId, host] of tabHosts) {
      if (!modelIndex.tabsById.has(tabId)) {
        host.element?.remove();
        tabHosts.delete(tabId);
        handles.tabs.delete(tabId);
      }
    }

    for (const tabId of handles.tabs.keys()) {
      if (!modelIndex.tabsById.has(tabId)) {
        handles.tabs.delete(tabId);
      }
    }

    for (const tabsetId of handles.tabsets.keys()) {
      if (!modelIndex.tabsetsById.has(tabsetId)) {
        handles.tabsets.delete(tabsetId);
      }
    }
  }, [handles, modelIndex, tabHosts]);

  // Tab content is rendered through portals, which can't be rendered on the server (or during hydration);
  // content opted into server rendering is rendered inline by TabPanels until hydration has finished
  const isHydrating = useSyncExternalStore(
    subscribeToNothing,
    () => false,
    () => true
  );

  const getHiddenTabBehavior = useCallback(
    (tab: TabNode): HiddenTabBehavior =>
      typeof hiddenTabBehavior === "function"
        ? hiddenTabBehavior(tab as TabNode<TabData>)
        : hiddenTabBehavior,
    [hiddenTabBehavior]
  );

  const isTabContentLazy = useCallback(
    (tab: TabNode): boolean =>
      typeof lazyTabContent === "function"
        ? lazyTabContent(tab as TabNode<TabData>)
        : lazyTabContent,
    [lazyTabContent]
  );

  const shouldServerRenderTabContent = useCallback(
    (tab: TabNode) =>
      typeof serverRenderTabContent === "function"
        ? serverRenderTabContent(tab as TabNode<TabData>)
        : serverRenderTabContent,
    [serverRenderTabContent]
  );

  // Minimum sizes include each tabset's "chrome" (e.g. tabs) and each split's separators, which are measured after rendering
  const [chromeSizes, setChromeSizes] = useState<{
    [tabsetId: string]: MinimumSize;
  }>({});
  const [separatorsSizes, setSeparatorsSizes] = useState<{
    [splitId: string]: number;
  }>({});

  // Collapsible tabsets collapse to their headers, which are measured (along their splits) after rendering
  const [collapsedSizes, setCollapsedSizes] = useState<{
    [tabsetId: string]: number;
  }>({});

  const reportChromeSize = useCallback(
    (tabsetId: string, size: MinimumSize) =>
      setChromeSizes((prev) =>
        prev[tabsetId]?.height === size.height &&
        prev[tabsetId]?.width === size.width
          ? prev
          : { ...prev, [tabsetId]: size }
      ),
    []
  );

  // While a split is resized, its tabsets are shown collapsed (or expanded) as they will be when the resize ends
  const [collapsePreview, setCollapsePreview] = useState<{
    [tabsetId: string]: boolean;
  }>({});

  const reportCollapsePreview = useCallback(
    (previews: { [tabsetId: string]: boolean | undefined }) =>
      setCollapsePreview((prev) => updateCollapseOverrides(prev, previews)),
    []
  );

  // When a split's tabsets don't fit (e.g. the workspace is narrower than their minimum sizes), its Group may collapse some of them;
  // they're shown collapsed without changing the model, so they're shown expanded again (as the model has them) once they fit
  const [collapseToFit, setCollapseToFit] = useState<{
    [tabsetId: string]: boolean;
  }>({});

  const reportCollapseToFit = useCallback(
    (changes: { [tabsetId: string]: boolean | undefined }) =>
      setCollapseToFit((prev) => updateCollapseOverrides(prev, changes)),
    []
  );

  // Only tabsets within splits (those with parents) can be collapsed to fit; e.g. a tabset left as the root (when the rest of its split is closed)
  // isn't shown collapsed, even before its entry is removed (below), since no split reports it anymore
  const tabsetsInSplitsIds = useMemo(
    () => new Set(modelIndex.parentsById.keys()),
    [modelIndex]
  );
  const collapseToFitInSplits = useMemo(
    () => pruneRemovedNodes(collapseToFit, tabsetsInSplitsIds),
    [collapseToFit, tabsetsInSplitsIds]
  );

  // Tabsets shown collapsed (or expanded) unlike the model (see isTabsetCollapsed); previews take precedence while a split is resized
  const collapseOverrides = useMemo(
    () =>
      Object.keys(collapseToFitInSplits).length === 0
        ? collapsePreview
        : Object.keys(collapsePreview).length === 0
          ? collapseToFitInSplits
          : { ...collapseToFitInSplits, ...collapsePreview },
    [collapsePreview, collapseToFitInSplits]
  );

  // Previews only last as long as the resize that reported them (including a canceled one),
  // even if the split that reported them has since been removed or stopped tracking them
  useEffect(
    () =>
      subscribeToInteractionState(({ next, prev }) => {
        if (prev.state === "active" && next.state !== "active") {
          setCollapsePreview((current) =>
            Object.keys(current).length > 0 ? {} : current
          );
        }
      }),
    []
  );

  const reportCollapsedSize = useCallback(
    (tabsetId: string, size: number) =>
      setCollapsedSizes((prev) =>
        prev[tabsetId] === size ? prev : { ...prev, [tabsetId]: size }
      ),
    []
  );

  const reportSeparatorsSize = useCallback(
    (splitId: string, size: number) =>
      setSeparatorsSizes((prev) =>
        prev[splitId] === size ? prev : { ...prev, [splitId]: size }
      ),
    []
  );

  useEffect(() => {
    setChromeSizes((prev) => pruneRemovedNodes(prev, modelIndex.nodeIds));
    setSeparatorsSizes((prev) => pruneRemovedNodes(prev, modelIndex.nodeIds));
    setCollapsedSizes((prev) => pruneRemovedNodes(prev, modelIndex.nodeIds));
    setCollapsePreview((prev) => pruneRemovedNodes(prev, modelIndex.nodeIds));
    setCollapseToFit((prev) => pruneRemovedNodes(prev, tabsetsInSplitsIds));
  }, [modelIndex, tabsetsInSplitsIds]);

  // Minimum sizes may be relative to the viewport (e.g. "20vw"), so they're converted to pixels again when it's resized;
  // the element (which units like "em" are relative to) is wrapped in a new object each time
  const [unitsReference, setUnitsReference] = useState<{
    element: HTMLElement;
  } | null>(null);
  useEffect(() => {
    if (!rootElement) {
      return;
    }

    const update = () => setUnitsReference({ element: rootElement });
    update();

    const ownerWindow = rootElement.ownerDocument.defaultView;
    ownerWindow?.addEventListener("resize", update);

    return () => {
      ownerWindow?.removeEventListener("resize", update);
    };
  }, [rootElement]);

  // Maximums that can't be converted yet (e.g. "em" before the workspace has rendered) aren't applied until they can be
  const { maximumSizes, minimumSizes } = useMemo(() => {
    const unitsElement = unitsReference?.element ?? null;

    return calculateSizeLimits(model.root, {
      getChromeSize: (tabsetId) => chromeSizes[tabsetId],
      getCollapsedSize: (tabsetId) => collapsedSizes[tabsetId],
      getContentMaximumSize: (tabset: TabsetNode) => ({
        height: sizeToPixels(tabset.maxHeight, unitsElement) ?? Infinity,
        width: sizeToPixels(tabset.maxWidth, unitsElement) ?? Infinity
      }),
      getContentMinimumSize: (tabset: TabsetNode) => ({
        height:
          sizeToPixels(tabset.minHeight ?? tabsetMinHeight, unitsElement) ?? 0,
        width:
          sizeToPixels(tabset.minWidth ?? tabsetMinWidth, unitsElement) ?? 0
      }),
      getSeparatorsSize: (splitId) => separatorsSizes[splitId]
    });
  }, [
    chromeSizes,
    collapsedSizes,
    model.root,
    separatorsSizes,
    tabsetMinHeight,
    tabsetMinWidth,
    unitsReference
  ]);

  // Floating tabsets can be resized down to their content's minimum size plus their "chrome" (e.g. tabs), like tabsets in the layout
  const getFloatingMinimumSize = useStableCallback(
    (tabsetId: string): MinimumSize => {
      const tabset = getModelIndex(modelRef.current).tabsetsById.get(tabsetId);
      const chrome = chromeSizes[tabsetId] ?? { height: 0, width: 0 };
      const unitsElement = unitsReference?.element ?? null;

      return {
        height:
          chrome.height +
          (sizeToPixels(tabset?.minHeight ?? tabsetMinHeight, unitsElement) ??
            0),
        width:
          chrome.width +
          (sizeToPixels(tabset?.minWidth ?? tabsetMinWidth, unitsElement) ?? 0)
      };
    }
  );
  const startFloatingGesture = useFloatingTabsetGesture({
    getMinimumSize: getFloatingMinimumSize,
    updateModel
  });

  const getDragNode = useStableCallback(
    (source: DragSource): DragNode | undefined => {
      const { tabsById, tabsetsById } = getModelIndex(modelRef.current);
      if (source.type === "tab") {
        const tab = tabsById.get(source.tabId);

        return tab ? { tab, type: "tab" } : undefined;
      }

      const tabset = tabsetsById.get(source.tabsetId);

      return tabset ? { tabset, type: "tabset" } : undefined;
    }
  );

  // A tabset can't be dropped where any of its tabs couldn't be;
  // when its tabs are moved into a tab list, each tab is inserted after the previous one
  // The origin is undefined for new tabs (dragged in from outside of any workspace)
  const isDropDisabledByProp = (
    node: DragNode,
    source: DisableDropArgs["source"],
    target: TabDropTarget,
    isCopy: boolean,
    origin: DragOrigin | undefined
  ) => {
    if (typeof disableDrop !== "function") {
      return !!disableDrop;
    }

    const model = modelRef.current as WorkspaceModel<TabData, TabsetData>;
    const { sourceInfo, sourceWorkspaceId } = origin ?? {};
    if (node.type === "tab") {
      return disableDrop({
        isCopy,
        model,
        source,
        sourceInfo,
        sourceWorkspaceId,
        tab: node.tab as TabNode<TabData>,
        tabset: undefined,
        target
      });
    }

    const tabset = node.tabset as TabsetNode<TabData, TabsetData>;

    return tabset.tabs.length === 0
      ? disableDrop({
          isCopy,
          model,
          source,
          sourceInfo,
          sourceWorkspaceId,
          tab: undefined,
          tabset,
          target
        })
      : tabset.tabs.some((tab, index) =>
          disableDrop({
            isCopy,
            model,
            source,
            sourceInfo,
            sourceWorkspaceId,
            tab,
            tabset,
            target:
              "index" in target
                ? { ...target, index: target.index + index }
                : target
          })
        );
  };

  const isDropDisabled = useStableCallback(
    (source: DragSource, target: TabDropTarget, isCopy: boolean) => {
      if (typeof disableDrop !== "function") {
        return !!disableDrop;
      }

      // Sources removed during the drag (e.g. by the imperative API) can't be dropped
      const node = getDragNode(source);

      return node
        ? isDropDisabledByProp(node, "local", target, isCopy, {
            sourceInfo: dragSourceInfo,
            sourceWorkspaceId: id
          })
        : true;
    }
  );

  // Tabs (and tabsets) dragged from other workspaces in the group (see the dragGroup prop) keep their ids, so they can't be dropped beside nodes with the same ids;
  // tabsets with the keepWhenEmpty flag stay in their own workspaces (like they aren't torn off); disabled workspaces don't accept drops.
  // Copies get their own ids (and leave the dragged tabset where it was), so neither applies to them
  const isExternalDropDisabled = useStableCallback(
    (
      node: DragNode,
      target: TabDropTarget,
      isCopy: boolean,
      origin: DragOrigin
    ) =>
      disabled ||
      (!isCopy &&
        ((node.type === "tabset" && !!node.tabset.keepWhenEmpty) ||
          hasConflictingIds(modelRef.current, node, target))) ||
      isDropDisabledByProp(node, "external", target, isCopy, origin)
  );

  // Dropping while the copy modifier key is held copies tabs (and tabsets) when there's a prop to copy them with
  const canCopy = useStableCallback(
    (node: DragNode) =>
      !disabled && (node.type === "tab" ? !!copyTab : !!copyTabset)
  );

  // Tabs dragged in from outside of any workspace (see startExternalDrag and acceptExternalDrop) are checked like tabs from other workspaces
  const isNewTabDropDisabled = useStableCallback(
    (tab: TabNode, target: TabDropTarget) => {
      const node: DragNode = { tab, type: "tab" };

      return (
        disabled ||
        hasConflictingIds(modelRef.current, node, target) ||
        isDropDisabledByProp(node, "new", target, false, undefined)
      );
    }
  );

  // Whether every tab dragged in from outside of any workspace would be rejected, before the tab is known (see useExternalDrop)
  const areNewTabDropsDisabled = useStableCallback(
    () => disabled || disableDrop === true
  );

  const onDrop = useStableCallback(
    (
      source: DragSource,
      target: TabDropTarget,
      isCopy: boolean,
      canMove: boolean
    ) => {
      // Copies that the application declines (or that can't be added) are moved instead, where they can be (unless they were blocked)
      if (isCopy) {
        const node = getDragNode(source);
        if (
          (node && insertCopy(node, target, undefined) !== false) ||
          !canMove ||
          isDropDisabled(source, target, false)
        ) {
          return;
        }
      }

      updateModel("move", true, (prev) => {
        const modelTarget = toModelDropTarget(
          target,
          isRightToLeft(rootElementRef.current)
        );

        return source.type === "tab"
          ? moveTab(prev, source.tabId, modelTarget)
          : moveTabset(prev, source.tabsetId, modelTarget);
      });
    }
  );

  const hasOnTearOff = !!onTearOff;
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && hasOnTearOff) {
      warnOnce(
        "The Workspace onTearOff prop is deprecated and will be removed in the next major version; open popout windows from a button instead (see usePopoutWindows)"
      );
    }
  }, [hasOnTearOff]);

  // Sources removed during the drag (e.g. by the imperative API) can't be torn off;
  // neither can tabsets with the keepWhenEmpty flag, which applications anchor in place
  const canTearOff = useStableCallback((source: DragSource) => {
    if (!onTearOff) {
      return false;
    }

    const { tabsById, tabsetsById } = getModelIndex(modelRef.current);
    if (source.type === "tab") {
      return tabsById.has(source.tabId);
    }

    const tabset = tabsetsById.get(source.tabsetId);

    return !!tabset && !tabset.keepWhenEmpty;
  });

  const handleTearOff = useStableCallback(
    (
      source: DragSource,
      { screenX, screenY }: { screenX: number; screenY: number }
    ) => {
      if (!onTearOff || !canTearOff(source)) {
        return;
      }

      const model = modelRef.current as WorkspaceModel<TabData, TabsetData>;
      const tearOffModel = createTearOffModel(model, source);
      if (!tearOffModel) {
        return;
      }

      // The source (e.g. a tab) and the tabset it's dragged from
      const { tabsById, tabsetsById, tabsetsByTabId } = getModelIndex(model);
      const sourceNode =
        source.type === "tab"
          ? {
              tab: tabsById.get(source.tabId) as TabNode<TabData>,
              tabset: tabsetsByTabId.get(source.tabId) as TabsetNode<
                TabData,
                TabsetData
              >,
              type: "tab" as const
            }
          : {
              tabset: tabsetsById.get(source.tabsetId) as TabsetNode<
                TabData,
                TabsetData
              >,
              type: "tabset" as const
            };
      const rect = tabsetElements
        .get(sourceNode.tabset.id)
        ?.tabset?.getBoundingClientRect();

      const args: TearOffArgs<TabData, TabsetData> = {
        ...(sourceNode.type === "tab"
          ? { tab: sourceNode.tab, type: "tab" }
          : { tabset: sourceNode.tabset, type: "tabset" }),
        height: rect?.height ?? 0,
        model: tearOffModel,
        screenX,
        screenY,
        width: rect?.width ?? 0
      };

      // The application has already accepted it (e.g. opened it in a popup window), so its removal can't be blocked
      if (onTearOff(args) === true) {
        updateModel(
          "tear-off",
          true,
          (current) =>
            source.type === "tab"
              ? closeTab(current, source.tabId)
              : closeTabset(current, source.tabsetId),
          { canBlock: false }
        );
      }
    }
  );

  // Inserts a tab (or tabset) dragged in from another workspace, or a new tab dragged in from outside of any workspace;
  // returns whether it was inserted (e.g. so that it's only removed from the workspace it was dragged from if it was),
  // or "blocked" if it could have been but the application blocked it (see the onBeforeModelChange prop)
  const insertDropped = useStableCallback(
    (
      reason: "add" | "copy" | "transfer",
      node: DragNode,
      target: TabDropTarget,
      origin: DragOrigin | undefined
    ): boolean | "blocked" => {
      let canInsert = false;
      const isInserted = updateModel(
        reason,
        true,
        (prev) => {
          const modelTarget = toModelDropTarget(
            target,
            isRightToLeft(rootElementRef.current)
          );
          const next =
            node.type === "tab"
              ? insertTab(prev, node.tab, modelTarget)
              : insertTabset(prev, node.tabset, modelTarget);
          canInsert = next !== prev;

          return next;
        },
        { origin }
      );

      return isInserted || (canInsert ? "blocked" : false);
    }
  );

  // Inserts a copy of a dragged tab (or tabset) made by the application (see the copyTab and copyTabset props);
  // returns whether it was inserted, or "blocked" (see insertDropped)
  const insertCopy = useStableCallback(
    (
      node: DragNode,
      target: TabDropTarget,
      origin: DragOrigin | undefined
    ): boolean | "blocked" => {
      const copy = createCopiedNode({
        copyTab: copyTab as CopyTab | undefined,
        copyTabset: copyTabset as CopyTabset | undefined,
        model: modelRef.current,
        node,
        target
      });

      return !!copy && insertDropped("copy", copy, target, origin);
    }
  );

  // Returns whether the tab (or tabset) was moved here, so that it's removed from the workspace it was dragged from (unlike a copy)
  const handleTransferIn = useStableCallback(
    (
      node: DragNode,
      target: TabDropTarget,
      isCopy: boolean,
      origin: DragOrigin
    ) => {
      if (isCopy) {
        // Copies that were blocked aren't moved instead
        if (insertCopy(node, target, origin) !== false) {
          return false;
        }

        // Copies that the application declines (or that can't be added) are moved instead, where they can be
        if (isExternalDropDisabled(node, target, false, origin)) {
          return false;
        }
      }

      return insertDropped("transfer", node, target, origin) === true;
    }
  );

  const handleNewTabDrop = useCallback(
    (tab: TabNode, target: TabDropTarget) =>
      insertDropped("add", { tab, type: "tab" }, target, undefined) === true,
    [insertDropped]
  );

  // Another workspace has already added it, so its removal can't be blocked
  const handleTransferOut = useStableCallback((source: DragSource) =>
    updateModel(
      "transfer",
      true,
      (prev) =>
        source.type === "tab"
          ? closeTab(prev, source.tabId)
          : closeTabset(prev, source.tabsetId),
      { canBlock: false }
    )
  );

  const getModel = useCallback(() => modelRef.current, []);
  const getDragSourceInfo = useStableCallback(() => dragSourceInfo);
  const getRootElement = useCallback(() => rootElementRef.current, []);

  const {
    dragSource,
    isCopy,
    isNativeDragOver,
    isNativeDragSource,
    isTearOff,
    nativePreviewNode,
    newTabPreview,
    previewElementRef,
    previewPointRef,
    startExternalDrag,
    startTabDrag,
    startTabsetDrag
  } = useTabDrag({
    canCopy,
    canTearOff,
    disableDragBetweenApps,
    dragGroup,
    dragStore,
    getDragNode,
    getDragSourceInfo,
    getModel,
    getRootElement,
    isDropDisabled,
    isExternalDropDisabled,
    isNewTabDropDisabled,
    onDrop,
    onNewTabDrop: handleNewTabDrop,
    onTearOff: handleTearOff,
    onTransferIn: handleTransferIn,
    onTransferOut: handleTransferOut,
    rootElement,
    tabsetElements,
    workspaceId: id
  });
  useIsomorphicLayoutEffect(() => {
    startExternalDragRef.current = startExternalDrag;
  }, [startExternalDrag]);

  const getAcceptExternalDrop = useStableCallback(
    () => acceptExternalDrop as AcceptExternalDrop | undefined
  );
  const isExternalDragOver = useExternalDrop({
    areDropsDisabled: areNewTabDropsDisabled,
    dragStore,
    getAcceptExternalDrop,
    getModel,
    isEnabled: acceptExternalDrop !== undefined,
    isNewTabDropDisabled,
    onNewTabDrop: handleNewTabDrop,
    rootElement,
    tabsetElements
  });

  // Keyboard interactions can ask for a tab to be focused after it re-renders
  const focusRequestRef = useRef<string | undefined>(undefined);
  const requestFocus = useCallback((tabId: string) => {
    focusRequestRef.current = tabId;
  }, []);
  const takeFocusRequest = useCallback((tabId: string) => {
    if (focusRequestRef.current === tabId) {
      focusRequestRef.current = undefined;
      return true;
    }
    return false;
  }, []);

  const context = useMemo<WorkspaceContextType>(
    () => ({
      activeTabsetId,
      collapsedSizes,
      collapseOverrides,
      collapsePreview,
      collapseToFit: collapseToFitInSplits,
      disabled,
      dragGroup,
      dragStore,
      getTabHandle,
      getTabHost,
      getHiddenTabBehavior,
      getTabsetHandle,
      id,
      isHydrating,
      isTabContentLazy,
      maximumSizes,
      minimumSizes,
      model,
      modelIndex,
      outerParents,
      classNames: classNames as WorkspaceClassNames | undefined,
      renderEmptyTabset: renderEmptyTabset as
        | ((tabset: TabsetNode) => ReactNode)
        | undefined,
      renderSeparator,
      renderTab: renderTab as
        | ((tab: TabNode, props: TabRenderProps) => ReactNode)
        | undefined,
      renderTabContent: renderTabContent as (tab: TabNode) => ReactNode,
      renderTabsetToolbar: renderTabsetToolbar as
        | ((tabset: TabsetNode) => ReactNode)
        | undefined,
      reportChromeSize,
      reportCollapsePreview,
      reportCollapseToFit,
      reportCollapsedSize,
      reportSeparatorsSize,
      requestFocus,
      resizePreviewMode,
      setActiveTabsetId,
      shouldServerRenderTabContent,
      splitGeneration,
      startFloatingGesture,
      startTabDrag,
      startTabsetDrag,
      styles: styles as WorkspaceStyles | undefined,
      tabListFreeSpaceStore,
      tabListOverflowStore,
      tabPlacement,
      tabsetElements,
      takeFocusRequest,
      updateModel
    }),
    [
      activeTabsetId,
      collapsedSizes,
      collapseOverrides,
      collapsePreview,
      collapseToFitInSplits,
      disabled,
      dragGroup,
      dragStore,
      getTabHandle,
      getTabHost,
      getHiddenTabBehavior,
      getTabsetHandle,
      id,
      isHydrating,
      isTabContentLazy,
      maximumSizes,
      minimumSizes,
      model,
      modelIndex,
      outerParents,
      classNames,
      renderEmptyTabset,
      renderSeparator,
      renderTab,
      renderTabContent,
      renderTabsetToolbar,
      reportChromeSize,
      reportCollapsePreview,
      reportCollapseToFit,
      reportCollapsedSize,
      reportSeparatorsSize,
      requestFocus,
      resizePreviewMode,
      setActiveTabsetId,
      shouldServerRenderTabContent,
      splitGeneration,
      startFloatingGesture,
      startTabDrag,
      startTabsetDrag,
      styles,
      tabListFreeSpaceStore,
      tabListOverflowStore,
      tabPlacement,
      tabsetElements,
      takeFocusRequest,
      updateModel
    ]
  );

  // Hooks like useParentTabState read this state from a store, so that they don't re-render whenever the context changes
  const workspaceState = useMemo<WorkspaceState>(
    () => ({
      activeTabsetId,
      collapseOverrides,
      collapseToFit: collapseToFitInSplits,
      disabled,
      dragGroup,
      model,
      modelIndex
    }),
    [
      activeTabsetId,
      collapseOverrides,
      collapseToFitInSplits,
      disabled,
      dragGroup,
      model,
      modelIndex
    ]
  );
  const getTabPanelId = useStableCallback(
    (tabId: string) => getTabHost(tabId).panelId
  );
  const [store] = useState(() =>
    createWorkspaceStore(workspaceState, updateModel, getTabPanelId)
  );
  // Set while rendering so that children rendered in this pass don't read stale state (see createWorkspaceStore)
  store.setState(workspaceState);
  useIsomorphicLayoutEffect(() => {
    store.notify();
  }, [store, workspaceState]);

  const maximizedTabset =
    model.maximizedTabsetId !== undefined
      ? modelIndex.tabsetsById.get(model.maximizedTabsetId)
      : undefined;

  useIsomorphicLayoutEffect(() => {
    layoutRef.current?.toggleAttribute("inert", !!maximizedTabset);
  }, [maximizedTabset]);

  // The layout, the maximized tabset, and tab content are memoized, so that they aren't re-rendered when only the Workspace's own state changes
  // (e.g. when a drag starts or ends); parts of the layout re-render when the context changes, or when the state they subscribe to does (see createDragStore)
  const layout = useMemo(() => <NodeView node={model.root} />, [model.root]);
  const maximizedOverlay = useMemo(
    () =>
      maximizedTabset && (
        <div
          data-workspace-maximized
          style={{ inset: 0, position: "absolute", zIndex: 1 }}
        >
          <TabsetSlot isMaximizedOverlay tabset={maximizedTabset} />
        </div>
      ),
    [maximizedTabset]
  );
  // Floating tabsets are shown above the layout (and a maximized tabset), and below the drop indicator
  const floatingLayer = useMemo(
    () =>
      model.floating && (
        <FloatingTabsets
          floating={model.floating}
          layoutElementRef={layoutRef}
        />
      ),
    [model.floating]
  );
  const portals = useMemo(
    () =>
      isHydrating
        ? null
        : Array.from(modelIndex.tabsById.values(), (tab) => {
            const element = getTabHost(tab.id).element;

            return element
              ? createPortal(
                  <TabContent
                    hiddenTabBehavior={getHiddenTabBehavior(tab)}
                    isLazy={isTabContentLazy(tab)}
                    renderTabContent={
                      renderTabContent as (tab: TabNode) => ReactNode
                    }
                    tab={tab}
                  />,
                  element,
                  tab.id
                )
              : null;
          }),
    [
      getHiddenTabBehavior,
      getTabHost,
      isHydrating,
      isTabContentLazy,
      modelIndex,
      renderTabContent
    ]
  );

  // Drags using HTML drag and drop (see the dragGroup prop) may come from other workspaces, so their previews show the dragged node as it was when the drag started
  let dragTab: TabNode | undefined;
  let dragTabset: TabsetNode | undefined;
  if (newTabPreview) {
    dragTab = newTabPreview.tab;
  } else if (nativePreviewNode) {
    if (nativePreviewNode.type === "tab") {
      dragTab = nativePreviewNode.tab;
    } else {
      dragTabset = nativePreviewNode.tabset;
    }
  } else if (!isNativeDragSource) {
    dragTab =
      dragSource?.type === "tab"
        ? modelIndex.tabsById.get(dragSource.tabId)
        : undefined;
    dragTabset =
      dragSource?.type === "tabset"
        ? modelIndex.tabsetsById.get(dragSource.tabsetId)
        : undefined;
  }

  // The default preview also shows how many other tabs are being dragged along with the tab (when its tabset is dragged)
  const renderTabPreview = (tab: TabNode, otherTabCount = 0) => {
    if (renderDragPreview) {
      return renderDragPreview(tab as TabNode<TabData>, { isCopy, isTearOff });
    }
    const title = tab.title ?? tab.id;
    return otherTabCount > 0 ? `${title} (+${otherTabCount})` : title;
  };

  let dragPreview: ReactNode = null;
  if (newTabPreview && newTabPreview.preview !== undefined) {
    dragPreview = newTabPreview.preview;
  } else if (dragTab) {
    dragPreview = renderTabPreview(dragTab);
  } else if (dragTabset) {
    if (renderTabsetDragPreview) {
      dragPreview = renderTabsetDragPreview(
        dragTabset as TabsetNode<TabData, TabsetData>,
        { isCopy, isTearOff }
      );
    } else {
      const selectedTab = dragTabset.tabs.find(
        ({ id }) => id === dragTabset.selectedId
      );
      dragPreview = selectedTab
        ? renderTabPreview(selectedTab, dragTabset.tabs.length - 1)
        : dragTabset.id;
    }
  }

  return (
    <ParentWorkspaceContext.Provider value={parentWorkspace}>
      <WorkspaceStoreContext.Provider value={store}>
        <WorkspaceContext.Provider value={context}>
          <div
            {...rest}
            className={className}
            data-testid={getTestId(rest, idProp)}
            data-workspace
            id={id}
            ref={mergedRef}
            style={{ position: "relative", ...style }}
          >
            <div
              data-workspace-layout
              ref={layoutRef}
              style={{ height: "100%", width: "100%" }}
            >
              {layout}
            </div>
            {maximizedOverlay}
            {floatingLayer}
            {/* Shown by every workspace in the document a drag is over (not just the one showing the preview), for the whole drag, so it can be animated between tabsets */}
            {(dragSource !== undefined ||
              newTabPreview !== undefined ||
              isNativeDragOver ||
              isExternalDragOver) && (
              <DropIndicator
                className={classNames?.dropIndicator}
                isCopy={isCopy}
                dragStore={dragStore}
                layoutElementRef={layoutRef}
                model={model}
                style={styles?.dropIndicator}
                tabsetElements={tabsetElements}
              />
            )}
            {(dragTab || dragTabset) && (
              <DragPreview
                className={classNames?.dragPreview}
                dragType={dragTab ? "tab" : "tabset"}
                elementRef={previewElementRef}
                isCopy={isCopy}
                isTearOff={isTearOff}
                pointRef={previewPointRef}
                style={styles?.dragPreview}
              >
                {dragPreview}
              </DragPreview>
            )}
          </div>
          {portals}
        </WorkspaceContext.Provider>
      </WorkspaceStoreContext.Provider>
    </ParentWorkspaceContext.Provider>
  );
}

/**
 * A Workspace arranges tabsets that users can rearrange by dragging tabs:
 * between tabsets, within a tabset's list of tabs, or onto the edge of a tabset to split it.
 * Tabsets can be resized and maximized.
 *
 * The layout is described by a serializable model (see `WorkspaceModel`).
 * Workspaces are uncontrolled: provide an initial model with the `defaultModel` prop, save changes from the `onModelChanged` callback,
 * and make changes using the imperative API (see `WorkspaceImperativeHandle`).
 *
 * ℹ️ Tab content is not remounted when a tab is moved.
 * Its elements are moved within the document, though, which resets some browser state (e.g. iframes are reloaded).
 *
 * Workspace elements always include the following attributes:
 *
 * ```html
 * <div data-workspace data-testid="workspace-id-prop" id="workspace-id-prop">
 * ```
 *
 * ℹ️ [Test id](https://testing-library.com/docs/queries/bytestid/) can be used to narrow selection when unit testing.
 */
export const Workspace = /* @__PURE__ */ Object.assign(WorkspaceComponent, {
  displayName: "Workspace"
});
