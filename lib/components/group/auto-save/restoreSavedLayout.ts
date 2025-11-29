import type { SavedLayouts } from "./types";

// This function will be compiled separately and rendered as an inline, blocking script.
// @ts-expect-error Unused
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function restoreSavedLayout(groupId: string, storageKey: string) {
  try {
    const serialized = localStorage.getItem(storageKey);
    if (serialized) {
      const parsed = JSON.parse(serialized);
      if (typeof parsed === "object" && parsed != null) {
        const savedLayouts = parsed as SavedLayouts;
        const layout = savedLayouts.mostRecentLayout;
        if (layout) {
          const groupIdEscaped = groupId.replace(/[^a-zA-Z0-9\-_]/g, "");
          const cssRules = [];
          for (const panelId in layout) {
            const size = layout[panelId];
            const panelIdEscaped = panelId.replace(/[^a-zA-Z0-9\-_]/g, "");

            cssRules.push(
              `--react-resizable-panels--${groupIdEscaped}--${panelIdEscaped}: ${size.toFixed(3)};`
            );
          }

          if (cssRules.length > 0) {
            const sheet = new CSSStyleSheet();
            sheet.replaceSync(`:root { ${cssRules.join(" ")} }`);

            const adoptedStyleSheets: CSSStyleSheet[] = Array.from(
              document.adoptedStyleSheets
            );
            adoptedStyleSheets.push(sheet);

            document.adoptedStyleSheets = adoptedStyleSheets;
          }
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
}
