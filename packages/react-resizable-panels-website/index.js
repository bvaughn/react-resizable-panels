import { jsx as _jsx } from "react/jsx-runtime";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./src/App";
var rootElement = document.getElementById("root");
var root = createRoot(rootElement);
root.render(_jsx(StrictMode, { children: _jsx(App, {}) }));
