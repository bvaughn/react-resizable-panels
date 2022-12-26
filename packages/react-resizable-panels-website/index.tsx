import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import HomeRoute from "./src/routes/Home";
import HorizontalExampleRoute from "./src/routes/examples/Horizontal";
import VerticalExampleRoute from "./src/routes/examples/Vertical";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeRoute />,
  },
  {
    path: "/examples/horizontal",
    element: <HorizontalExampleRoute />,
  },
  {
    path: "/examples/vertical",
    element: <VerticalExampleRoute />,
  },
]);

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
