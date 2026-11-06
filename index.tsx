import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./src/App.tsx";

// Shown in iframes by the "Copies of your app" page, without the rest of the site
const DragBetweenAppsEmbed = lazy(
  () => import("./src/embeds/DragBetweenAppsEmbed.tsx")
);

const isEmbed = location.pathname === "/embed/app";

// Set before anything renders, so the site's background isn't shown while the embed loads (see index.css)
if (isEmbed) {
  document.documentElement.setAttribute("data-embed", "");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {isEmbed ? (
      <Suspense>
        <DragBetweenAppsEmbed />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>
);
