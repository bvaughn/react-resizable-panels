import { test } from "@playwright/test";
import { Group, Panel, Separator } from "react-resizable-panels";
import { assertLayoutChangeCounts } from "../src/utils/assertLayoutChangeCounts";
import { goToUrl } from "../src/utils/goToUrl";

test.describe("fixed size elements", () => {
  test("should not be interactive directly", async ({ page: mainPage }) => {
    const page = await goToUrl(
      mainPage,
      <Group>
        <Panel id="foo" />
        <div>foo+bar</div>
        <Panel id="bar" />
        <Separator id="bar+baz" />
        <div>bar+baz</div>
        <Panel id="baz" />
        <Separator id="baz+qux+left" />
        <div>baz+qux</div>
        <Separator id="baz+qux+right" />
        <Panel id="qux" />
      </Group>
    );

    await assertLayoutChangeCounts(mainPage, 1);

    for (const text of ["foo+bar", "bar+baz", "baz+qux"]) {
      const box = (await page.getByText(text).boundingBox())!;

      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(0, 0);
      await page.mouse.up();
    }

    await assertLayoutChangeCounts(mainPage, 1);
  });

  test("should work without an explicit separator", async ({
    page: mainPage
  }) => {
    const page = await goToUrl(
      mainPage,
      <Group>
        <Panel id="foo" />
        <div>foo+bar</div>
        <Panel id="bar" />
        <Separator id="bar+baz" />
        <div>bar+baz</div>
        <Panel id="baz" />
        <Separator id="baz+qux+left" />
        <div>baz+qux</div>
        <Separator id="baz+qux+right" />
        <Panel id="qux" />
      </Group>
    );

    await assertLayoutChangeCounts(mainPage, 1);

    const boxFoo = (await page.getByText("id: foo").boundingBox())!;

    await page.mouse.move(boxFoo.x + boxFoo.width, boxFoo.y);
    await page.mouse.down();
    await page.mouse.move(0, 0);
    await page.mouse.up();

    await assertLayoutChangeCounts(mainPage, 2);

    const boxBar = (await page.getByText("id: bar").boundingBox())!;

    await page.mouse.move(boxBar.x, boxBar.y);
    await page.mouse.down();
    await page.mouse.move(1000, 0);
    await page.mouse.up();

    await assertLayoutChangeCounts(mainPage, 3);
  });

  test("should work with an explicit separator", async ({ page: mainPage }) => {
    const page = await goToUrl(
      mainPage,
      <Group>
        <Panel id="foo" />
        <div>foo+bar</div>
        <Panel id="bar" />
        <Separator id="bar+baz" />
        <div>bar+baz</div>
        <Panel id="baz" />
        <Separator id="baz+qux+left" />
        <div>baz+qux</div>
        <Separator id="baz+qux+right" />
        <Panel id="qux" />
      </Group>
    );

    const separatorBox = (await page.getByTestId("bar+baz").boundingBox())!;

    await page.mouse.move(separatorBox.x, separatorBox.y);
    await page.mouse.down();
    await page.mouse.move(0, 0);
    await page.mouse.up();

    await assertLayoutChangeCounts(mainPage, 2);

    const boxBaz = (await page.getByText("id: baz").boundingBox())!;

    await page.mouse.move(boxBaz.x, boxBaz.y);
    await page.mouse.down();
    await page.mouse.move(1000, 0);
    await page.mouse.up();

    await assertLayoutChangeCounts(mainPage, 3);
  });

  test("should work with two explicit separators", async ({
    page: mainPage
  }) => {
    const page = await goToUrl(
      mainPage,
      <Group>
        <Panel id="foo" />
        <div>foo+bar</div>
        <Panel id="bar" />
        <Separator id="bar+baz" />
        <div>bar+baz</div>
        <Panel id="baz" />
        <Separator id="baz+qux+left" />
        <div>baz+qux</div>
        <Separator id="baz+qux+right" />
        <Panel id="qux" />
      </Group>
    );

    let separatorBox = (await page.getByTestId("baz+qux+left").boundingBox())!;

    await page.mouse.move(separatorBox.x, separatorBox.y);
    await page.mouse.down();
    await page.mouse.move(0, 0);
    await page.mouse.up();

    await assertLayoutChangeCounts(mainPage, 2);

    separatorBox = (await page.getByTestId("baz+qux+right").boundingBox())!;

    await page.mouse.move(separatorBox.x, separatorBox.y);
    await page.mouse.down();
    await page.mouse.move(1000, 0);
    await page.mouse.up();

    await assertLayoutChangeCounts(mainPage, 3);
  });
});
