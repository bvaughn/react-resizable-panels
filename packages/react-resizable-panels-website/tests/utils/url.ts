import { Page } from "@playwright/test";
import { ReactElement } from "react";
import { PanelGroupProps } from "react-resizable-panels";
import { UrlPanelGroupToEncodedString } from "../../src/utils/UrlData";

export async function goToUrl(
  page: Page,
  element: ReactElement<PanelGroupProps> | null
) {
  const encodedString = element ? UrlPanelGroupToEncodedString(element) : "";

  const url = new URL("http://localhost:1234/__e2e");
  url.searchParams.set("urlPanelGroup", encodedString);

  // Uncomment when testing for easier repros
  // console.log(url.toString());

  await page.goto(url.toString());
}

export async function goToUrlWithIframe(
  page: Page,
  element: ReactElement<PanelGroupProps>,
  sameOrigin: boolean
) {
  const encodedString = UrlPanelGroupToEncodedString(element);

  const url = new URL("http://localhost:1234/__e2e/iframe");
  url.searchParams.set("urlPanelGroup", encodedString);
  if (sameOrigin) {
    url.searchParams.set("sameOrigin", "");
  }

  // Uncomment when testing for easier repros
  // console.log(url.toString());

  await page.goto(url.toString());
}

export async function updateUrl(
  page: Page,
  element: ReactElement<PanelGroupProps> | null
) {
  const encodedString = element ? UrlPanelGroupToEncodedString(element) : "";

  await page.evaluate(
    ([encodedString]) => {
      const url = new URL(window.location.href);
      url.searchParams.set("urlPanelGroup", encodedString ?? "");

      window.history.pushState(
        { urlPanelGroup: encodedString },
        "",
        url.toString()
      );

      window.dispatchEvent(new Event("popstate"));
    },
    [encodedString]
  );
}
