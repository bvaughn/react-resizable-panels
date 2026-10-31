import { useParentGrid, useParentGroup, useParentPanel } from "../../../index";

type Parents = {
  grid: ReturnType<typeof useParentGrid>;
  group: ReturnType<typeof useParentGroup>;
  panel: ReturnType<typeof useParentPanel>;
};

/**
 * Renders the useParent* hooks and records what they return, for testing them.
 */
export function createProbe() {
  const renders: Parents[] = [];

  function Probe() {
    renders.push({
      grid: useParentGrid(),
      group: useParentGroup(),
      panel: useParentPanel()
    });

    return null;
  }

  return {
    Probe,
    get latest() {
      const latest = renders.at(-1);
      if (latest === undefined) {
        throw Error("Probe has not rendered");
      }
      return latest;
    },
    get renderCount() {
      return renders.length;
    }
  };
}
