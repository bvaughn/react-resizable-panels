import { renderHook as renderHookExternal } from "@testing-library/react";
import { createElement, createRef } from "react";
import { beforeEach, describe, expect, test } from "vitest";
import { MutableGroup } from "../../../state/MutableGroup";
import { MutableGroupForTest } from "../../../state/tests/MutableGroupForTest";
import { GroupContext } from "../../group/GroupContext";
import { useMutableSeparator } from "./useMutableSeparator";

type Params = Parameters<typeof useMutableSeparator>[0];

describe("useMutableSeparator", () => {
  let group: MutableGroup;

  function renderHook(initial: Partial<Params> = {}) {
    const elementRef = createRef<HTMLDivElement | null>();
    elementRef.current = document.createElement("div");

    return renderHookExternal(
      (updated: Partial<Params>) =>
        useMutableSeparator({
          elementRef,
          id: "separator",
          ...initial,
          ...updated
        }),
      {
        wrapper: ({ children }) =>
          createElement(
            GroupContext.Provider,
            {
              value: group
            },
            children
          )
      }
    );
  }

  beforeEach(() => {
    group = new MutableGroupForTest();
  });

  test("throws if rendered outside of a Group", () => {
    expect(() =>
      renderHookExternal(() =>
        useMutableSeparator({
          elementRef: createRef(),
          id: "separator"
        })
      )
    ).toThrow(
      "Group Context not found; did you render a Panel or Separator outside of a Group?"
    );
  });

  test("should recreate mutable Separator when id or (parent) Group change", () => {
    const { rerender, result } = renderHook({
      id: "one"
    });

    let separator = result.current.separator;

    rerender({
      id: "two"
    });
    expect(separator).not.toBe(result.current.separator);
    separator = result.current.separator;

    group = new MutableGroupForTest({ id: "group-two" });

    rerender({
      id: "two"
    });

    expect(separator).not.toBe(result.current.separator);
  });

  test("should schedule a re-render when the Separator state changes", () => {
    const { result } = renderHook();

    group.mount();

    const separator = result.current.separator;

    expect(separator.state).toBe("default");

    group.updateSeparatorState(separator, "hover");

    expect(separator.state).toBe("hover");
  });
});
