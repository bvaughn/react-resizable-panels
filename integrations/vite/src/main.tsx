import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import "./index.css";
import { Decoder } from "./routes/Decoder";
import { Visibility } from "./routes/Visibility";
import { Edges } from "./routes/Edges";
import { Encoder } from "./routes/Encoder";
import { Home } from "./routes/Home";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/e2e/decoder/:encoded" element={<Decoder />} />
        <Route path="/e2e/edges" element={<Edges />} />
        <Route path="/e2e/encoder" element={<Encoder />} />
        <Route
          path="/e2e/visibility/:mode/:default/:encoded"
          element={<Visibility />}
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
