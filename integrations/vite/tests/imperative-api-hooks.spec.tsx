import { expect, test } from "@playwright/test";
import { Group, Panel, Separator } from "react-resizable-panels";
import { goToUrl } from "./utils/goToUrl";

// High level tests; more nuanced scenarios are covered by unit tests
test.describe("imperative API hooks", () => {
  for (const usePopUpWindow of [true, false]) {
    test.describe(usePopUpWindow ? "in a popup" : "in the main window", () => {
      for (const { useGroupCallbackRef, useGroupRef } of [
        { useGroupRef: true },
        { useGroupCallbackRef: true }
      ]) {
        test(
          useGroupCallbackRef ? "useGroupCallbackRef" : "useGroupRef",
          async ({ page: mainPage }) => {
            await goToUrl(
              mainPage,
              <Group>
                <Panel id="left" defaultSize="30" />
                <Separator />
                <Panel id="right" />
              </Group>,
              { usePopUpWindow, useGroupCallbackRef, useGroupRef }
            );

            await expect(
              mainPage.getByText("imperativeGroupApiLayout")
            ).toContainText('"left": 30');
          }
        );
      }

      for (const { usePanelCallbackRef, usePanelRef } of [
        { usePanelRef: true },
        { usePanelCallbackRef: true }
      ]) {
        test(
          usePanelCallbackRef ? "usePanelCallbackRef" : "usePanelRef",
          async ({ page: mainPage }) => {
            await goToUrl(
              mainPage,
              <Group>
                <Panel id="left" defaultSize="30" />
                <Separator />
                <Panel id="right" />
              </Group>,
              { usePopUpWindow, usePanelCallbackRef, usePanelRef }
            );

            await expect(
              mainPage.getByText("imperativePanelApiSize")
            ).toContainText('"asPercentage": 70');
          }
        );
      }
    });
  }
});
