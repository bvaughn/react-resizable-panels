import { afterEach, describe, expect, test } from "vitest";
import type { WorkspaceModel } from "../types";
import { getDropTarget } from "./getDropTarget";

const model: WorkspaceModel = {
  root: {
    id: "tabset",
    selectedId: "1",
    tabs: [{ data: undefined, id: "1" }],
    type: "tabset"
  },
  version: 1
};

describe("getDropTarget", () => {
  let cleanup: (() => void) | undefined;

  afterEach(() => {
    cleanup?.();
    cleanup = undefined;
  });

  test("hit tests within a workspace's shadow root", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    cleanup = () => host.remove();

    const shadowRoot = host.attachShadow({ mode: "open" });
    shadowRoot.innerHTML = `
      <div data-workspace>
        <div data-tabset-id="tabset">
          <div data-tab-list></div>
          <div data-tab-panels></div>
        </div>
      </div>
    `;
    const rootElement =
      shadowRoot.querySelector<HTMLElement>("[data-workspace]")!;
    const tabList = shadowRoot.querySelector("[data-tab-list]")!;

    // The document reports the shadow host for points within its shadow root (elementFromPoint isn't implemented by jsdom)
    Object.assign(document, { elementFromPoint: () => host });
    Object.assign(shadowRoot, { elementFromPoint: () => tabList });
    const prevCleanup = cleanup;
    cleanup = () => {
      prevCleanup();
      // @ts-expect-error Not implemented by jsdom
      delete document.elementFromPoint;
    };

    expect(
      getDropTarget({
        clientX: 0,
        clientY: 0,
        model,
        rootElement,
        tabId: "2"
      })
    ).toEqual({ index: 0, tabsetId: "tabset" });
  });
});
