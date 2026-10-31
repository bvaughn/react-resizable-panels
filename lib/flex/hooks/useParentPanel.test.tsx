import { act, render } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { Group, Panel, useParentPanel } from "../../index";
import { setDefaultElementBounds } from "../../shared/utils/test/mockBoundingClientRect";
import { createProbe } from "../../shared/utils/test/createProbe";

describe("useParentPanel", () => {
  test("returns null outside of a matching ancestor", () => {
    const probe = createProbe();
    const { Probe } = probe;

    render(<Probe />);

    expect(probe.latest.panel).toBeNull();
  });

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

  test("is not affected by unrelated context", () => {
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
