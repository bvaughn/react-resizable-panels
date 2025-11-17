import { lazy, type ComponentType, type LazyExoticComponent } from "react";

export type Route = LazyExoticComponent<ComponentType<unknown>>;

export const routes = {
  "*": lazy(() => import("./routes/PageNotFound")),
  TODO: lazy(() => import("./routes/PageNotFound")),

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
  "/examples/server-side-rendering": lazy(
    () => import("./routes/ServerSideRenderingRoute")
  ),
  "/examples/nested-groups": lazy(() => import("./routes/NestedGroupsRoute")),
  "/examples/css-styling": lazy(() => import("./routes/CssStylingRoute")),

  // Component props
  "/props/group": lazy(() => import("./routes/GroupPropsRoute")),
  "/props/panel": lazy(() => import("./routes/PanelPropsRoute")),
  "/props/resize-handle": lazy(() => import("./routes/ResizeHandlePropsRoute")),

  // Imperative API
  "/imperative-api/update-group-layout": lazy(
    () => import("./routes/UpdateGroupLayoutRoute")
  ),
  "/imperative-api/update-panel-size": lazy(
    () => import("./routes/UpdatePanelSizeRoute")
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
