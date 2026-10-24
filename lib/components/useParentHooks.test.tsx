import { act, render } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { setDefaultElementBounds } from "../utils/test/mockBoundingClientRect";
import {
  Cell,
  Grid,
  Group,
  Panel,
  useParentGrid,
  useParentGroup,
  useParentPanel
} from "../index";

type Parents = {
  grid: ReturnType<typeof useParentGrid>;
  group: ReturnType<typeof useParentGroup>;
  panel: ReturnType<typeof useParentPanel>;
};

function createProbe() {
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

describe("useParent* hooks", () => {
  test("return null outside of a matching ancestor", () => {
    const probe = createProbe();
    const { Probe } = probe;

    render(<Probe />);

    expect(probe.latest).toEqual({
      grid: null,
      group: null,
      panel: null
    });
  });

  describe("useParentGroup", () => {
    test("returns the nearest Group", () => {
      const probe = createProbe();
      const { Probe } = probe;

      render(
        <Group id="outer">
          <Panel id="outer-panel">
            <Group id="inner" orientation="vertical">
              <Panel id="inner-panel">
                <Probe />
              </Panel>
            </Group>
          </Panel>
        </Group>
      );

      expect(probe.latest.group?.id).toBe("inner");
      expect(probe.latest.group?.orientation).toBe("vertical");
    });

    test("exposes the Group's imperative API", () => {
      setDefaultElementBounds(new DOMRect(0, 0, 100, 100));

      const probe = createProbe();
      const { Probe } = probe;

      render(
        <Group id="group">
          <Panel id="left">
            <Probe />
          </Panel>
          <Panel id="right" />
        </Group>
      );

      expect(probe.latest.group?.getLayout()).toEqual({ left: 50, right: 50 });

      act(() => {
        probe.latest.group?.setLayout({ left: 25, right: 75 });
      });

      expect(probe.latest.group?.getLayout()).toEqual({ left: 25, right: 75 });
    });

    test("does not re-render when the layout changes", () => {
      setDefaultElementBounds(new DOMRect(0, 0, 100, 100));

      const probe = createProbe();
      const { Probe } = probe;

      render(
        <Group id="group">
          <Panel id="left">
            <Probe />
          </Panel>
          <Panel id="right" />
        </Group>
      );

      const group = probe.latest.group;
      const panel = probe.latest.panel;
      const renderCount = probe.renderCount;

      act(() => {
        group?.setLayout({ left: 25, right: 75 });
      });

      expect(probe.renderCount).toBe(renderCount);
      expect(probe.latest.group).toBe(group);
      expect(probe.latest.panel).toBe(panel);
    });

    test("sees past a Grid to the nearest Group outside of it", () => {
      const probe = createProbe();
      const { Probe } = probe;

      render(
        <Group id="group">
          <Panel id="panel">
            <Grid columns={1} id="grid" rows={1}>
              <Cell column={0} id="cell" row={0}>
                <Probe />
              </Cell>
            </Grid>
          </Panel>
        </Group>
      );

      expect(probe.latest.group?.id).toBe("group");
      expect(probe.latest.panel?.id).toBe("panel");
      expect(probe.latest.grid?.id).toBe("grid");
    });
  });

  describe("useParentPanel", () => {
    test("returns the nearest Panel", () => {
      const probe = createProbe();
      const { Probe } = probe;

      render(
        <Group id="outer">
          <Panel id="outer-panel">
            <Group id="inner">
              <Panel id="inner-panel">
                <Probe />
              </Panel>
            </Group>
          </Panel>
        </Group>
      );

      expect(probe.latest.panel?.id).toBe("inner-panel");
      expect(probe.latest.panel?.groupId).toBe("inner");
    });

    test("exposes the Panel's imperative API", () => {
      setDefaultElementBounds(new DOMRect(0, 0, 100, 100));

      const probe = createProbe();
      const { Probe } = probe;

      render(
        <Group id="group">
          <Panel collapsible id="left" minSize={20}>
            <Probe />
          </Panel>
          <Panel id="right" />
        </Group>
      );

      expect(probe.latest.panel?.getSize().asPercentage).toBe(50);
      expect(probe.latest.panel?.isCollapsed()).toBe(false);

      act(() => {
        probe.latest.panel?.collapse();
      });

      expect(probe.latest.panel?.isCollapsed()).toBe(true);
      expect(probe.latest.group?.getLayout()).toEqual({ left: 0, right: 100 });

      act(() => {
        probe.latest.panel?.expand();
      });

      expect(probe.latest.panel?.getSize().asPercentage).toBe(50);
    });
  });

  describe("useParentGrid", () => {
    test("returns the nearest Grid", () => {
      setDefaultElementBounds(new DOMRect(0, 0, 100, 100));

      const probe = createProbe();
      const { Probe } = probe;

      render(
        <Grid columns={2} id="grid" rows={2}>
          <Cell column={0} columnSpan={2} id="cell" row={1}>
            <Probe />
          </Cell>
        </Grid>
      );

      expect(probe.latest.grid?.id).toBe("grid");
      expect(probe.latest.grid?.getLayout()).toEqual({
        columns: { 0: 50, 1: 50 },
        rows: { 0: 50, 1: 50 }
      });
      expect(probe.latest.grid?.getTrackByIndex("row", 1).getSize()).toEqual(
        expect.objectContaining({ asPercentage: 50 })
      );
    });
  });

  test("hooks are not affected by unrelated context (sanity check)", () => {
    const onRender = vi.fn();
    function Probe() {
      onRender(useParentPanel());
      return null;
    }

    render(
      <Group id="group">
        <Probe />
      </Group>
    );

    expect(onRender).toHaveBeenLastCalledWith(null);
  });
});
