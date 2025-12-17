import { lazy, type ComponentType, type LazyExoticComponent } from "react";

export type Route = LazyExoticComponent<ComponentType<unknown>>;

export const routes = {
  "*": lazy(() => import("./routes/PageNotFound")),

  // Home page
  "/": lazy(() => import("./routes/GettingStartedRoute")),

  // Examples
  "/examples/the-basics": lazy(() => import("./routes/LayoutBasicsRoute")),
  "/examples/min-max-sizes": lazy(
    () => import("./routes/SizeConstraintsRoute")
  ),
  "/examples/collapsible-panels": lazy(
    () => import("./routes/CollapsiblePanelsRoute")
  ),
  "/examples/persistent-layout": lazy(
    () => import("./routes/PersistentLayoutsRoute")
  ),
  "/examples/persistent-layout/server-components": lazy(
    () => import("./routes/PersistentLayoutsServerComponentsRoute")
  ),
  "/examples/persistent-layout/server-rendering": lazy(
    () => import("./routes/PersistentLayoutsServerRenderingRoute")
  ),
  "/examples/nested-groups": lazy(() => import("./routes/NestedGroupsRoute")),
  "/examples/conditional-panels": lazy(
    () => import("./routes/ConditionalPanelsRoute")
  ),
  "/examples/fixed-size-panels": lazy(
    () => import("./routes/FixedSizePanelsRoute")
  ),
  "/examples/custom-css-styles": lazy(
    () => import("./routes/CustomStylesRoute")
  ),

  // Component props
  "/props/group": lazy(() => import("./routes/GroupPropsRoute")),
  "/props/panel": lazy(() => import("./routes/PanelPropsRoute")),
  "/props/separator": lazy(() => import("./routes/SeparatorPropsRoute")),

  // Imperative API
  "/imperative-api/group": lazy(
    () => import("./routes/GroupImperativeHandleRoute")
  ),
  "/imperative-api/panel": lazy(
    () => import("./routes/PanelImperativeHandleRoute")
  ),

  // Other
  "/platform-requirements": lazy(
    () => import("./routes/PlatformRequirementsRoute")
  ),
  "/support": lazy(() => import("./routes/SupportRoute")),
  "/versions": lazy(() => import("./routes/VersionsRoute")),
  "/test": lazy(() => import("./routes/TestRoute"))
} satisfies Record<string, Route>;

export type Routes = Record<keyof typeof routes, Route>;
export type Path = keyof Routes;
