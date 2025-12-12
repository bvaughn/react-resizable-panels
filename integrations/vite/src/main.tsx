import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { Home } from "./routes/Home";
import { Encoder } from "./routes/Encoder";
import "./index.css";
import { Decoder } from "./routes/Decoder";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/e2e/encoder" element={<Encoder />} />
        <Route path="/e2e/decoder/:encoded" element={<Decoder />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
