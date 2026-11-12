import { describe, expect, test } from "vitest";
import { getPopupPosition } from "./getPopupPosition";

const asWindow = (screenX: number, screenY: number) =>
  ({ screenX, screenY }) as unknown as Window;
const openedAt = { screenX: 300, screenY: 400 };

describe("getPopupPosition", () => {
  test("is the popup's position", () => {
    expect(
      getPopupPosition(asWindow(10, 20), asWindow(0, 0), openedAt)
    ).toEqual({ screenX: 10, screenY: 20 });
    // Only one coordinate matches
    expect(getPopupPosition(asWindow(0, 20), asWindow(0, 0), openedAt)).toEqual(
      {
        screenX: 0,
        screenY: 20
      }
    );
  });

  test("is where the popup was opened if it reports the opener's position", () => {
    expect(getPopupPosition(asWindow(0, 0), asWindow(0, 0), openedAt)).toEqual(
      openedAt
    );
  });
});
