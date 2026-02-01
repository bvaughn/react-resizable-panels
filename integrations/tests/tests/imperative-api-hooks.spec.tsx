import { expect, test } from "@playwright/test";
import { Group, Panel, Separator } from "react-resizable-panels";
import { goToUrl } from "../src/utils/goToUrl";

// High level tests; more nuanced scenarios are covered by unit tests
test.describe("imperative API hooks", () => {
  for (const { useGroupCallbackRef, useGroupRef } of [
    { useGroupRef: true },
    { useGroupCallbackRef: true }
  ]) {
    test.describe(
      useGroupCallbackRef ? "useGroupCallbackRef" : "useGroupRef",
      () => {
        test("should work", async ({ page: mainPage }) => {
          await goToUrl(
            mainPage,
            <Group>
              <Panel id="left" defaultSize="30" />
              <Separator />
              <Panel id="right" />
            </Group>,
            { useGroupCallbackRef, useGroupRef }
          );

          await expect(
            mainPage.getByText("imperativeGroupApiLayout")
          ).toContainText('"left": 30');
        });
      }
    );
  }

  for (const { usePanelCallbackRef, usePanelRef } of [
    { usePanelRef: true },
    { usePanelCallbackRef: true }
  ]) {
    test.describe(
      usePanelCallbackRef ? "usePanelCallbackRef" : "usePanelRef",
      () => {
        test("should work", async ({ page: mainPage }) => {
          await goToUrl(
            mainPage,
            <Group>
              <Panel id="left" defaultSize="30" />
              <Separator />
              <Panel id="right" />
            </Group>,
            { usePanelCallbackRef, usePanelRef }
          );

          await expect(
            mainPage.getByText("imperativePanelApiSize")
          ).toContainText('"asPercentage": 70');
        });
      }
    );
  }
});
