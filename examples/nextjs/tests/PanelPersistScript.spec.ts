import { expect, test } from "@playwright/test";

test.describe("Panel Persist Script", () => {
  test("should load and persist panel layouts using localStorage on the initial server side render", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000");

    await page.evaluate(() => {
      localStorage.setItem(
        "react-resizable-panels:l1",
        `{"l1:left,l1:middle,l1:right":{"expandToSizes":{},"layout":[{"order":1,"size":29.5488424113},{"order":2,"size":58.984252547},{"order":3,"size":11.4669050417}]}}`
      );
    });

    await page.goto("http://localhost:3000");

    const leftPanelSize = await page.$eval("#l1\\:left", (el) =>
      getComputedStyle(el).getPropertyValue("--panel-size").trim()
    );
    const middlePanelSize = await page.$eval("#l1\\:middle", (el) =>
      getComputedStyle(el).getPropertyValue("--panel-size").trim()
    );
    const rightPanelSize = await page.$eval("#l1\\:right", (el) =>
      getComputedStyle(el).getPropertyValue("--panel-size").trim()
    );

    expect(middlePanelSize).toBe("58.984");
    expect(rightPanelSize).toBe("11.467");
    expect(leftPanelSize).toBe("29.549");

    await page.close();
  });
});
