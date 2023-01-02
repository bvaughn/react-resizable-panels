import { Page } from "@playwright/test";
import { ReactElement } from "react";
import { PanelGroupProps } from "react-resizable-panels";
import { UrlPanelGroupToEncodedString } from "../../src/utils/UrlData";

export async function goToUrl(
  page: Page,
  element: ReactElement<PanelGroupProps>
) {
  const encodedString = UrlPanelGroupToEncodedString(element);
  const url = `http://localhost:2345/__e2e?urlPanelGroup=${encodedString}`;

  await page.goto(url);
}
