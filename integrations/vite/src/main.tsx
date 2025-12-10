import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { Home } from "./routes/Home";
import { ConditionallyRenderedPanels } from "./routes/ConditionallyRenderedPanels";
import "./index.css";
import { Dynamic } from "./routes/Dynamic";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/e2e/dynamic/:json" element={<Dynamic />} />
        <Route
          path="/e2e/conditionally-rendered-panels"
          element={<ConditionallyRenderedPanels />}
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
