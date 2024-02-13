import { PanelConstraints, PanelData } from "../Panel";
import { computePanelFlexBoxStyle } from "./computePanelFlexBoxStyle";

describe("computePanelFlexBoxStyle", () => {
  function createPanelData(constraints: PanelConstraints = {}): PanelData {
    return {
      callbacks: {},
      constraints,
      id: "fake",
      idIsFromProps: false,
      order: undefined,
    };
  }

  it("should observe a panel's default size if group layout has not yet been computed", () => {
    expect(
      computePanelFlexBoxStyle({
        defaultSize: 0.1233456789,
        dragState: null,
        layout: [],
        panelData: [
          createPanelData({
            defaultSize: 0.1233456789,
          }),
          createPanelData(),
        ],
        panelIndex: 0,
        precision: 2,
      })
    ).toMatchInlineSnapshot(`
{
  "flexBasis": 0,
  "flexGrow": "0.12",
  "flexShrink": 1,
  "overflow": "hidden",
  "pointerEvents": undefined,
}
`);
  });

  it("should always fill the full width for single-panel groups", () => {
    expect(
      computePanelFlexBoxStyle({
        defaultSize: undefined,
        dragState: null,
        layout: [],
        panelData: [createPanelData()],
        panelIndex: 0,
        precision: 2,
      })
    ).toMatchInlineSnapshot(`
{
  "flexBasis": 0,
  "flexGrow": "1",
  "flexShrink": 1,
  "overflow": "hidden",
  "pointerEvents": undefined,
}
`);
  });

  it("should round sizes to avoid floating point precision errors", () => {
    const layout = [0.25435, 0.5758, 0.1698];
    const panelData = [createPanelData(), createPanelData(), createPanelData()];

    expect(
      computePanelFlexBoxStyle({
        defaultSize: undefined,
        dragState: null,
        layout,
        panelData,
        panelIndex: 0,
        precision: 2,
      })
    ).toMatchInlineSnapshot(`
{
  "flexBasis": 0,
  "flexGrow": "0.25",
  "flexShrink": 1,
  "overflow": "hidden",
  "pointerEvents": undefined,
}
`);

    expect(
      computePanelFlexBoxStyle({
        defaultSize: undefined,
        dragState: null,
        layout,
        panelData,
        panelIndex: 1,
        precision: 2,
      })
    ).toMatchInlineSnapshot(`
{
  "flexBasis": 0,
  "flexGrow": "0.58",
  "flexShrink": 1,
  "overflow": "hidden",
  "pointerEvents": undefined,
}
`);

    expect(
      computePanelFlexBoxStyle({
        defaultSize: undefined,
        dragState: null,
        layout,
        panelData,
        panelIndex: 2,
        precision: 2,
      })
    ).toMatchInlineSnapshot(`
{
  "flexBasis": 0,
  "flexGrow": "0.17",
  "flexShrink": 1,
  "overflow": "hidden",
  "pointerEvents": undefined,
}
`);
  });
});
