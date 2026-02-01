import { render } from "@testing-library/react";
import {
  createRef,
  useEffect,
  useLayoutEffect,
  useRef,
  type PropsWithChildren
} from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { assert } from "../../utils/assert";
import {
  setDefaultElementBounds,
  setElementBoundsFunction
} from "../../utils/test/mockBoundingClientRect";
import { Panel } from "../panel/Panel";
import type { PanelImperativeHandle } from "../panel/types";
import { Separator } from "../separator/Separator";
import { Group } from "./Group";
import { useGroupRef } from "./hooks/useGroupRef";
import type { GroupImperativeHandle } from "./types";

describe("Group", () => {
  describe("defaultLayout", () => {
    test("should be ignored if it does not match Panel ids", () => {
      const onLayoutChange = vi.fn();
      const onLayoutChanged = vi.fn();

      setDefaultElementBounds(new DOMRect(0, 0, 100, 50));

      render(
        <Group
          defaultLayout={{
            foo: 40,
            bar: 60
          }}
          onLayoutChange={onLayoutChange}
          onLayoutChanged={onLayoutChanged}
        >
          <Panel id="bar" />
          <Panel id="baz" />
        </Group>
      );

      // Change callbacks triggered because default layout was invalid
      expect(onLayoutChange).toHaveBeenCalledTimes(1);
      expect(onLayoutChange).toHaveBeenCalledWith({
        bar: 50,
        baz: 50
      });
      expect(onLayoutChanged).toHaveBeenCalledTimes(1);
      expect(onLayoutChanged).toHaveBeenCalledWith({
        bar: 50,
        baz: 50
      });
    });

    test("should be ignored if mismatch is caused by rendering within a hidden subtree", () => {
      const onLayoutChange = vi.fn();
      const onLayoutChanged = vi.fn();

      render(
        <Group
          defaultLayout={{
            foo: 40,
            bar: 60
          }}
          onLayoutChange={onLayoutChange}
          onLayoutChanged={onLayoutChanged}
        >
          <Panel id="bar" />
          <Panel id="baz" />
        </Group>
      );

      expect(onLayoutChange).not.toHaveBeenCalled();
      expect(onLayoutChanged).not.toHaveBeenCalled();
    });

    test("should not require multiple render passes", () => {
      setElementBoundsFunction((element) => {
        if (element.hasAttribute("data-panel")) {
          return new DOMRect(0, 0, 50, 50);
        } else {
          return new DOMRect(0, 0, 100, 50);
        }
      });

      const onLayoutChange = vi.fn();
      const onLayoutChanged = vi.fn();

      function DomChecker({ children }: PropsWithChildren) {
        const ref = useRef<HTMLDivElement>(null);

        // Easiest way to confirm the Group didn't render temporarily invalid values during mount
        useLayoutEffect(() => {
          const element = ref.current;
          assert(element);

          const fooPanel = element.querySelector('[data-testid="foo"]');
          expect((fooPanel as HTMLDivElement).style.flexGrow).toEqual("40");

          const barPanel = element.querySelector('[data-testid="bar"]');
          expect((barPanel as HTMLDivElement).style.flexGrow).toEqual("60");
        });

        return <div ref={ref}>{children}</div>;
      }

      const groupRef = createRef<GroupImperativeHandle>();
      const panelRef = createRef<PanelImperativeHandle>();

      render(
        <DomChecker>
          <Group
            defaultLayout={{
              foo: 40,
              bar: 60
            }}
            groupRef={groupRef}
            onLayoutChange={onLayoutChange}
            onLayoutChanged={onLayoutChanged}
          >
            <Panel defaultSize="50%" id="foo" panelRef={panelRef} />
            <Panel id="bar" />
          </Group>
        </DomChecker>
      );

      // Default layout should not invoke change callbacks
      expect(onLayoutChange).not.toHaveBeenCalled();
      expect(onLayoutChanged).not.toHaveBeenCalled();

      expect(groupRef.current?.getLayout()).toMatchInlineSnapshot(`
        {
          "bar": 60,
          "foo": 40,
        }
      `);
    });
  });

  describe("groupRef", () => {
    test("should work with an empty Group", () => {
      const onLayoutChange = vi.fn();
      const groupRef = createRef<GroupImperativeHandle>();

      render(<Group groupRef={groupRef} onLayoutChange={onLayoutChange} />);

      const group = groupRef.current;

      assert(group !== null);
      expect(group.getLayout()).toEqual({});
      expect(onLayoutChange).not.toHaveBeenCalled();

      // This is meaningless but technically valid
      group.setLayout({});

      // This is still invalid
      expect(() =>
        group.setLayout({
          foo: 50,
          bar: 50
        })
      ).toThrow("Invalid 0 panel layout keys: foo, bar");
    });

    test("should work within a hidden subtree", () => {
      vi.useFakeTimers();

      // Note this test mimics the hidden subtree scenario by using a groupSize of 0
      setElementBoundsFunction(() => new DOMRect(0, 0, 0, 0));

      const onLayoutChange = vi.fn();
      const groupRef = createRef<GroupImperativeHandle>();

      render(
        <Group groupRef={groupRef} onLayoutChange={onLayoutChange}>
          <Panel defaultSize="35%" id="left" maxSize="45%">
            left
          </Panel>
          <Panel id="right">right</Panel>
        </Group>
      );

      const group = groupRef.current;

      assert(group !== null);
      expect(onLayoutChange).not.toHaveBeenCalled();

      // Size constraints can't really be validated while the Group is hidden
      expect(group.getLayout()).toEqual({});

      // This is essentially a no-op as well
      // Any values set at this point can't be validated and so they'll be overridden when the Group becomes visible
      group.setLayout({
        left: 45,
        right: 55
      });

      // Simulate the Group becoming visible; this should trigger default layout calculation
      setElementBoundsFunction((element) => {
        if (element.hasAttribute("data-panel")) {
          return new DOMRect(0, 0, 50, 50);
        } else {
          return new DOMRect(0, 0, 100, 50);
        }
      });

      vi.runOnlyPendingTimers();

      expect(group.getLayout()).toEqual({
        left: 35,
        right: 65
      });
      expect(onLayoutChange).toHaveBeenCalledWith({
        left: 35,
        right: 65
      });
    });

    // See github.com/bvaughn/react-resizable-panels/issues/576
    test("should allow layout to be read or written on mount", () => {
      setElementBoundsFunction((element) => {
        if (element.hasAttribute("data-panel")) {
          return new DOMRect(0, 0, 50, 50);
        } else {
          return new DOMRect(0, 0, 100, 50);
        }
      });

      function Repro() {
        const groupRef = useGroupRef();

        useEffect(() => {
          const group = groupRef.current;
          assert(group);

          expect(group.getLayout()).toEqual({
            left: 25,
            right: 75
          });

          // Should not throw
          group.setLayout({ left: 50, right: 50 });
        }, [groupRef]);

        return (
          <Group groupRef={groupRef}>
            <Panel defaultSize="25" id="left">
              Left
            </Panel>
            <Panel id="right">Right</Panel>
          </Group>
        );
      }

      render(<Repro />);
    });
  });

  describe("imperative API methods", () => {
    describe("setLayout", () => {
      test("notifies layout change handlers", () => {
        const ref = createRef<GroupImperativeHandle>();

        setElementBoundsFunction((element) => {
          if (element.hasAttribute("data-panel")) {
            return new DOMRect(0, 0, 50, 50);
          } else {
            return new DOMRect(0, 0, 100, 50);
          }
        });

        const onLayoutChange = vi.fn();
        const onLayoutChanged = vi.fn();

        render(
          <Group
            defaultLayout={{
              a: 50,
              b: 50
            }}
            disableCursor={false}
            groupRef={ref}
            onLayoutChange={onLayoutChange}
            onLayoutChanged={onLayoutChanged}
          >
            <Panel id="a" minSize="10%" />
            <Panel id="b" />
          </Group>
        );

        // Default layout
        expect(onLayoutChange).not.toHaveBeenCalled();
        expect(onLayoutChanged).not.toHaveBeenCalled();

        assert(ref.current);
        expect(ref.current.getLayout()).toMatchInlineSnapshot(`
          {
            "a": 50,
            "b": 50,
          }
        `);

        ref.current.setLayout({
          a: 0,
          b: 100
        });
        expect(ref.current.getLayout()).toMatchInlineSnapshot(`
          {
            "a": 10,
            "b": 90,
          }
        `);

        expect(onLayoutChange).toHaveBeenCalledTimes(1);
        expect(onLayoutChanged).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("onLayoutChange and onLayoutChanged", () => {
    beforeEach(() => {
      setElementBoundsFunction((element) => {
        if (element.hasAttribute("data-group")) {
          return new DOMRect(0, 0, 100, 50);
        } else if (element.hasAttribute("data-panel")) {
          return new DOMRect(0, 0, 50, 50);
        }
      });
    });

    test("should not be called before layout has been initialized", () => {
      const onLayoutChange = vi.fn();
      const onLayoutChanged = vi.fn();

      const { rerender } = render(
        <Group
          onLayoutChange={onLayoutChange}
          onLayoutChanged={onLayoutChanged}
        >
          <Panel id="a" />
          <Panel id="b" />
        </Group>
      );

      expect(onLayoutChange).toHaveBeenCalledTimes(1);
      expect(onLayoutChange).toHaveBeenCalledWith({
        a: 50,
        b: 50
      });

      expect(onLayoutChanged).toHaveBeenCalledTimes(1);
      expect(onLayoutChanged).toHaveBeenCalledWith({
        a: 50,
        b: 50
      });

      rerender(
        <Group
          onLayoutChange={onLayoutChange}
          onLayoutChanged={onLayoutChanged}
        >
          <Panel id="a" />
          <Panel id="b" />
        </Group>
      );

      expect(onLayoutChange).toHaveBeenCalledTimes(1);
      expect(onLayoutChanged).toHaveBeenCalledTimes(1);
    });

    test("should be called with default layout", () => {
      const onLayoutChange = vi.fn();
      const onLayoutChanged = vi.fn();

      const { rerender } = render(
        <Group
          onLayoutChange={onLayoutChange}
          onLayoutChanged={onLayoutChanged}
        >
          <Panel id="a" defaultSize={40} />
          <Panel id="b" />
        </Group>
      );

      expect(onLayoutChange).toHaveBeenCalledTimes(1);
      expect(onLayoutChange).toHaveBeenCalledWith({
        a: 40,
        b: 60
      });

      expect(onLayoutChanged).toHaveBeenCalledTimes(1);
      expect(onLayoutChanged).toHaveBeenCalledWith({
        a: 40,
        b: 60
      });

      rerender(
        <Group
          className="something"
          onLayoutChange={onLayoutChange}
          onLayoutChanged={onLayoutChanged}
        >
          <Panel id="a" defaultSize={40} />
          <Panel id="b" defaultSize={60} />
        </Group>
      );

      expect(onLayoutChange).toHaveBeenCalledTimes(1);
      expect(onLayoutChanged).toHaveBeenCalledTimes(1);
    });

    test("should be called when panels change", () => {
      const onLayoutChange = vi.fn();
      const onLayoutChanged = vi.fn();

      const { rerender } = render(
        <Group
          onLayoutChange={onLayoutChange}
          onLayoutChanged={onLayoutChanged}
        >
          <Panel id="a" />
          <Panel id="b" />
        </Group>
      );

      expect(onLayoutChange).toHaveBeenCalledTimes(1);
      expect(onLayoutChange).toHaveBeenCalledWith({
        a: 50,
        b: 50
      });

      expect(onLayoutChanged).toHaveBeenCalledTimes(1);
      expect(onLayoutChanged).toHaveBeenCalledWith({
        a: 50,
        b: 50
      });

      rerender(
        <Group
          onLayoutChange={onLayoutChange}
          onLayoutChanged={onLayoutChanged}
        >
          <Panel id="a" />
          <Panel id="b" />
          <Panel id="c" />
          <Panel id="d" />
        </Group>
      );

      expect(onLayoutChange).toHaveBeenCalledTimes(2);
      expect(onLayoutChange).toHaveBeenCalledWith({
        a: 25,
        b: 25,
        c: 25,
        d: 25
      });

      expect(onLayoutChanged).toHaveBeenCalledTimes(2);
      expect(onLayoutChanged).toHaveBeenCalledWith({
        a: 25,
        b: 25,
        c: 25,
        d: 25
      });
    });

    test("should be called once per layout change", async () => {
      setElementBoundsFunction((element) => {
        switch (element.id) {
          case "group": {
            return new DOMRect(0, 0, 110, 50);
          }
          case "leftPanel": {
            return new DOMRect(0, 0, 50, 50);
          }
          case "separator": {
            return new DOMRect(50, 0, 10, 50);
          }
          case "rightPanel": {
            return new DOMRect(60, 0, 50, 50);
          }
        }
      });

      const onLayoutChange = vi.fn();
      const onLayoutChanged = vi.fn();

      const groupRef = createRef<GroupImperativeHandle>();

      render(
        <Group
          groupRef={groupRef}
          id="group"
          onLayoutChange={onLayoutChange}
          onLayoutChanged={onLayoutChanged}
        >
          <Panel id="leftPanel" defaultSize={50} />
          <Separator id="separator" />
          <Panel id="rightPanel" defaultSize={50} />
        </Group>
      );

      expect(onLayoutChange).toHaveBeenCalledTimes(1);
      expect(onLayoutChange).toHaveBeenCalledWith({
        leftPanel: 50,
        rightPanel: 50
      });

      expect(onLayoutChanged).toHaveBeenCalledTimes(1);
      expect(onLayoutChanged).toHaveBeenCalledWith({
        leftPanel: 50,
        rightPanel: 50
      });

      onLayoutChange.mockReset();
      onLayoutChanged.mockReset();

      // Simulate a drag from the draggable element to the target area
      groupRef.current?.setLayout({ leftPanel: 75, rightPanel: 25 });

      expect(onLayoutChange).toHaveBeenCalledTimes(1);
      expect(onLayoutChange).toHaveBeenCalledWith({
        leftPanel: 75,
        rightPanel: 25
      });

      expect(onLayoutChanged).toHaveBeenCalledTimes(1);
      expect(onLayoutChanged).toHaveBeenCalledWith({
        leftPanel: 75,
        rightPanel: 25
      });

      onLayoutChange.mockReset();
      onLayoutChanged.mockReset();

      // No-op resize event
      groupRef.current?.setLayout({ leftPanel: 75, rightPanel: 25 });

      expect(onLayoutChange).not.toHaveBeenCalled();
      expect(onLayoutChanged).not.toHaveBeenCalled();
    });
  });

  describe("invariants", () => {
    test("duplicate panel ids", () => {
      // This is allowed
      render(
        <Group>
          <Panel id="foo" />
          <Separator id="foo" />
          <Panel id="bar" />
        </Group>
      );

      // This is not allowed
      expect(() =>
        render(
          <Group>
            <Panel id="foo" />
            <Panel id="foo" />
          </Group>
        )
      ).toThrow('Panel ids must be unique; id "foo" was used more than once');
    });

    test("duplicate separator ids", () => {
      expect(() =>
        render(
          <Group>
            <Panel id="left" />
            <Separator id="foo" />
            <Panel id="center" />
            <Separator id="foo" />
            <Panel id="right" />
          </Group>
        )
      ).toThrow(
        'Separator ids must be unique; id "foo" was used more than once'
      );
    });
  });

  describe("HTML attributes", () => {
    test("should expose explicit id and testid", () => {
      const { container } = render(<Group id="group" />);

      const group = container.querySelector("[data-group]");
      assert(group);

      expect(group.getAttribute("data-testid")).toBe("group");
      expect(group.getAttribute("id")).toBe("group");
    });

    test("should pass through ...rest attributes", () => {
      const { container } = render(<Group data-foo="abc" data-bar="123" />);

      const group = container.querySelector("[data-group]");
      assert(group);

      expect(group.getAttribute("data-foo")).toBe("abc");
      expect(group.getAttribute("data-bar")).toBe("123");
    });

    test("problematic styles should be suppressed", () => {
      const { container } = render(
        <Group
          style={{
            display: "block",
            flexDirection: "column",
            flexWrap: "wrap"
          }}
        />
      );

      const group = container.querySelector("[data-group]") as HTMLElement;

      expect(group.style.display).toBe("flex");
      expect(group.style.flexDirection).toBe("row");
      expect(group.style.flexWrap).toBe("nowrap");
    });
  });
});
