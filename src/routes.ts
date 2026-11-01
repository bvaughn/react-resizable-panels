import { type ComponentType, lazy, type LazyExoticComponent } from "react";

export type Route = LazyExoticComponent<ComponentType<unknown>>;

export const routes = {
  "/examples/accordion": lazy(() => import("./routes/AccordionRoute")),
  "/examples/collapsible-grid-cells": lazy(
    () => import("./routes/CollapsibleGridCellsRoute")
  ),
  "/examples/collapsible-panels": lazy(
    () => import("./routes/CollapsiblePanelsRoute")
  ),
  "/examples/conditional-panels": lazy(
    () => import("./routes/ConditionalPanelsRoute")
  ),
  "/examples/custom-css-styles": lazy(
    () => import("./routes/CustomStylesRoute")
  ),
  "/examples/disabled-panels": lazy(
    () => import("./routes/DisabledPanelsRoute")
  ),
  "/examples/fixed-size-panels": lazy(
    () => import("./routes/FixedSizePanelsRoute")
  ),
  "/examples/grid-basics": lazy(() => import("./routes/GridBasicsRoute")),
  "/examples/grid-constraints": lazy(
    () => import("./routes/GridConstraintsRoute")
  ),
  "/examples/grid-persistent-layout": lazy(
    () => import("./routes/GridPersistentLayoutRoute")
  ),
  "/examples/gridlines": lazy(() => import("./routes/GridlinesRoute")),
  "/examples/group-resize-behavior": lazy(
    () => import("./routes/GroupResizeBehaviorRoute")
  ),
  "/examples/min-max-sizes": lazy(
    () => import("./routes/SizeConstraintsRoute")
  ),
  "/examples/nested-groups": lazy(() => import("./routes/NestedGroupsRoute")),
  "/examples/overflow": lazy(() => import("./routes/OverflowRoute")),
  "/examples/panel-resize-behavior": lazy(
    () => import("./routes/PanelResizeBehaviorRoute")
  ),
  "/examples/persistent-layout": lazy(
    () => import("./routes/PersistentLayoutsRoute")
  ),
  "/examples/persistent-layout/conditional-panels": lazy(
    () => import("./routes/PersistentLayoutsConditionalPanelsRoute")
  ),
  "/examples/persistent-layout/server-components": lazy(
    () => import("./routes/PersistentLayoutsServerComponentsRoute")
  ),
  "/examples/persistent-layout/server-rendering": lazy(
    () => import("./routes/PersistentLayoutsServerRenderingRoute")
  ),
  "/examples/the-basics": lazy(() => import("./routes/LayoutBasicsRoute")),
  "/examples/workspace": lazy(() => import("./routes/WorkspaceRoute")),
  "/examples/workspace/managing-tabs": lazy(
    () => import("./routes/WorkspaceManagingTabsRoute")
  ),
  "/examples/workspace/persistent-layout": lazy(
    () => import("./routes/WorkspacePersistenceRoute")
  ),
  "/examples/workspace/restrictions": lazy(
    () => import("./routes/WorkspaceRestrictionsRoute")
  ),
  "/examples/workspace/separators": lazy(
    () => import("./routes/WorkspaceSeparatorsRoute")
  ),
  "/examples/workspace/server-rendering": lazy(
    () => import("./routes/WorkspaceServerRenderingRoute")
  ),
  "/examples/workspace/styling": lazy(
    () => import("./routes/WorkspaceStylingRoute")
  ),
  "/examples/workspace/tab-placement": lazy(
    () => import("./routes/WorkspaceTabPlacementRoute")
  ),
  "/examples/workspace/custom-tabsets": lazy(
    () => import("./routes/WorkspaceCustomTabsetsRoute")
  ),
  "/examples/workspace/tab-content": lazy(
    () => import("./routes/WorkspaceTabContentRoute")
  ),
  "/hooks/use-default-grid-layout": lazy(
    () => import("./routes/UseDefaultGridLayoutRoute")
  ),
  "/hooks/use-default-layout": lazy(
    () => import("./routes/UseDefaultLayoutRoute")
  ),
  "/hooks/use-grid-callback-ref": lazy(
    () => import("./routes/UseGridCallbackRefRoute")
  ),
  "/hooks/use-grid-ref": lazy(() => import("./routes/UseGridRefRoute")),
  "/hooks/use-group-callback-ref": lazy(
    () => import("./routes/UseGroupCallbackRefRoute")
  ),
  "/hooks/use-group-ref": lazy(() => import("./routes/UseGroupRefRoute")),
  "/hooks/use-panel-callback-ref": lazy(
    () => import("./routes/UsePanelCallbackRefRoute")
  ),
  "/hooks/use-panel-ref": lazy(() => import("./routes/UsePanelRefRoute")),
  "/hooks/use-parent-grid": lazy(() => import("./routes/UseParentGridRoute")),
  "/hooks/use-parent-group": lazy(() => import("./routes/UseParentGroupRoute")),
  "/hooks/use-parent-panel": lazy(() => import("./routes/UseParentPanelRoute")),
  "/hooks/use-parent-tab": lazy(() => import("./routes/UseParentTabRoute")),
  "/hooks/use-parent-tab-state": lazy(
    () => import("./routes/UseParentTabStateRoute")
  ),
  "/hooks/use-parent-tabset": lazy(
    () => import("./routes/UseParentTabsetRoute")
  ),
  "/hooks/use-parent-tabset-state": lazy(
    () => import("./routes/UseParentTabsetStateRoute")
  ),
  "/hooks/use-parent-workspace": lazy(
    () => import("./routes/UseParentWorkspaceRoute")
  ),
  "/hooks/use-workspace-callback-ref": lazy(
    () => import("./routes/UseWorkspaceCallbackRefRoute")
  ),
  "/hooks/use-workspace-ref": lazy(
    () => import("./routes/UseWorkspaceRefRoute")
  ),
  "/imperative-api/grid": lazy(
    () => import("./routes/GridImperativeHandleRoute")
  ),
  "/imperative-api/grid-track": lazy(
    () => import("./routes/GridTrackImperativeHandleRoute")
  ),
  "/imperative-api/group": lazy(
    () => import("./routes/GroupImperativeHandleRoute")
  ),
  "/imperative-api/panel": lazy(
    () => import("./routes/PanelImperativeHandleRoute")
  ),
  "/model/split-node": lazy(() => import("./routes/SplitNodeRoute")),
  "/model/tab-node": lazy(() => import("./routes/TabNodeRoute")),
  "/model/tabset-node": lazy(() => import("./routes/TabsetNodeRoute")),
  "/imperative-api/workspace": lazy(
    () => import("./routes/WorkspaceImperativeHandleRoute")
  ),
  "/model/workspace-model": lazy(() => import("./routes/WorkspaceModelRoute")),
  "/platform-requirements": lazy(
    () => import("./routes/PlatformRequirementsRoute")
  ),
  "/props/cell": lazy(() => import("./routes/CellPropsRoute")),
  "/props/grid": lazy(() => import("./routes/GridPropsRoute")),
  "/props/gridline": lazy(() => import("./routes/GridlinePropsRoute")),
  "/props/group": lazy(() => import("./routes/GroupPropsRoute")),
  "/props/panel": lazy(() => import("./routes/PanelPropsRoute")),
  "/props/separator": lazy(() => import("./routes/SeparatorPropsRoute")),
  "/props/tab-close-button": lazy(
    () => import("./routes/TabCloseButtonPropsRoute")
  ),
  "/props/workspace": lazy(() => import("./routes/WorkspacePropsRoute")),
  "/test": lazy(() => import("./routes/TestRoute"))
} satisfies Record<string, Route>;

export type Routes = Record<keyof typeof routes, Route>;
export type Path = keyof Routes;
