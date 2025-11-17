import "./index.css";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { App } from "./App";

const rootElement = document.getElementById("root")!;

hydrateRoot(
  rootElement,
  <StrictMode>
    <App />
  </StrictMode>
);
