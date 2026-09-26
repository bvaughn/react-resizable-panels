import { lazy, type ComponentType, type LazyExoticComponent } from "react";

export type Route = LazyExoticComponent<ComponentType<unknown>>;

export const routes = {
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
  "/platform-requirements": lazy(
    () => import("./routes/PlatformRequirementsRoute")
  ),
  "/props/cell": lazy(() => import("./routes/CellPropsRoute")),
  "/props/grid": lazy(() => import("./routes/GridPropsRoute")),
  "/props/gridline": lazy(() => import("./routes/GridlinePropsRoute")),
  "/props/group": lazy(() => import("./routes/GroupPropsRoute")),
  "/props/panel": lazy(() => import("./routes/PanelPropsRoute")),
  "/props/separator": lazy(() => import("./routes/SeparatorPropsRoute")),
  "/test": lazy(() => import("./routes/TestRoute"))
} satisfies Record<string, Route>;

export type Routes = Record<keyof typeof routes, Route>;
export type Path = keyof Routes;
