import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { App } from "./App";

export function render() {
  const html = renderToString(
    <StrictMode>
      <App />
    </StrictMode>
  );

  return { html };
}
