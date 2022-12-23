import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import DemoApp from "./DemoApp";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <DemoApp />
  </StrictMode>
);
