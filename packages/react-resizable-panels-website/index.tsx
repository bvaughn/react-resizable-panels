import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import HomeRoute from "./src/routes/Home";
import ConditionalExampleRoute from "./src/routes/examples/Conditional";
import HorizontalExampleRoute from "./src/routes/examples/Horizontal";
import NestedExampleRoute from "./src/routes/examples/Nested";
import PersistenceExampleRoute from "./src/routes/examples/Persistence";
import VerticalExampleRoute from "./src/routes/examples/Vertical";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeRoute />,
  },
  {
    path: "/examples/conditional",
    element: <ConditionalExampleRoute />,
  },
  {
    path: "/examples/horizontal",
    element: <HorizontalExampleRoute />,
  },
  {
    path: "/examples/nested",
    element: <NestedExampleRoute />,
  },
  {
    path: "/examples/persistence",
    element: <PersistenceExampleRoute />,
  },
  {
    path: "/examples/vertical",
    element: <VerticalExampleRoute />,
  },
]);

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);
root.render(
  // <StrictMode>
  <RouterProvider router={router} />
  // </StrictMode>
);
