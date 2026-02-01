"use client";

import { useImperativeHandle, useRef } from "react";
import { useMergedRefs } from "../../hooks/useMergedRefs";
import { GroupContext } from "./GroupContext";
import { useMutableGroup } from "./hooks/useMutableGroup";
import type { GroupProps } from "./types";

const DEFAULT_RESIZE_TARGET = {
  coarse: 20,
  fine: 10
};

/**
 * A Group wraps a set of resizable Panel components.
 * Group content can be resized _horizontally_ or _vertically_.
 *
 * Group elements always include the following attributes:
 *
 * ```html
 * <div data-group data-testid="group-id-prop" id="group-id-prop">
 * ```
 *
 * ℹ️ [Test id](https://testing-library.com/docs/queries/bytestid/) can be used to narrow selection when unit testing.
 */
export function Group({
  children,
  className,
  defaultLayout,
  disableCursor = false,
  disabled = false,
  elementRef: elementRefProp,
  groupRef,
  id: idProp,
  onLayoutChange,
  onLayoutChanged,
  orientation = "horizontal",
  resizeTargetMinimumSize = DEFAULT_RESIZE_TARGET,
  style,
  ...rest
}: GroupProps) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const mergedRef = useMergedRefs(elementRef, elementRefProp);

  const { group, id, imperativeHandle } = useMutableGroup({
    elementRef,
    defaultLayout,
    disableCursor,
    disabled,
    id: idProp,
    onLayoutChange,
    onLayoutChanged,
    orientation,
    resizeTargetMinimumSize
  });

  useImperativeHandle(groupRef, () => imperativeHandle, [imperativeHandle]);

  return (
    <GroupContext.Provider value={group}>
      <div
        {...rest}
        className={className}
        data-group
        data-testid={id}
        id={id}
        ref={mergedRef}
        style={{
          height: "100%",
          width: "100%",
          overflow: "hidden",
          ...style,
          display: "flex",
          flexDirection: orientation === "horizontal" ? "row" : "column",
          flexWrap: "nowrap"
        }}
      >
        {children}
      </div>
    </GroupContext.Provider>
  );
}

// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/displayName
Group.displayName = "Group";
