import type { Page } from "@playwright/test";
import type { ReactElement } from "react";
import type { GroupProps } from "react-resizable-panels";
import { encode } from "./serializer/encode";

export async function goToUrl(
  page: Page,
  element: ReactElement<GroupProps> | null,
  routeProp: string = "/e2e/decoder/"
) {
  let route = routeProp;
  if (route.startsWith("/")) {
    route = route.substring(1);
  }
  if (route.endsWith("/")) {
    route = route.substring(0, route.length - 1);
  }

  const encodedString = element ? encode(element) : "";

  const url = new URL(`http://localhost:3012/${route}/${encodedString}`);

  // Uncomment when testing for easier repro
  console.log(url.toString());

  await page.goto(url.toString());
}
