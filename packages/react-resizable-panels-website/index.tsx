import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import DemoRoute from "./src/routes/Demo";
import MobileRoute from "./src/routes/Mobile";

const router = createBrowserRouter([
  {
    path: "/",
    element: <DemoRoute />,
  },
  {
    path: "/mobile",
    element: <MobileRoute />,
  },
]);

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
