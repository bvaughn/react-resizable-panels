import { verifyExpectedWarnings } from "./test-utils";
import { validatePanelConstraints } from "./validatePanelConstraints";

describe("validatePanelConstraints", () => {
  it("should not warn if there are no validation errors", () => {
    verifyExpectedWarnings(() => {
      validatePanelConstraints({
        groupSizePixels: 100_000,
        panelConstraints: [{}],
        panelIndex: 0,
        panelId: "test",
      });
    });
  });

  it("should warn about conflicting percentages and pixels", () => {
    verifyExpectedWarnings(() => {
      validatePanelConstraints({
        groupSizePixels: 100_000,
        panelConstraints: [
          {
            collapsedSizePercentage: 5,
            collapsedSizePixels: 10,
          },
        ],
        panelIndex: 0,
        panelId: "test",
      });
    }, "should not specify both percentage and pixel units for: collapsed size");

    verifyExpectedWarnings(() => {
      validatePanelConstraints({
        groupSizePixels: 100_000,
        panelConstraints: [
          {
            maxSizePercentage: 5,
            maxSizePixels: 10,
            minSizePercentage: 5,
            minSizePixels: 10,
          },
        ],
        panelIndex: 0,
        panelId: "test",
      });
    }, "should not specify both percentage and pixel units for: max size, min size");

    verifyExpectedWarnings(() => {
      validatePanelConstraints({
        groupSizePixels: 100_000,
        panelConstraints: [
          {
            defaultSizePercentage: 5,
            defaultSizePixels: 10,
          },
        ],
        panelIndex: 0,
        panelId: "test",
      });
    }, "should not specify both percentage and pixel units for: default size");
  });

  it("should warn about conflicting min/max sizes", () => {
    verifyExpectedWarnings(() => {
      validatePanelConstraints({
        groupSizePixels: 100_000,
        panelConstraints: [
          {
            maxSizePercentage: 5,
            minSizePercentage: 10,
          },
        ],
        panelIndex: 0,
        panelId: "test",
      });
    }, "min size (10%) should not be greater than max size (5%)");
  });

  it("should warn about conflicting collapsed and min sizes", () => {
    verifyExpectedWarnings(() => {
      validatePanelConstraints({
        groupSizePixels: 100_000,
        panelConstraints: [
          {
            collapsedSizePercentage: 15,
            minSizePercentage: 10,
          },
        ],
        panelIndex: 0,
        panelId: "test",
      });
    }, "collapsed size should not be greater than min size");
  });

  it("should warn about conflicting default and min/max sizes", () => {
    verifyExpectedWarnings(() => {
      validatePanelConstraints({
        groupSizePixels: 100_000,
        panelConstraints: [
          {
            defaultSizePercentage: -1,
            minSizePercentage: 10,
          },
        ],
        panelIndex: 0,
        panelId: "test",
      });
    }, "default size should not be less than 0");

    verifyExpectedWarnings(() => {
      validatePanelConstraints({
        groupSizePixels: 100_000,
        panelConstraints: [
          {
            defaultSizePercentage: 5,
            minSizePercentage: 10,
          },
        ],
        panelIndex: 0,
        panelId: "test",
      });
    }, "default size should not be less than min size");

    verifyExpectedWarnings(() => {
      validatePanelConstraints({
        groupSizePixels: 100_000,
        panelConstraints: [
          {
            defaultSizePercentage: 101,
            maxSizePercentage: 10,
          },
        ],
        panelIndex: 0,
        panelId: "test",
      });
    }, "default size should not be greater than 100");

    verifyExpectedWarnings(() => {
      validatePanelConstraints({
        groupSizePixels: 100_000,
        panelConstraints: [
          {
            defaultSizePercentage: 15,
            maxSizePercentage: 10,
          },
        ],
        panelIndex: 0,
        panelId: "test",
      });
    }, "default size should not be greater than max size");
  });
});
