import type { Page } from "@playwright/test";
import { createElement, type ReactElement } from "react";
import { PopupWindow } from "../../src/components/PopupWindow";
import { encode } from "./serializer/encode";

export async function goToUrl({
  element: elementProp = null,
  page,
  route: routeProp = "/e2e/decoder/",
  usePopUpWindow = false
}: {
  element?: ReactElement<unknown> | null | undefined;
  page: Page;
  route?: string | undefined;
  usePopUpWindow?: boolean | undefined;
}): Promise<Page> {
  let route = routeProp;
  if (route.startsWith("/")) {
    route = route.substring(1);
  }
  if (route.endsWith("/")) {
    route = route.substring(0, route.length - 1);
  }

  let element = elementProp;
  let encodedString = "";
  if (element) {
    if (usePopUpWindow) {
      element = createElement(PopupWindow, {
        children: element,
        className: "dark"
      });
    }

    encodedString = encode(element);
  }

  const url = new URL(`http://localhost:3012/${route}/${encodedString}`);

  // Uncomment when testing for easier repro
  console.log("\n\n" + url.toString());

  await page.goto(url.toString());

  if (usePopUpWindow) {
    const popupPromise = page.waitForEvent("popup");

    await page.getByRole("button").click();

    return await popupPromise;
  }

  return page;
}
