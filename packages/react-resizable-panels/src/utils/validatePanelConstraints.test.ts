import { verifyExpectedWarnings } from "./test-utils";
import { validatePanelConstraints } from "./validatePanelConstraints";

describe("validatePanelConstraints", () => {
  it("should not warn if there are no validation errors", () => {
    verifyExpectedWarnings(() => {
      validatePanelConstraints({
        panelConstraints: [{}],
        panelIndex: 0,
        panelId: "test",
      });
    });
  });

  it("should warn about conflicting min/max sizes", () => {
    verifyExpectedWarnings(() => {
      validatePanelConstraints({
        panelConstraints: [
          {
            maxSize: 5,
            minSize: 10,
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
        panelConstraints: [
          {
            collapsedSize: 15,
            minSize: 10,
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
        panelConstraints: [
          {
            defaultSize: -1,
            minSize: 10,
          },
        ],
        panelIndex: 0,
        panelId: "test",
      });
    }, "default size should not be less than 0");

    verifyExpectedWarnings(() => {
      validatePanelConstraints({
        panelConstraints: [
          {
            defaultSize: 5,
            minSize: 10,
          },
        ],
        panelIndex: 0,
        panelId: "test",
      });
    }, "default size should not be less than min size");

    verifyExpectedWarnings(() => {
      validatePanelConstraints({
        panelConstraints: [
          {
            collapsedSize: 5,
            collapsible: true,
            defaultSize: 5,
            minSize: 10,
          },
        ],
        panelIndex: 0,
        panelId: "test",
      });
    });

    verifyExpectedWarnings(() => {
      validatePanelConstraints({
        panelConstraints: [
          {
            collapsedSize: 7,
            collapsible: true,
            defaultSize: 5,
            minSize: 10,
          },
        ],
        panelIndex: 0,
        panelId: "test",
      });
    }, "default size should not be less than min size");

    verifyExpectedWarnings(() => {
      validatePanelConstraints({
        panelConstraints: [
          {
            collapsedSize: 5,
            collapsible: false,
            defaultSize: 5,
            minSize: 10,
          },
        ],
        panelIndex: 0,
        panelId: "test",
      });
    }, "default size should not be less than min size");

    verifyExpectedWarnings(() => {
      validatePanelConstraints({
        panelConstraints: [
          {
            defaultSize: 101,
            maxSize: 10,
          },
        ],
        panelIndex: 0,
        panelId: "test",
      });
    }, "default size should not be greater than 100");

    verifyExpectedWarnings(() => {
      validatePanelConstraints({
        panelConstraints: [
          {
            defaultSize: 15,
            maxSize: 10,
          },
        ],
        panelIndex: 0,
        panelId: "test",
      });
    }, "default size should not be greater than max size");
  });
});
