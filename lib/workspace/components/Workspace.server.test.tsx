import { act, useEffect, type ReactElement } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import type { TabNode, WorkspaceModel, WorkspaceProps } from "../types";
import { Workspace } from "./Workspace";

const model: WorkspaceModel<{ kind: string }> = {
  root: {
    children: [
      {
        id: "left",
        selectedId: "1",
        tabs: [
          { data: { kind: "docs" }, id: "1" },
          { data: { kind: "docs" }, id: "2" }
        ],
        type: "tabset"
      },
      {
        id: "right",
        tabs: [{ data: { kind: "editor" }, id: "3" }],
        type: "tabset"
      }
    ],
    id: "root",
    orientation: "horizontal",
    type: "split"
  },
  version: 1
};

let log: string[] = [];

function Content({ tab }: { tab: TabNode<{ kind: string }> }) {
  useEffect(() => {
    log.push(`mount ${tab.id}`);
    return () => {
      log.push(`unmount ${tab.id}`);
    };
  }, [tab.id]);

  return <div data-testid={`content-${tab.id}`}>content {tab.id}</div>;
}

function createWorkspace(
  props: Partial<WorkspaceProps<{ kind: string }>> = {}
): ReactElement {
  return (
    <Workspace<{ kind: string }>
      defaultModel={model}
      id="workspace"
      renderTabContent={(tab) => <Content tab={tab} />}
      classNames={{ tabContent: "content" }}
      {...props}
    />
  );
}

// Server-rendered HTML separates adjacent text with comments (e.g. "content <!-- -->1")
function hasContent(html: string, tabId: string) {
  return html.includes(`data-testid="content-${tabId}"`);
}

describe("Workspace server rendering", () => {
  let container: HTMLDivElement | null = null;

  // Testing Library normally configures this (but these tests render with React DOM directly)
  beforeAll(() => {
    (
      globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
  });

  afterAll(() => {
    delete (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean })
      .IS_REACT_ACT_ENVIRONMENT;
  });

  afterEach(() => {
    container?.remove();
    container = null;
    log = [];
  });

  test("does not render tab content on the server by default", () => {
    const html = renderToString(createWorkspace());

    expect(html).toContain('role="tab"');
    expect(hasContent(html, "1")).toBe(false);
  });

  test("renders the content of selected tabs that opt in", () => {
    let html = renderToString(
      createWorkspace({ serverRenderTabContent: true })
    );
    expect(hasContent(html, "1")).toBe(true);
    expect(hasContent(html, "3")).toBe(true);
    expect(hasContent(html, "2")).toBe(false);

    html = renderToString(
      createWorkspace({
        serverRenderTabContent: (tab) => tab.data.kind === "docs"
      })
    );
    expect(hasContent(html, "1")).toBe(true);
    expect(hasContent(html, "3")).toBe(false);
  });

  test("hydrates server-rendered content, then moves it into a portal", async () => {
    const element = createWorkspace({ serverRenderTabContent: true });

    container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.appendChild(container);

    const serverContent = container.querySelector('[data-testid="content-1"]');
    expect(serverContent?.closest("[data-tab-content]")).toHaveClass("content");

    await act(async () => {
      hydrateRoot(container!, element);
    });

    // The content is still shown, now within the element that moves between tabsets
    const content = container.querySelector('[data-testid="content-1"]')!;
    expect(content).not.toBe(serverContent);
    const panel = content.closest<HTMLElement>("[data-tab-content]")!;
    expect(panel).toHaveClass("content");
    const host = panel.parentElement!;
    expect(host.parentElement).toHaveAttribute("data-tab-panels");
    expect(host.style.display).toBe("contents");
    expect(container.querySelectorAll('[id="' + panel.id + '"]')).toHaveLength(
      1
    );

    // Server-rendered content is remounted once; other content is mounted once
    expect(log.filter((entry) => entry.endsWith(" 1"))).toEqual([
      "mount 1",
      "unmount 1",
      "mount 1"
    ]);
    expect(log.filter((entry) => entry.endsWith(" 2"))).toEqual(["mount 2"]);
  });

  test("hydrates a model without split and tabset ids", async () => {
    const element = createWorkspace({
      defaultModel: {
        root: {
          children: [
            { tabs: [{ data: { kind: "docs" }, id: "1" }], type: "tabset" },
            { tabs: [{ data: { kind: "docs" }, id: "2" }], type: "tabset" }
          ],
          orientation: "horizontal",
          type: "split"
        },
        version: 1
      }
    });

    container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.appendChild(container);

    const errors: unknown[] = [];
    await act(async () => {
      hydrateRoot(container!, element, {
        onRecoverableError: (error) => errors.push(error)
      });
    });

    expect(errors).toEqual([]);
    expect(
      Array.from(container.querySelectorAll("[data-tabset-id]"), (element) =>
        element.getAttribute("data-tabset-id")
      )
    ).toEqual(["tabset-0", "tabset-1"]);
  });

  test("has no effect when the workspace isn't server rendered", async () => {
    container = document.createElement("div");
    document.body.appendChild(container);

    await act(async () => {
      createRoot(container!).render(
        createWorkspace({ serverRenderTabContent: true })
      );
    });

    expect(container.querySelector('[data-testid="content-1"]')).not.toBeNull();
    expect(log.filter((entry) => entry.endsWith(" 1"))).toEqual(["mount 1"]);
  });
});
