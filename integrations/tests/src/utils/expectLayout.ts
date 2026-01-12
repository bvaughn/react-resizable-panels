import { expect, type Page } from "@playwright/test";
import type { Layout } from "react-resizable-panels";

export async function expectLayout({
  layout,
  mainPage,
  onLayoutChangeCount,
  onLayoutChangedCount
}: {
  layout: Layout;
  mainPage: Page;
  onLayoutChangeCount: number;
  onLayoutChangedCount: number;
}) {
  await expect(mainPage.getByText('"layout"')).toHaveText(
    JSON.stringify(
      {
        layout,
        onLayoutChangeCount,
        onLayoutChangedCount
      },
      null,
      2
    )
  );
}
