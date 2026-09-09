import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./src/App.tsx";
import { bindDocsContentMotion } from "./src/docsContentMotion";
import { bindSearchOverlayMotion } from "./src/searchOverlayMotion";

const root = document.getElementById("root")!;
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
bindSearchOverlayMotion();
bindDocsContentMotion();
