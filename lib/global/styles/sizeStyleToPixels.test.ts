import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { NOOP_FUNCTION } from "../../constants";
import {
  mockGetComputedStyle,
  setDefaultElementStyle
} from "../../utils/test/mockGetComputedStyle";
import { sizeStyleToPixels } from "./sizeStyleToPixels";

describe("sizeStyleToPixels", () => {
  let panelElement: HTMLElement;
  let unmockGetComputedStyle = NOOP_FUNCTION;

  beforeEach(() => {
    unmockGetComputedStyle = mockGetComputedStyle();

    panelElement = document.createElement("div");
  });

  afterEach(() => {
    unmockGetComputedStyle();
  });

  describe("implicit units", () => {
    test("% units", () => {
      expect(
        sizeStyleToPixels({
          groupSize: 800,
          panelElement,
          styleProp: "100"
        })
      ).toBe(800);

      expect(
        sizeStyleToPixels({
          groupSize: 800,
          panelElement,
          styleProp: "50"
        })
      ).toBe(400);

      expect(
        sizeStyleToPixels({
          groupSize: 800,
          panelElement,
          styleProp: "0"
        })
      ).toBe(0);
    });

    test("px units", () => {
      expect(
        sizeStyleToPixels({
          groupSize: 800,
          panelElement,
          styleProp: 800
        })
      ).toBe(800);

      expect(
        sizeStyleToPixels({
          groupSize: 800,
          panelElement,
          styleProp: 400
        })
      ).toBe(400);

      expect(
        sizeStyleToPixels({
          groupSize: 800,
          panelElement,
          styleProp: 0
        })
      ).toBe(0);
    });
  });

  describe("explicit units", () => {
    test("% units", () => {
      expect(
        sizeStyleToPixels({
          groupSize: 800,
          panelElement,
          styleProp: "100%"
        })
      ).toBe(800);

      expect(
        sizeStyleToPixels({
          groupSize: 800,
          panelElement,
          styleProp: "50%"
        })
      ).toBe(400);

      expect(
        sizeStyleToPixels({
          groupSize: 800,
          panelElement,
          styleProp: "0%"
        })
      ).toBe(0);
    });

    test("px units", () => {
      expect(
        sizeStyleToPixels({
          groupSize: 800,
          panelElement,
          styleProp: "800px"
        })
      ).toBe(800);

      expect(
        sizeStyleToPixels({
          groupSize: 800,
          panelElement,
          styleProp: "400px"
        })
      ).toBe(400);

      expect(
        sizeStyleToPixels({
          groupSize: 800,
          panelElement,
          styleProp: "0px"
        })
      ).toBe(0);
    });

    test("rem units", () => {
      setDefaultElementStyle({
        fontSize: 20
      } as unknown as CSSStyleDeclaration);

      expect(
        sizeStyleToPixels({
          groupSize: 100,
          panelElement,
          styleProp: "1rem"
        })
      ).toBe(20);

      expect(
        sizeStyleToPixels({
          groupSize: 100,
          panelElement,
          styleProp: ".5rem"
        })
      ).toBe(10);

      expect(
        sizeStyleToPixels({
          groupSize: 100,
          panelElement,
          styleProp: "0rem"
        })
      ).toBe(0);
    });

    test("em units", () => {
      setDefaultElementStyle({
        fontSize: 20
      } as unknown as CSSStyleDeclaration);

      expect(
        sizeStyleToPixels({
          groupSize: 100,
          panelElement,
          styleProp: "1em"
        })
      ).toBe(20);

      expect(
        sizeStyleToPixels({
          groupSize: 100,
          panelElement,
          styleProp: ".5em"
        })
      ).toBe(10);

      expect(
        sizeStyleToPixels({
          groupSize: 100,
          panelElement,
          styleProp: "0em"
        })
      ).toBe(0);
    });

    test("vh units", () => {
      window.innerHeight = 800;
      window.innerWidth = 1200;

      expect(
        sizeStyleToPixels({
          groupSize: 1600,
          panelElement,
          styleProp: "100vh"
        })
      ).toBe(800);

      expect(
        sizeStyleToPixels({
          groupSize: 1600,
          panelElement,
          styleProp: "50vh"
        })
      ).toBe(400);

      expect(
        sizeStyleToPixels({
          groupSize: 1600,
          panelElement,
          styleProp: "0vh"
        })
      ).toBe(0);
    });

    test("vw units", () => {
      window.innerHeight = 1200;
      window.innerWidth = 800;

      expect(
        sizeStyleToPixels({
          groupSize: 1600,
          panelElement,
          styleProp: "100vw"
        })
      ).toBe(800);

      expect(
        sizeStyleToPixels({
          groupSize: 1600,
          panelElement,
          styleProp: "50vw"
        })
      ).toBe(400);

      expect(
        sizeStyleToPixels({
          groupSize: 1600,
          panelElement,
          styleProp: "0vw"
        })
      ).toBe(0);
    });
  });
});
