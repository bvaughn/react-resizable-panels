import type { Page } from "@playwright/test";
import { createElement, type ReactElement } from "react";
import { PopupWindow } from "../../src/components/PopupWindow";
import { encode } from "./serializer/encode";

export async function goToUrl(
  page: Page,
  elementProp: ReactElement<unknown>,
  config: {
    usePopUpWindow?: boolean | undefined;
  } = {}
): Promise<Page> {
  const { usePopUpWindow = false } = config;

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

  const url = new URL(`http://localhost:3012/e2e/decoder/${encodedString}`);

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
