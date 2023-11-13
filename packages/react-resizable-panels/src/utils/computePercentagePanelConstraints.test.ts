import { PanelConstraints } from "../Panel";
import { computePercentagePanelConstraints } from "./computePercentagePanelConstraints";

describe("computePercentagePanelConstraints", () => {
  it("should compute reasonable defaults with no constraints", () => {
    expect(computePercentagePanelConstraints([{}, {}], 0, 100))
      .toMatchInlineSnapshot(`
{
  "collapsedSizePercentage": 0,
  "defaultSizePercentage": undefined,
  "maxSizePercentage": 100,
  "minSizePercentage": 0,
}
`);

    expect(computePercentagePanelConstraints([{}, {}], 1, 100))
      .toMatchInlineSnapshot(`
{
  "collapsedSizePercentage": 0,
  "defaultSizePercentage": undefined,
  "maxSizePercentage": 100,
  "minSizePercentage": 0,
}
`);
  });

  it("should compute percentage based constraints based on a mix of pixels and percentages", () => {
    const constraints: PanelConstraints[] = [
      {
        maxSizePixels: 20,
        minSizePixels: 10,
      },
      {
        minSizePixels: 10,
      },
      {
        minSizePixels: 10,
      },
    ];

    expect(computePercentagePanelConstraints(constraints, 0, 100))
      .toMatchInlineSnapshot(`
{
  "collapsedSizePercentage": 0,
  "defaultSizePercentage": undefined,
  "maxSizePercentage": 20,
  "minSizePercentage": 10,
}
`);

    expect(computePercentagePanelConstraints(constraints, 1, 100))
      .toMatchInlineSnapshot(`
{
  "collapsedSizePercentage": 0,
  "defaultSizePercentage": undefined,
  "maxSizePercentage": 80,
  "minSizePercentage": 10,
}
`);

    expect(computePercentagePanelConstraints(constraints, 2, 100))
      .toMatchInlineSnapshot(`
{
  "collapsedSizePercentage": 0,
  "defaultSizePercentage": undefined,
  "maxSizePercentage": 80,
  "minSizePercentage": 10,
}
`);
  });

  it("should compute reasonable percentage based constraints from pixels if group size is negative", () => {
    jest.spyOn(console, "warn").mockImplementation(() => {});

    expect(
      computePercentagePanelConstraints(
        [
          {
            minSizePixels: 25,
            maxSizePixels: 100,
          },
        ],

        0,
        -100
      )
    ).toMatchInlineSnapshot(`
{
  "collapsedSizePercentage": 0,
  "defaultSizePercentage": undefined,
  "maxSizePercentage": 0,
  "minSizePercentage": 0,
}
`);

    expect(console.warn).toHaveBeenCalledTimes(1);
  });
});
