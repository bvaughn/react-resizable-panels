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
import { calculateMinimumSizes } from "../utils/calculateMinimumSizes";
import {
  createWorkspaceStore,
  type WorkspaceState
} from "../utils/createWorkspaceStore";
import { minimumSizeToPixels } from "../utils/minimumSizeToPixels";
import { addTab } from "../models/addTab";
import { closeTab } from "../models/closeTab";
import { closeTabset } from "../models/closeTabset";
import { findTab } from "../models/findTab";
import { findTabset } from "../models/findTabset";
import { findTabsetContainingTab } from "../models/findTabsetContainingTab";
import { getAllTabs } from "../models/getAllTabs";
import { getValidModelInput } from "../models/getValidModelInput";
import { indexModel } from "../models/indexModel";
import { maximizeTabset } from "../models/maximizeTabset";
import { moveTab } from "../models/moveTab";
import { normalizeModel } from "../models/normalizeModel";
import { restoreTabset } from "../models/restoreTabset";
import { selectTab } from "../models/selectTab";
import { updateTab } from "../models/updateTab";
import { updateTabset } from "../models/updateTabset";
import { TabContent } from "./TabContent";
import type {
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
import { pruneRemovedNodes } from "../utils/pruneRemovedNodes";
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
  renderTabsetToolbar,
  resizePreviewMode,
  serverRenderTabContent = false,
  style,
  styles,
  tabPlacement = "top",
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
    normalizeModel(getValidModelInput(defaultModel as WorkspaceModelInput))
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

  const updateModel = useCallback<UpdateModel>(
    (reason, isUserInteraction, update) => {
      const prev = modelRef.current;
      const next = update(prev);
      if (next !== prev) {
        modelRef.current = next;
        setModel(next);
        onModelChangedStable(next as WorkspaceModel<TabData, TabsetData>, {
          isUserInteraction,
          reason
        });
      }
    },
    [onModelChangedStable]
  );

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
      getActiveTabsetId,
      getModel: () => modelRef.current,
      maximizeTabset: (tabsetId) =>
        updateModel("maximize", false, (prev) =>
          maximizeTabset(prev, tabsetId)
        ),
      moveTab: (tabId, target) =>
        updateModel("move", false, (prev) => moveTab(prev, tabId, target)),
      restoreTabset: () => updateModel("restore", false, restoreTabset),
      selectTab: (tabId) =>
        updateModel("select", false, (prev) => selectTab(prev, tabId)),
      setModel: (value) => {
        const next = normalizeModel(getValidModelInput(value));
        updateModel("set-model", false, () => next);
        setSplitGeneration((prev) => prev + 1);

        return next;
      },
      updateTab: (tabId, changes) =>
        updateModel("update", false, (prev) => updateTab(prev, tabId, changes)),
      updateTabset: (tabsetId, changes) =>
        updateModel("update", false, (prev) =>
          updateTabset(prev, tabsetId, changes)
        )
    };
  }, [updateModel]);

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
          id: tabsetId,
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
  const rootElementRef = useRef<HTMLDivElement | null>(null);
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
  }, [modelIndex]);

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
        getContentMinimumSize: (tabset: TabsetNode) => ({
          height: minimumSizeToPixels(
            tabset.minHeight ?? tabsetMinHeight,
            unitsReference?.element ?? null
          ),
          width: minimumSizeToPixels(
            tabset.minWidth ?? tabsetMinWidth,
            unitsReference?.element ?? null
          )
        }),
        getSeparatorsSize: (splitId) => separatorsSizes[splitId]
      }),
    [
      chromeSizes,
      model.root,
      separatorsSizes,
      tabsetMinHeight,
      tabsetMinWidth,
      unitsReference
    ]
  );

  const isDropDisabled = useStableCallback(
    (tab: TabNode, target: TabDropTarget) =>
      typeof disableDrop === "function"
        ? disableDrop({
            model: modelRef.current as WorkspaceModel<TabData, TabsetData>,
            tab: tab as TabNode<TabData>,
            target
          })
        : !!disableDrop
  );

  const onDrop = useCallback(
    (tabId: string, target: TabDropTarget) =>
      updateModel("move", true, (prev) => moveTab(prev, tabId, target)),
    [updateModel]
  );

  const getModel = useCallback(() => modelRef.current, []);
  const getRootElement = useCallback(() => rootElementRef.current, []);

  const {
    dragTabId,
    dropTarget,
    previewElementRef,
    previewPointRef,
    startTabDrag
  } = useTabDrag({ getModel, getRootElement, isDropDisabled, onDrop });

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
      disabled,
      dragTabId,
      dropTarget,
      getTabHandle,
      getTabHost,
      getHiddenTabBehavior,
      getTabsetHandle,
      id,
      isHydrating,
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
      reportSeparatorsSize,
      requestFocus,
      resizePreviewMode,
      setActiveTabsetId,
      shouldServerRenderTabContent,
      splitGeneration,
      startTabDrag,
      styles,
      tabPlacement,
      takeFocusRequest,
      updateModel
    }),
    [
      activeTabsetId,
      disabled,
      dragTabId,
      dropTarget,
      getTabHandle,
      getTabHost,
      getHiddenTabBehavior,
      getTabsetHandle,
      id,
      isHydrating,
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
      reportSeparatorsSize,
      requestFocus,
      resizePreviewMode,
      setActiveTabsetId,
      shouldServerRenderTabContent,
      splitGeneration,
      startTabDrag,
      styles,
      tabPlacement,
      takeFocusRequest,
      updateModel
    ]
  );

  // Hooks like useParentTabState read this state from a store, so that they don't re-render whenever the context changes
  const workspaceState = useMemo<WorkspaceState>(
    () => ({ activeTabsetId, disabled, model, modelIndex }),
    [activeTabsetId, disabled, model, modelIndex]
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
            {dragTab && (
              <DragPreview
                className={classNames?.dragPreview}
                elementRef={previewElementRef}
                pointRef={previewPointRef}
                style={styles?.dragPreview}
              >
                {renderDragPreview
                  ? renderDragPreview(dragTab as TabNode<TabData>)
                  : (dragTab.title ?? dragTab.id)}
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
