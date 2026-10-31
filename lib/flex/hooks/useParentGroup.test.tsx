import { act, render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { Cell, Grid, Group, Panel } from "../../index";
import { setDefaultElementBounds } from "../../shared/utils/test/mockBoundingClientRect";
import { createProbe } from "../../shared/utils/test/createProbe";

describe("useParentGroup", () => {
  test("returns null outside of a matching ancestor", () => {
    const probe = createProbe();
    const { Probe } = probe;

    render(<Probe />);

    expect(probe.latest.group).toBeNull();
  });

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
