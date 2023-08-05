import { Page } from "@playwright/test";
import { ReactElement } from "react";
import {
  PanelGroupProps,
  usePanelGroupLayoutValidator,
} from "react-resizable-panels";
import { UrlPanelGroupToEncodedString } from "../../src/utils/UrlData";

export type Metadata = {
  usePanelGroupLayoutValidator?: Parameters<
    typeof usePanelGroupLayoutValidator
  >[0];
};

export async function goToUrl(
  page: Page,
  element: ReactElement<PanelGroupProps>,
  metadata?: Metadata
) {
  const encodedString = UrlPanelGroupToEncodedString(element);

  const url = new URL("http://localhost:1234/__e2e");
  url.searchParams.set("urlPanelGroup", encodedString);
  url.searchParams.set("metadata", metadata ? JSON.stringify(metadata) : "");

  await page.goto(url.toString());
}

export async function updateUrl(
  page: Page,
  element: ReactElement<PanelGroupProps>,
  metadata?: Metadata
) {
  const urlPanelGroupString = UrlPanelGroupToEncodedString(element);
  const metadataString = metadata ? JSON.stringify(metadata) : "";

  await page.evaluate(
    ([metadataString, urlPanelGroupString]) => {
      const url = new URL(window.location.href);
      url.searchParams.set("urlPanelGroup", urlPanelGroupString);
      url.searchParams.set("metadata", metadataString);

      window.history.pushState(
        { urlPanelGroup: urlPanelGroupString },
        "",
        url.toString()
      );

      window.dispatchEvent(new Event("popstate"));
    },
    [metadataString, urlPanelGroupString]
  );
}
