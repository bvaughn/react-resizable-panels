import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import "./index.css";
import { Decoder } from "./routes/Decoder";
import { Edges } from "./routes/Edges";
import { Home } from "./routes/Home";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/e2e/decoder/:encoded" element={<Decoder />} />
        <Route path="/e2e/edges" element={<Edges />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
