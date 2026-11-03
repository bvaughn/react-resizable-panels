import { describe, expect, test, vi } from "vitest";
import { createLayoutUpdateQueue } from "./createLayoutUpdateQueue";
import type { WorkspaceModel } from "../types";

function createModel(label: string): WorkspaceModel {
  return {
    root: { id: label, tabs: [], type: "tabset" },
    version: 1
  };
}

// An update that changes the model (by relabeling its root), or doesn't (if it's stale)
function relabel(label: string) {
  return (prev: WorkspaceModel) => ({
    ...prev,
    root: { ...prev.root, id: `${prev.root.id}+${label}` }
  });
}
function stale(prev: WorkspaceModel) {
  return prev;
}

function setup({ isActive = true }: { isActive?: boolean } = {}) {
  const model = createModel("model");
  const apply = vi.fn();
  const queue = createLayoutUpdateQueue({
    apply,
    getModel: () => model,
    isActive: () => isActive
  });

  // Applies the update that was reported, to the model
  const getAppliedModel = () =>
    (apply.mock.lastCall![1] as (prev: WorkspaceModel) => WorkspaceModel)(
      model
    );

  return { apply, getAppliedModel, queue: queue.queue };
}

describe("createLayoutUpdateQueue", () => {
  test("reports updates to several splits as one change, in a microtask", async () => {
    const { apply, getAppliedModel, queue } = setup();

    queue("a", "resize", relabel("a"));
    queue("b", "resize", relabel("b"));
    expect(apply).not.toHaveBeenCalled();

    await Promise.resolve();
    expect(apply).toHaveBeenCalledTimes(1);
    expect(apply.mock.lastCall![0]).toBe("resize");
    expect(getAppliedModel().root.id).toBe("model+a+b");
  });

  test("keeps only each split's latest update", async () => {
    const { apply, getAppliedModel, queue } = setup();

    queue("a", "collapse", relabel("first"));
    queue("a", "resize", relabel("second"));

    await Promise.resolve();
    expect(apply).toHaveBeenCalledTimes(1);
    expect(apply.mock.lastCall![0]).toBe("resize");
    expect(getAppliedModel().root.id).toBe("model+second");
  });

  test("reports expansions over collapses over resizes", async () => {
    const { apply, queue } = setup();

    queue("a", "resize", relabel("a"));
    queue("b", "collapse", relabel("b"));
    await Promise.resolve();
    expect(apply.mock.lastCall![0]).toBe("collapse");

    queue("a", "collapse", relabel("a"));
    queue("b", "expand", relabel("b"));
    await Promise.resolve();
    expect(apply.mock.lastCall![0]).toBe("expand");
  });

  test("ignores the reasons of stale updates (which don't change the model)", async () => {
    const { apply, queue } = setup();

    queue("a", "collapse", stale);
    queue("b", "resize", relabel("b"));

    await Promise.resolve();
    expect(apply).toHaveBeenCalledTimes(1);
    expect(apply.mock.lastCall![0]).toBe("resize");
  });

  test("doesn't report anything if every update is stale", async () => {
    const { apply, queue } = setup();

    queue("a", "collapse", stale);
    queue("b", "expand", stale);

    await Promise.resolve();
    expect(apply).not.toHaveBeenCalled();
  });

  test("doesn't report updates while inactive (e.g. after the Workspace is unmounted)", async () => {
    const { apply, queue } = setup({ isActive: false });

    queue("a", "resize", relabel("a"));

    await Promise.resolve();
    expect(apply).not.toHaveBeenCalled();
  });

  test("starts a new batch after reporting one", async () => {
    const { apply, getAppliedModel, queue } = setup();

    queue("a", "resize", relabel("a"));
    await Promise.resolve();
    queue("a", "resize", relabel("again"));
    await Promise.resolve();

    expect(apply).toHaveBeenCalledTimes(2);
    expect(getAppliedModel().root.id).toBe("model+again");
  });
});
