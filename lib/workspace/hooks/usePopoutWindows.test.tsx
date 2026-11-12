import { act, render } from "@testing-library/react";
import { createRef, StrictMode, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { Workspace } from "../components/Workspace";
import type {
  PopoutWindows,
  PopoutWorkspaceProps,
  TabNode,
  UsePopoutWindowsOptions,
  WorkspaceImperativeHandle,
  WorkspaceModel
} from "../types";
import { usePopoutWindows } from "./usePopoutWindows";

type TabData = { label: string };

function tab(id: string): TabNode<TabData> {
  return { data: { label: id }, id, title: id };
}

function createModel(...tabIds: string[]): WorkspaceModel<TabData> {
  return {
    root: {
      id: "root",
      selectedId: tabIds[0],
      tabs: tabIds.map(tab),
      type: "tabset"
    },
    version: 1
  };
}

const RECT = { height: 300, screenX: 10.4, screenY: 20.6, width: 400 };

// jsdom doesn't open windows; each popup is a separate document, with the parts of a window the hook uses
type FakePopup = ReturnType<typeof createFakePopup>;
function createFakePopup() {
  const popupDocument = document.implementation.createHTMLDocument("popup");
  const events = new EventTarget();
  const popup = {
    addEventListener: events.addEventListener.bind(events),
    close: vi.fn(() => {
      popup.closed = true;
    }),
    closed: false,
    dispatchEvent: events.dispatchEvent.bind(events),
    document: popupDocument,
    innerHeight: 250,
    innerWidth: 350,
    removeEventListener: events.removeEventListener.bind(events),
    screenX: 100,
    screenY: 200
  };

  return popup;
}

describe("usePopoutWindows", () => {
  let popups: FakePopup[];
  let open: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    popups = [];
    open = vi.fn(() => {
      const popup = createFakePopup();
      popups.push(popup);
      return popup;
    });
    vi.spyOn(window, "open").mockImplementation(
      open as unknown as typeof window.open
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.head.innerHTML = "";
  });

  // Renders the hook; popouts render a placeholder (rather than a Workspace), and their props are recorded
  function renderHook(
    options: Partial<UsePopoutWindowsOptions<TabData>> = {},
    renderPopout?: (props: PopoutWorkspaceProps<TabData>) => ReactNode
  ) {
    const workspaceRef = createRef<WorkspaceImperativeHandle<TabData>>();
    const result: { current: PopoutWindows<TabData> | null } = {
      current: null
    };
    const props: PopoutWorkspaceProps<TabData>[] = [];

    function App() {
      const popouts = usePopoutWindows<TabData>({ workspaceRef, ...options });
      result.current = popouts;

      return (
        <>
          <Workspace<TabData>
            defaultModel={createModel("1", "2")}
            onTearOff={popouts.onTearOff}
            renderTabContent={(tab) => tab.data.label}
            workspaceRef={workspaceRef}
          />
          {popouts.render((popoutProps, popout) => {
            props.push(popoutProps);
            return (
              renderPopout?.(popoutProps) ?? (
                <div data-popout-id={popout.id}>popout</div>
              )
            );
          })}
        </>
      );
    }

    const rendered = render(<App />);

    return { ...rendered, popouts: result, props, workspaceRef };
  }

  function openPopout(
    popouts: { current: PopoutWindows<TabData> | null },
    model = createModel("popped")
  ) {
    let isOpened = false;
    act(() => {
      isOpened = popouts.current!.open(model, RECT);
    });
    return isOpened;
  }

  function getTabIds(workspaceRef: {
    current: WorkspaceImperativeHandle<TabData> | null;
  }) {
    const { root } = workspaceRef.current!.getModel();
    return root.type === "tabset" ? root.tabs.map(({ id }) => id) : [];
  }

  test("opens a popout window, and renders its content into it", () => {
    const onOpen = vi.fn();
    const { popouts, props } = renderHook({ onOpen });

    expect(openPopout(popouts)).toBe(true);
    expect(open).toHaveBeenCalledWith(
      "",
      "",
      "left=10,top=21,width=400,height=300"
    );

    const [popup] = popups;
    expect(popouts.current!.popouts).toHaveLength(1);
    const [popout] = popouts.current!.popouts;
    expect(popout!.window).toBe(popup);
    expect(popout!.container.ownerDocument).toBe(popup!.document);
    expect(popout!.container.parentElement).toBe(popup!.document.body);
    expect(popout!.container.textContent).toBe("popout");
    expect(onOpen).toHaveBeenCalledWith(popout);

    expect(props[props.length - 1]!.defaultModel.root).toMatchObject({
      tabs: [{ id: "popped" }]
    });
  });

  test("doesn't add a popout if the window is blocked", () => {
    open.mockImplementation(() => null);
    const { popouts } = renderHook();

    expect(openPopout(popouts)).toBe(false);
    expect(popouts.current!.popouts).toHaveLength(0);
  });

  test("copies the page's stylesheets into popout windows", () => {
    const style = document.createElement("style");
    document.head.append(style);
    style.sheet!.insertRule(".inserted { color: red; }");

    const { popouts } = renderHook();
    openPopout(popouts);
    expect(popups[0]!.document.head.innerHTML).toContain(".inserted");

    const noCopy = renderHook({ copyStyles: false });
    openPopout(noCopy.popouts);
    expect(popups[1]!.document.head.innerHTML).not.toContain(".inserted");
  });

  test("moves the tabs of a popout window the user closes back to the main workspace", () => {
    const { popouts, workspaceRef } = renderHook();
    openPopout(popouts, createModel("a", "b"));

    act(() => {
      popups[0]!.dispatchEvent(new Event("pagehide"));
    });
    expect(popouts.current!.popouts).toHaveLength(0);
    expect(getTabIds(workspaceRef)).toEqual(["1", "2", "a", "b"]);
    expect(popups[0]!.close).toHaveBeenCalled();
  });

  test("discards the tabs of a closed popout window, or passes its model to onClose", () => {
    const discarding = renderHook({ onClose: "discard" });
    openPopout(discarding.popouts);
    act(() => {
      popups[0]!.dispatchEvent(new Event("pagehide"));
    });
    expect(getTabIds(discarding.workspaceRef)).toEqual(["1", "2"]);
    discarding.unmount();

    const onClose = vi.fn();
    const custom = renderHook({ onClose });
    openPopout(custom.popouts);
    act(() => {
      popups[1]!.dispatchEvent(new Event("pagehide"));
    });
    expect(onClose).toHaveBeenCalledWith(
      expect.objectContaining({
        root: expect.objectContaining({ tabs: [tab("popped")] })
      })
    );
    expect(getTabIds(custom.workspaceRef)).toEqual(["1", "2"]);
  });

  test("closes a popout window once its last tab is moved out of it", () => {
    const onClose = vi.fn();
    const { popouts, props } = renderHook({ onClose });
    openPopout(popouts);

    const { onModelChanged } = props[props.length - 1]!;
    act(() => {
      onModelChanged(createModel("popped", "other"), {
        isUserInteraction: true,
        reason: "move"
      });
    });
    expect(popups[0]!.close).not.toHaveBeenCalled();

    act(() => {
      onModelChanged(createModel(), {
        isUserInteraction: true,
        reason: "transfer"
      });
    });
    expect(popups[0]!.close).toHaveBeenCalled();
    expect(popouts.current!.popouts).toHaveLength(0);
    expect(onClose).not.toHaveBeenCalled();
  });

  test("opens torn-off tabs in popout windows", () => {
    const { popouts } = renderHook();

    let result = false;
    act(() => {
      result = popouts.current!.onTearOff({
        model: createModel("torn"),
        tab: tab("torn"),
        type: "tab",
        ...RECT
      });
    });
    expect(result).toBe(true);
    expect(popouts.current!.popouts).toHaveLength(1);
  });

  test("closes popout windows (without moving their tabs) when the page is hidden, or the component unmounts", () => {
    const onClose = vi.fn();
    const onCloseAll = vi.fn();
    const { popouts, unmount } = renderHook({ onClose, onCloseAll });
    openPopout(popouts, createModel("a"));
    openPopout(popouts, createModel("b"));

    act(() => {
      window.dispatchEvent(new Event("pagehide"));
    });
    expect(onCloseAll).toHaveBeenCalledTimes(1);
    expect(onCloseAll).toHaveBeenCalledWith([
      {
        model: expect.objectContaining({
          root: expect.objectContaining({ tabs: [tab("a")] })
        }),
        rect: { height: 250, screenX: 100, screenY: 200, width: 350 }
      },
      expect.objectContaining({
        model: expect.objectContaining({
          root: expect.objectContaining({ tabs: [tab("b")] })
        })
      })
    ]);
    expect(popups.every((popup) => popup.close.mock.calls.length === 1)).toBe(
      true
    );
    expect(onClose).not.toHaveBeenCalled();

    // Pages hidden without popouts aren't reported
    act(() => {
      window.dispatchEvent(new Event("pagehide"));
    });
    expect(onCloseAll).toHaveBeenCalledTimes(1);

    openPopout(popouts, createModel("c"));
    unmount();
    expect(onCloseAll).toHaveBeenCalledTimes(2);
    expect(onCloseAll).toHaveBeenLastCalledWith([
      expect.objectContaining({
        model: expect.objectContaining({
          root: expect.objectContaining({ tabs: [tab("c")] })
        })
      })
    ]);
    expect(popups[2]!.close).toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  test("closes popout windows even if onCloseAll throws", () => {
    const { popouts } = renderHook({
      onCloseAll: () => {
        throw Error("fail");
      }
    });
    openPopout(popouts);
    // jsdom reports errors thrown by listeners to the window
    const onError = vi.fn((event: ErrorEvent) => event.preventDefault());
    window.addEventListener("error", onError);
    act(() => {
      window.dispatchEvent(new Event("pagehide"));
    });
    window.removeEventListener("error", onError);
    expect(onError).toHaveBeenCalled();
    expect(popups[0]!.close).toHaveBeenCalled();
  });

  test("doesn't open a window for a model without tabs", () => {
    const { popouts } = renderHook();
    expect(openPopout(popouts, createModel())).toBe(false);
    expect(open).not.toHaveBeenCalled();
  });

  test("closes the popout and rethrows if onOpen throws", () => {
    const { popouts } = renderHook({
      onOpen: () => {
        throw Error("fail");
      }
    });
    expect(() => openPopout(popouts)).toThrow("fail");
    expect(popups[0]!.close).toHaveBeenCalled();
    expect(popouts.current!.popouts).toHaveLength(0);
  });

  test("a pagehide after the popout closed (empty, or closeAll) doesn't dock it again", () => {
    const { popouts, props, workspaceRef } = renderHook();
    openPopout(popouts, createModel("a"));
    act(() => {
      props[props.length - 1]!.onModelChanged(createModel(), {
        isUserInteraction: true,
        reason: "transfer"
      });
    });
    act(() => {
      popups[0]!.dispatchEvent(new Event("pagehide"));
    });
    expect(getTabIds(workspaceRef)).toEqual(["1", "2"]);

    openPopout(popouts, createModel("b"));
    act(() => {
      popouts.current!.closeAll();
    });
    act(() => {
      popups[1]!.dispatchEvent(new Event("pagehide"));
    });
    expect(getTabIds(workspaceRef)).toEqual(["1", "2"]);
  });

  test("docks the changed model of a mounted popout Workspace, selecting only its selected tab", () => {
    const popoutRef = createRef<WorkspaceImperativeHandle<TabData>>();
    const { popouts, workspaceRef } = renderHook({}, (props) => (
      <Workspace<TabData>
        {...props}
        renderTabContent={(tab) => tab.data.label}
        workspaceRef={(handle) => {
          (props.workspaceRef as { current: unknown }).current = handle;
          (popoutRef as { current: unknown }).current = handle;
        }}
      />
    ));
    openPopout(popouts, createModel("a"));
    act(() => {
      popoutRef.current!.addTab(tab("b"));
    });

    act(() => {
      popups[0]!.dispatchEvent(new Event("pagehide"));
    });
    expect(getTabIds(workspaceRef)).toEqual(["1", "2", "a", "b"]);
    const { root } = workspaceRef.current!.getModel();
    expect(root).toMatchObject({ selectedId: "b" });
  });

  test("stops copying stylesheets once unmounted", async () => {
    const { popouts, unmount } = renderHook();
    openPopout(popouts);
    unmount();

    document.head.append(document.createElement("style"));
    await Promise.resolve();
    expect(popups[0]!.document.head.querySelectorAll("style")).toHaveLength(0);
  });

  test("works in StrictMode", () => {
    const workspaceRef = createRef<WorkspaceImperativeHandle<TabData>>();
    const result: { current: PopoutWindows<TabData> | null } = {
      current: null
    };
    function App() {
      const popouts = usePopoutWindows<TabData>({ workspaceRef });
      result.current = popouts;
      return (
        <>
          <Workspace<TabData>
            defaultModel={createModel("1")}
            renderTabContent={(tab) => tab.data.label}
            workspaceRef={workspaceRef}
          />
          {popouts.render(() => "popout")}
        </>
      );
    }
    render(
      <StrictMode>
        <App />
      </StrictMode>
    );

    openPopout(result);
    expect(result.current!.popouts).toHaveLength(1);
    expect(popups[0]!.close).not.toHaveBeenCalled();
    act(() => {
      popups[0]!.dispatchEvent(new Event("pagehide"));
    });
    expect(getTabIds(workspaceRef)).toEqual(["1", "popped"]);
  });

  test("getState reports each popout's current model and position", () => {
    const popoutRef = createRef<WorkspaceImperativeHandle<TabData>>();
    const { popouts } = renderHook({}, (props) => (
      <Workspace<TabData>
        {...props}
        renderTabContent={(tab) => tab.data.label}
        workspaceRef={(handle) => {
          (props.workspaceRef as { current: unknown }).current = handle;
          (popoutRef as { current: unknown }).current = handle;
        }}
      />
    ));
    openPopout(popouts, createModel("a"));

    act(() => {
      popoutRef.current!.addTab(tab("b"));
    });

    const [state] = popouts.current!.getState();
    expect(state!.rect).toEqual({
      height: 250,
      screenX: 100,
      screenY: 200,
      width: 350
    });
    expect(state!.model.root).toMatchObject({
      tabs: [{ id: "a" }, { id: "b" }]
    });
  });
});
