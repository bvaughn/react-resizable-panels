import { describe, expect, test } from "vitest";
import { getCopyModifierKey } from "./getCopyModifierKey";

function createWindow(navigator: object) {
  return { navigator } as unknown as Window;
}

describe("getCopyModifierKey", () => {
  test("is Option (Alt) on Apple platforms", () => {
    expect(getCopyModifierKey(createWindow({ platform: "MacIntel" }))).toBe(
      "Alt"
    );
    expect(getCopyModifierKey(createWindow({ platform: "iPad" }))).toBe("Alt");
    expect(
      getCopyModifierKey(
        createWindow({
          platform: "Win32",
          userAgentData: { platform: "macOS" }
        })
      )
    ).toBe("Alt");
  });

  test("is Ctrl elsewhere", () => {
    expect(getCopyModifierKey(createWindow({ platform: "Win32" }))).toBe(
      "Control"
    );
    expect(
      getCopyModifierKey(createWindow({ userAgentData: { platform: "Linux" } }))
    ).toBe("Control");
    expect(getCopyModifierKey(null)).toBe("Control");
  });
});
