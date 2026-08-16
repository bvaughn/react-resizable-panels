import { describe, expect, test } from "vitest";
import { panelConstraintsEqual } from "./panelConstraintsEqual";
import type { PanelConstraints } from "../../components/panel/types";

function createPanelConstraints(
  partial: { panelId: string } & Partial<PanelConstraints>
): PanelConstraints {
  return {
    collapsedSize: 0,
    collapsible: false,
    defaultSize: undefined,
    disabled: undefined,
    maxSize: 100,
    minSize: 0,
    ...partial
  };
}

const cases: [PanelConstraints[], PanelConstraints[], boolean][] = [
  [[], [], true],
  [[], [createPanelConstraints({ panelId: "a" })], false],
  [[createPanelConstraints({ panelId: "a" })], [], false],
  [
    [createPanelConstraints({ panelId: "a" })],
    [createPanelConstraints({ panelId: "a" })],
    true
  ],
  [
    [
      createPanelConstraints({ panelId: "a" }),
      createPanelConstraints({ panelId: "b" })
    ],
    [
      createPanelConstraints({ panelId: "a" }),
      createPanelConstraints({ panelId: "b" })
    ],
    true
  ],
  [
    [createPanelConstraints({ panelId: "a" })],
    [
      createPanelConstraints({ panelId: "a" }),
      createPanelConstraints({ panelId: "b" })
    ],
    false
  ],
  [
    [
      createPanelConstraints({ panelId: "a" }),
      createPanelConstraints({ panelId: "b" })
    ],
    [createPanelConstraints({ panelId: "a" })],
    false
  ],
  [
    [
      createPanelConstraints({ panelId: "a" }),
      createPanelConstraints({ panelId: "b" })
    ],
    [
      createPanelConstraints({ panelId: "a" }),
      createPanelConstraints({ panelId: "b", disabled: true })
    ],
    false
  ],
  [
    [createPanelConstraints({ panelId: "a", collapsible: false })],
    [createPanelConstraints({ panelId: "a", collapsible: true })],
    false
  ]
];

describe("panelConstraintsEqual", () => {
  test.each(cases)("objectsEqual: %o, %o -> %o", (a, b, expected) => {
    expect(panelConstraintsEqual(a, b)).toBe(expected);
  });
});
