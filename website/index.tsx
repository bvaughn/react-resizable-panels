import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import Demo from "./demo";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <Demo />
  </StrictMode>
);