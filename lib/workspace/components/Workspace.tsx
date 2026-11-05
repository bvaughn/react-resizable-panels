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
import { calculateMaximumSizes } from "../utils/calculateMaximumSizes";
import { calculateMinimumSizes } from "../utils/calculateMinimumSizes";
import { createTabListFreeSpaceStore } from "../utils/createTabListFreeSpaceStore";
import {
  createWorkspaceStore,
  type WorkspaceState
} from "../utils/createWorkspaceStore";
import { addTab } from "../models/addTab";
import { closeTab } from "../models/closeTab";
import { closeTabset } from "../models/closeTabset";
import { collapseTabset } from "../models/collapseTabset";
import { expandTabset } from "../models/expandTabset";
import { findTab } from "../models/findTab";
import { findTabset } from "../models/findTabset";
import { findTabsetContainingTab } from "../models/findTabsetContainingTab";
import { getAllTabs } from "../models/getAllTabs";
import { getValidModelInput } from "../models/getValidModelInput";
import { indexModel } from "../models/indexModel";
import { maximizeTabset } from "../models/maximizeTabset";
import { moveTab } from "../models/moveTab";
import { moveTabset } from "../models/moveTabset";
import { normalizeModel } from "../models/normalizeModel";
import { restoreTabset } from "../models/restoreTabset";
import { selectTab } from "../models/selectTab";
import { updateTab } from "../models/updateTab";
import { updateRecentTabIds } from "../models/updateRecentTabIds";
import { updateTabset } from "../models/updateTabset";
import { TabContent } from "./TabContent";
import type {
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
  WorkspaceImperativeHandle,
  WorkspaceModel,
  WorkspaceModelInput,
  WorkspaceProps
} from "../types";
import { useTabDrag } from "../hooks/useTabDrag";
import { NodeView } from "./NodeView";
import { TabsetSlot } from "./TabsetSlot";
import { isRightToLeft } from "../utils/isRightToLeft";
import { pruneRemovedNodes } from "../utils/pruneRemovedNodes";
import { updateCollapseOverrides } from "../utils/updateCollapseOverrides";
import { sizeToPixels } from "../utils/sizeToPixels";
import { toModelDropTarget } from "../utils/toModelDropTarget";
import { subscribeToNothing } from "../../shared/utils/subscribeToNothing";
import { DragPreview } from "./DragPreview";

