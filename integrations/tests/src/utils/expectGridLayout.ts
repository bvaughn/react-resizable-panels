import { expect, type Page } from "@playwright/test";
import type { GridLayout } from "react-resizable-panels";

/**
 * Asserts the most recent layout reported by the Grid's onLayoutChange/onLayoutChanged callbacks
 * (as displayed by the Decoder's debug data, with sizes rounded to whole percentages).
 */
export async function expectGridLayout({
  layout,
  mainPage,
  onLayoutChangedCount
}: {
  layout: GridLayout;
  mainPage: Page;
  onLayoutChangedCount?: number | undefined;
}) {
  const debugData = mainPage.getByText('"gridLayout"');

  await expect
    .poll(async () => {
      const data = JSON.parse((await debugData.textContent()) ?? "{}");
      return onLayoutChangedCount === undefined
        ? { gridLayout: data.gridLayout }
        : {
            gridLayout: data.gridLayout,
            onGridLayoutChangedCount: data.onGridLayoutChangedCount
          };
    })
    .toEqual(
      onLayoutChangedCount === undefined
        ? { gridLayout: layout }
        : { gridLayout: layout, onGridLayoutChangedCount: onLayoutChangedCount }
    );
}
