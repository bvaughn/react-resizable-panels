import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  createRef,
  useEffect,
  useLayoutEffect,
  useRef,
  type PropsWithChildren,
  type RefObject
} from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { eventEmitter } from "../../global/mutableState";
import { moveSeparator } from "../../global/test/moveSeparator";
import { assert } from "../../utils/assert";
import {
  setDefaultElementBounds,
  setElementBoundsFunction
} from "../../utils/test/mockBoundingClientRect";
import { Panel } from "../panel/Panel";
import type { PanelImperativeHandle } from "../panel/types";
import { Separator } from "../separator/Separator";
import { Group } from "./Group";
import type { GroupImperativeHandle, Layout } from "./types";
import { useGroupRef } from "./useGroupRef";

describe("Group", () => {
  test("changes to defaultProps or disableCursor should not cause Group to remount", () => {
    const onMountedGroupsChange = vi.fn();
    const removeListener = eventEmitter.addListener(
      "mountedGroupsChange",
      onMountedGroupsChange
    );

    const { rerender } = render(
      <Group
        defaultLayout={{
          a: 50,
          b: 50
        }}
        disableCursor={false}
      >
        <Panel id="a" />
        <Panel id="b" />
      </Group>
    );
    expect(onMountedGroupsChange).toHaveBeenCalled();

    onMountedGroupsChange.mockReset();

    rerender(
      <Group
        defaultLayout={{
          a: 35,
          b: 65
        }}
        disableCursor={true}
      >
        <Panel id="a" />
        <Panel id="b" />
      </Group>
    );
    expect(onMountedGroupsChange).not.toHaveBeenCalled();

    removeListener();
  });

  test("should support updates to either Group or Panel ids", () => {
    const { rerender } = render(
      <Group id="a">
        <Panel id="a-a" />
        <Panel id="a-b" />
      </Group>
    );

    rerender(
      <Group id="a">
        <Panel id="b-a" />
        <Panel id="b-b" />
      </Group>
    );

    rerender(
      <Group id="b">
        <Panel id="b-a" />
        <Panel id="b-b" />
      </Group>
    );

    rerender(
      <Group id="c">
        <Panel id="c-a" />
        <Panel id="c-b" />
      </Group>
    );
  });

  describe("in-memory layout cache", () => {
    async function runTest(
      callback: (args: {
        container: HTMLElement;
        groupRef: RefObject<GroupImperativeHandle | null>;
        panelRef: RefObject<PanelImperativeHandle | null>;
      }) => Promise<void>,
      expectedLayout: Layout
    ) {
      setElementBoundsFunction((element) => {
        switch (element.id) {
          case "group": {
            return new DOMRect(0, 0, 100, 50);
          }
          case "left": {
            return new DOMRect(0, 0, 50, 50);
          }
          case "right": {
            return new DOMRect(50, 0, 50, 50);
          }
          case "separator": {
            return new DOMRect(50, 0, 0, 50);
          }
        }
      });

      const onLayoutChanged = vi.fn();

      const groupRef = createRef<GroupImperativeHandle>();
      const panelRef = createRef<PanelImperativeHandle>();

      const { container, rerender } = render(
        <Group groupRef={groupRef} onLayoutChanged={onLayoutChanged}>
          <Panel id="left" panelRef={panelRef} />
          <Separator id="separator" />
          <Panel id="right" />
        </Group>
      );

      expect(onLayoutChanged).toHaveBeenCalledTimes(1);
      expect(onLayoutChanged).toHaveBeenLastCalledWith({
        left: 50,
        right: 50
      });

      await callback({ container, groupRef, panelRef });

      expect(onLayoutChanged).toHaveBeenCalledTimes(2);
      expect(onLayoutChanged).toHaveBeenLastCalledWith(expectedLayout);

      rerender(
        <Group groupRef={groupRef} onLayoutChanged={onLayoutChanged}>
          <Panel id="right" />
        </Group>
      );

      expect(onLayoutChanged).toHaveBeenCalledTimes(3);
      expect(onLayoutChanged).toHaveBeenLastCalledWith({ right: 100 });

      rerender(
        <Group groupRef={groupRef} onLayoutChanged={onLayoutChanged}>
          <Panel id="left" panelRef={panelRef} />
          <Separator id="separator" />
          <Panel id="right" />
        </Group>
      );

      expect(onLayoutChanged).toHaveBeenCalledTimes(4);
      expect(onLayoutChanged).toHaveBeenLastCalledWith(expectedLayout);
    }

    test("should update when resized via pointer", async () => {
      await runTest(
        async () => {
          await moveSeparator(10, "separator");
        },
        {
          left: 60,
          right: 40
        }
      );
    });

    test("should update when resized via keyboard", async () => {
      await runTest(
        async ({ container }) => {
          const separator = container.querySelector("#separator")!;
          await userEvent.type(separator, " {ArrowRight}");
        },
        {
          left: 55,
          right: 45
        }
      );
    });

    test("should update when resized via Group imperative API", async () => {
      await runTest(
        async ({ groupRef }) => {
          groupRef.current?.setLayout({
            left: 75,
            right: 25
          });
        },
        {
          left: 75,
          right: 25
        }
      );
    });

    test("should update when resized via Panel imperative API", async () => {
      await runTest(
        async ({ panelRef }) => {
          panelRef.current?.resize(35);
        },
        {
          left: 35,
          right: 65
        }
      );
    });
  });

  describe("defaultLayout", () => {
    test("should be ignored if it does not match Panel ids", () => {
      const onLayoutChange = vi.fn();

      setDefaultElementBounds(new DOMRect(0, 0, 100, 50));

      render(
        <Group
          defaultLayout={{
            top: 40,
            bottom: 60
          }}
          onLayoutChange={onLayoutChange}
        >
          <Panel id="left" />
          <Panel id="right" />
        </Group>
      );

      expect(onLayoutChange).toHaveBeenCalledTimes(1);
      expect(onLayoutChange).toHaveBeenCalledWith({
        left: 50,
        right: 50
      });
    });

    test("should be ignored if it does not match Panel ids (mounted within hidden subtree)", () => {
      const onLayoutChange = vi.fn();

      render(
        <Group
          defaultLayout={{
            top: 40,
            bottom: 60
          }}
          onLayoutChange={onLayoutChange}
        >
          <Panel id="left" />
          <Panel id="right" />
        </Group>
      );

      expect(onLayoutChange).not.toHaveBeenCalled();

      setDefaultElementBounds(new DOMRect(0, 0, 100, 50));

      expect(onLayoutChange).toHaveBeenCalledTimes(1);
      expect(onLayoutChange).toHaveBeenCalledWith({
        left: 50,
        right: 50
      });
    });

    describe("should not break the layout if layout Panel ids are in an unexpected order", () => {
      test("two panel horizontal group", async () => {
        const onLayoutChanged = vi.fn();

        setElementBoundsFunction((element) => {
          switch (element.id) {
            case "group": {
              return new DOMRect(0, 0, 100, 50);
            }
            case "left": {
              return new DOMRect(0, 0, 50, 50);
            }
            case "right": {
              return new DOMRect(50, 0, 50, 50);
            }
            case "separator": {
              return new DOMRect(50, 0, 0, 50);
            }
          }
        });

        render(
          <Group
            defaultLayout={{
              right: 40,
              left: 60
            }}
            id="group"
            onLayoutChanged={onLayoutChanged}
          >
            <Panel id="left" />
            <Separator id="separator" />
            <Panel id="right" />
          </Group>
        );

        expect(onLayoutChanged).toHaveBeenCalledTimes(1);
        expect(onLayoutChanged).toHaveBeenCalledWith({
          left: 60,
          right: 40
        });

        // Simulate a drag from the draggable element to the target area
        await moveSeparator(10);

        expect(onLayoutChanged).toHaveBeenCalledTimes(2);
        expect(onLayoutChanged).toHaveBeenCalledWith({
          left: 70,
          right: 30
        });
      });

      test("three panel vertical group", async () => {
        const onLayoutChanged = vi.fn();

        setElementBoundsFunction((element) => {
          switch (element.id) {
            case "group": {
              return new DOMRect(0, 0, 50, 150);
            }
            case "top": {
              return new DOMRect(0, 0, 50, 50);
            }
            case "top-separator": {
              return new DOMRect(0, 50, 0, 50);
            }
            case "middle": {
              return new DOMRect(0, 50, 50, 50);
            }
            case "bottom": {
              return new DOMRect(0, 100, 50, 50);
            }
            case "bottom-separator": {
              return new DOMRect(0, 100, 0, 50);
            }
          }
        });

        render(
          <Group
            defaultLayout={{
              bottom: 50,
              middle: 30,
              top: 20
            }}
            onLayoutChanged={onLayoutChanged}
            orientation="vertical"
          >
            <Panel id="top" defaultSize="30%" />
            <Separator id="top-separator" />
            <Panel id="middle" />
            <Separator id="bottom-separator" />
            <Panel id="bottom" defaultSize="30%" />
          </Group>
        );

        expect(onLayoutChanged).toHaveBeenCalledTimes(1);
        expect(onLayoutChanged).toHaveBeenCalledWith({
          bottom: 50,
          middle: 30,
          top: 20
        });

        // Simulate a drag from the draggable element to the target area
        await moveSeparator(15, "top-separator");

        expect(onLayoutChanged).toHaveBeenCalledTimes(2);
        expect(onLayoutChanged).toHaveBeenCalledWith({
          bottom: 50,
          middle: 20,
          top: 30
        });
      });
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
          >
            <Panel defaultSize="50%" id="foo" panelRef={panelRef} />
            <Panel id="bar" />
          </Group>
        </DomChecker>
      );

      expect(onLayoutChange).toHaveBeenCalledTimes(1);
      expect(onLayoutChange).toHaveBeenCalledWith({ foo: 40, bar: 60 });
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
      ).toThrow("Invalid 0 panel layout: 50%, 50%");
    });

    test("should work within a hidden subtree", () => {
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
          case "a": {
            return new DOMRect(0, 0, 50, 50);
          }
          case "b": {
            return new DOMRect(50, 0, 10, 50);
          }
          case "c": {
            return new DOMRect(60, 0, 50, 50);
          }
        }
      });

      const onLayoutChange = vi.fn();
      const onLayoutChanged = vi.fn();

      render(
        <Group
          onLayoutChange={onLayoutChange}
          onLayoutChanged={onLayoutChanged}
        >
          <Panel id="a" defaultSize={50} />
          <Separator id="b" />
          <Panel id="c" defaultSize={50} />
        </Group>
      );

      expect(onLayoutChange).toHaveBeenCalledTimes(1);
      expect(onLayoutChange).toHaveBeenCalledWith({
        a: 50,
        c: 50
      });

      expect(onLayoutChanged).toHaveBeenCalledTimes(1);
      expect(onLayoutChanged).toHaveBeenCalledWith({
        a: 50,
        c: 50
      });

      onLayoutChange.mockReset();
      onLayoutChanged.mockReset();

      // Simulate a drag from the draggable element to the target area
      await moveSeparator(25);

      expect(onLayoutChange).toHaveBeenCalledTimes(1);
      expect(onLayoutChange).toHaveBeenCalledWith({
        a: 75,
        c: 25
      });

      expect(onLayoutChanged).toHaveBeenCalledTimes(1);
      expect(onLayoutChanged).toHaveBeenCalledWith({
        a: 75,
        c: 25
      });

      onLayoutChange.mockReset();
      onLayoutChanged.mockReset();

      // Move the pointer a bit, but not enough to impact the layout
      await moveSeparator(0.0001);

      expect(onLayoutChange).not.toHaveBeenCalled();
      expect(onLayoutChanged).not.toHaveBeenCalled();
    });

    test("should be called in response to imperative API", async () => {
      const onLayoutChange = vi.fn();
      const onLayoutChanged = vi.fn();

      const groupRef = createRef<GroupImperativeHandle>();

      const { rerender } = render(
        <Group
          groupRef={groupRef}
          onLayoutChange={onLayoutChange}
          onLayoutChanged={onLayoutChanged}
        >
          <Panel id="a" />
          <Panel id="b" />
        </Group>
      );

      onLayoutChange.mockReset();
      onLayoutChanged.mockReset();

      groupRef.current?.setLayout({ a: 25, b: 75 });

      expect(onLayoutChange).toHaveBeenCalledTimes(1);
      expect(onLayoutChange).toHaveBeenCalledWith({
        a: 25,
        b: 75
      });

      expect(onLayoutChanged).toHaveBeenCalledTimes(1);
      expect(onLayoutChanged).toHaveBeenCalledWith({
        a: 25,
        b: 75
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