function WorkspaceComponent<TabData = unknown, TabsetData = unknown>({
  className,
  classNames,
  defaultModel,
  disabled = false,
  disableDrop,
  elementRef: elementRefProp,
  hiddenTabBehavior = "keep-mounted",
  id: idProp,
  onModelChanged,
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

  const updateModel = useCallback<UpdateModel>(
    (reason, isUserInteraction, update) => {
      // Recently selected tabs are recorded around each change (rather than by each change),
      // starting from the current behavior (which may have changed since the previous change)
      const behavior = getTabRemovalSelectionBehavior();
      const prev = updateRecentTabIds(modelRef.current, behavior);
      const updated = update(prev);
      if (updated !== prev) {
        const next = updateRecentTabIds(updated, behavior);
        modelRef.current = next;
        setModel(next);
        onModelChangedStable(next as WorkspaceModel<TabData, TabsetData>, {
          isUserInteraction,
          reason
        });
      }
    },
    [getTabRemovalSelectionBehavior, onModelChangedStable]
  );

  // Tab lists report their free space here (rather than in React state), so that it can be read synchronously, e.g. from outside the Workspace
  const [tabListFreeSpaceStore] = useState(createTabListFreeSpaceStore);

  // Read by imperative methods, e.g. to tell which side of the screen a drop region is on (see toModelDropTarget)
  const rootElementRef = useRef<HTMLDivElement | null>(null);

  const handle = useMemo<WorkspaceImperativeHandle>(() => {
    const getActiveTabsetId = () => {
      const tabsetId = activeTabsetIdRef.current;

      return findTabset(modelRef.current, tabsetId) ? tabsetId : undefined;
    };

    return {
      addTab: (tab, options = {}) => {
        const result = addTab(modelRef.current, tab, {
          ...options,
          tabsetId: options.tabsetId ?? getActiveTabsetId()
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
      getActiveTabsetId,
      getModel: () => modelRef.current,
      getTabListFreeSpace: (tabsetId) => tabListFreeSpaceStore.get(tabsetId),
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
      subscribeToTabListFreeSpace: (tabsetId, listener) =>
        tabListFreeSpaceStore.subscribe(tabsetId, listener),
      updateTab: (tabId, changes) =>
        updateModel("update", false, (prev) => updateTab(prev, tabId, changes)),
      updateTabset: (tabsetId, changes) =>
        updateModel("update", false, (prev) =>
          updateTabset(prev, tabsetId, changes)
        )
    };
  }, [tabListFreeSpaceStore, updateModel]);

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
          getTabsetId: () =>
            findTabsetContainingTab(modelRef.current, tabId)?.id ?? "",
          id: tabId,
          isSelected: () =>
            findTabsetContainingTab(modelRef.current, tabId)?.selectedId ===
            tabId,
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
          addTab: (tab, options = {}) =>
            handle.addTab(tab, { ...options, tabsetId }),
          close: () => handle.closeTabset(tabsetId),
          collapse: () => handle.collapseTabset(tabsetId),
          expand: () => handle.expandTabset(tabsetId),
          id: tabsetId,
          isCollapsed: () =>
            !!findTabset(modelRef.current, tabsetId)?.collapsed,
          isMaximized: () => modelRef.current.maximizedTabsetId === tabsetId,
          maximize: () => handle.maximizeTabset(tabsetId),
          restore: () => {
            if (modelRef.current.maximizedTabsetId === tabsetId) {
              handle.restoreTabset();
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

  const tabs = getAllTabs(model.root);
  const modelIndex = useMemo(() => indexModel(model), [model]);

  // Clean up after removed tabs and tabsets
  useEffect(() => {
    const tabIds = new Set(tabs.map(({ id }) => id));
    for (const [tabId, host] of tabHosts) {
      if (!tabIds.has(tabId)) {
        host.element?.remove();
        tabHosts.delete(tabId);
        handles.tabs.delete(tabId);
      }
    }

    for (const tabsetId of handles.tabsets.keys()) {
      if (!modelIndex.tabsetsById.has(tabsetId)) {
        handles.tabsets.delete(tabsetId);
      }
    }
  });

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

  const minimumSizes = useMemo(
    () =>
      calculateMinimumSizes(model.root, {
        getChromeSize: (tabsetId) => chromeSizes[tabsetId],
        getCollapsedSize: (tabsetId) => collapsedSizes[tabsetId],
        getContentMinimumSize: (tabset: TabsetNode) => ({
          height:
            sizeToPixels(
              tabset.minHeight ?? tabsetMinHeight,
              unitsReference?.element ?? null
            ) ?? 0,
          width:
            sizeToPixels(
              tabset.minWidth ?? tabsetMinWidth,
              unitsReference?.element ?? null
            ) ?? 0
        }),
        getSeparatorsSize: (splitId) => separatorsSizes[splitId]
      }),
    [
      chromeSizes,
      collapsedSizes,
      model.root,
      separatorsSizes,
      tabsetMinHeight,
      tabsetMinWidth,
      unitsReference
    ]
  );

  // Maximums that can't be converted yet (e.g. "em" before the workspace has rendered) aren't applied until they can be
  const maximumSizes = useMemo(
    () =>
      calculateMaximumSizes(model.root, {
        getChromeSize: (tabsetId) => chromeSizes[tabsetId],
        getCollapsedSize: (tabsetId) => collapsedSizes[tabsetId],
        getContentMaximumSize: (tabset: TabsetNode) => ({
          height:
            sizeToPixels(tabset.maxHeight, unitsReference?.element ?? null) ??
            Infinity,
          width:
            sizeToPixels(tabset.maxWidth, unitsReference?.element ?? null) ??
            Infinity
        }),
        getSeparatorsSize: (splitId) => separatorsSizes[splitId]
      }),
    [chromeSizes, collapsedSizes, model.root, separatorsSizes, unitsReference]
  );

  const isDropDisabled = useStableCallback(
    (source: DragSource, target: TabDropTarget) => {
      if (typeof disableDrop !== "function") {
        return !!disableDrop;
      }

      // Sources removed during the drag (e.g. by the imperative API) can't be dropped
      const model = modelRef.current as WorkspaceModel<TabData, TabsetData>;
      if (source.type === "tab") {
        const tab = findTab(model, source.tabId);

        return tab
          ? disableDrop({ model, tab, tabset: undefined, target })
          : true;
      }

      const tabset = findTabset(model, source.tabsetId);
      if (!tabset) {
        return true;
      }

      // A tabset can't be dropped where any of its tabs couldn't be;
      // when its tabs are moved into a tab list, each tab is inserted after the previous one
      return tabset.tabs.length === 0
        ? disableDrop({ model, tab: undefined, tabset, target })
        : tabset.tabs.some((tab, index) =>
            disableDrop({
              model,
              tab,
              tabset,
              target:
                "index" in target
                  ? { ...target, index: target.index + index }
                  : target
            })
          );
    }
  );

  const onDrop = useCallback(
    (source: DragSource, target: TabDropTarget) =>
      updateModel("move", true, (prev) => {
        const modelTarget = toModelDropTarget(
          target,
          isRightToLeft(rootElementRef.current)
        );

        return source.type === "tab"
          ? moveTab(prev, source.tabId, modelTarget)
          : moveTabset(prev, source.tabsetId, modelTarget);
      }),
    [updateModel]
  );

  const getModel = useCallback(() => modelRef.current, []);
  const getRootElement = useCallback(() => rootElementRef.current, []);

  const {
    dragSource,
    dropTarget,
    previewElementRef,
    previewPointRef,
    startTabDrag,
    startTabsetDrag
  } = useTabDrag({ getModel, getRootElement, isDropDisabled, onDrop });
  const dragTabId = dragSource?.type === "tab" ? dragSource.tabId : undefined;
  const dragTabsetId =
    dragSource?.type === "tabset" ? dragSource.tabsetId : undefined;

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
      dragTabId,
      dragTabsetId,
      dropTarget,
      getTabHandle,
      getTabHost,
      getHiddenTabBehavior,
      getTabsetHandle,
      id,
      isHydrating,
      maximumSizes,
      minimumSizes,
      model,
      modelIndex,
      outerParents,
      classNames,
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
      startTabDrag,
      startTabsetDrag,
      styles,
      tabListFreeSpaceStore,
      tabPlacement,
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
      dragTabId,
      dragTabsetId,
      dropTarget,
      getTabHandle,
      getTabHost,
      getHiddenTabBehavior,
      getTabsetHandle,
      id,
      isHydrating,
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
      startTabDrag,
      startTabsetDrag,
      styles,
      tabListFreeSpaceStore,
      tabPlacement,
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
      model,
      modelIndex
    }),
    [
      activeTabsetId,
      collapseOverrides,
      collapseToFitInSplits,
      disabled,
      model,
      modelIndex
    ]
  );
  const [store] = useState(() => createWorkspaceStore(workspaceState));
  // Set while rendering so that children rendered in this pass don't read stale state (see createWorkspaceStore)
  store.setState(workspaceState);
  useIsomorphicLayoutEffect(() => {
    store.notify();
  }, [store, workspaceState]);

  const maximizedTabset = findTabset(model, model.maximizedTabsetId);

  // While a tabset is maximized, the rest of the layout is covered (and shouldn't be focusable)
  const layoutRef = useRef<HTMLDivElement | null>(null);
  useIsomorphicLayoutEffect(() => {
    layoutRef.current?.toggleAttribute("inert", !!maximizedTabset);
  }, [maximizedTabset]);

  const dragTab = dragTabId ? findTab(model, dragTabId) : undefined;
  const dragTabset = dragTabsetId ? findTabset(model, dragTabsetId) : undefined;

  // The default preview also shows how many other tabs are being dragged along with the tab (when its tabset is dragged)
  const renderTabPreview = (tab: TabNode, otherTabCount = 0) => {
    if (renderDragPreview) {
      return renderDragPreview(tab as TabNode<TabData>);
    }
    const title = tab.title ?? tab.id;
    return otherTabCount > 0 ? `${title} (+${otherTabCount})` : title;
  };

  let dragPreview: ReactNode = null;
  if (dragTab) {
    dragPreview = renderTabPreview(dragTab);
  } else if (dragTabset) {
    if (renderTabsetDragPreview) {
      dragPreview = renderTabsetDragPreview(
        dragTabset as TabsetNode<TabData, TabsetData>
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
              <NodeView node={model.root} />
            </div>
            {maximizedTabset && (
              <div
                data-workspace-maximized
                style={{ inset: 0, position: "absolute", zIndex: 1 }}
              >
                <TabsetSlot isMaximizedOverlay tabset={maximizedTabset} />
              </div>
            )}
            {(dragTab || dragTabset) && (
              <DragPreview
                className={classNames?.dragPreview}
                dragType={dragTab ? "tab" : "tabset"}
                elementRef={previewElementRef}
                pointRef={previewPointRef}
                style={styles?.dragPreview}
              >
                {dragPreview}
              </DragPreview>
            )}
          </div>
          {!isHydrating &&
            tabs.map((tab) => {
              const element = getTabHost(tab.id).element;

              return element
                ? createPortal(
                    <TabContent
                      hiddenTabBehavior={getHiddenTabBehavior(tab)}
                      renderTabContent={
                        renderTabContent as (tab: TabNode) => ReactNode
                      }
                      tab={tab}
                    />,
                    element,
                    tab.id
                  )
                : null;
            })}
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
