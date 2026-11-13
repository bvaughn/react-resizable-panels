import { describe, expect, test } from "vitest";
import type { WorkspaceModel } from "../types";
import { setNodeSize } from "./setNodeSize";

const model: WorkspaceModel = {
  root: {
    children: [
      { id: "a", size: "200px", tabs: [], type: "tabset" },
      { id: "b", size: "300px", tabs: [], type: "tabset" }
    ],
    id: "root",
    orientation: "vertical",
    type: "split"
  },
  version: 1
};

describe("setNodeSize", () => {
  test("sets the size of a node within its split", () => {
    const next = setNodeSize(model, "b", "350px");
    expect(next.root.type === "split" && next.root.children[1]!.size).toBe(
      "350px"
    );
    expect(model.root.type === "split" && model.root.children[1]!.size).toBe(
      "300px"
    );
  });

  test("sets the size of the root", () => {
    expect(setNodeSize(model, "root", "500px").root.size).toBe("500px");
  });

  test("returns the same model if nothing changes", () => {
    expect(setNodeSize(model, "a", "200px")).toBe(model);
    expect(setNodeSize(model, "missing", "1px")).toBe(model);
  });
});
