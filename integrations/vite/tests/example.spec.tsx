import { test } from "@playwright/test";
import { Group, Panel, Separator } from "react-resizable-panels";
import { goToUrl } from "./utils/goToUrl";

test("sanity check", async ({ page }) => {
  await goToUrl(
    page,
    <Group>
      <Panel minSize={50} />
      <Separator />
      <Panel minSize={50} />
    </Group>
  );
});
