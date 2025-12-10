import { expect, test } from "@playwright/test";
import { Group, Panel, Separator } from "react-resizable-panels";
import { goToUrl } from "./utils/goToUrl";

test("sanity check", async ({ page }) => {
  await goToUrl(
    page,
    <Group>
      <Panel defaultSize="30%" minSize={50} />
      <Separator />
      <Panel minSize={50} />
    </Group>
  );

  await expect(page.getByText("30%")).toBeVisible();
  await expect(page.getByRole("separator")).toBeVisible();
  await expect(page.getByText("70%")).toBeVisible();
});
