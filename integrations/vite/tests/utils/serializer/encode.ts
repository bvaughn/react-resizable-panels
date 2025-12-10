import { type ReactElement } from "react";
import {
  Panel,
  Separator,
  type GroupProps,
  type PanelProps,
  type SeparatorProps
} from "react-resizable-panels";
import type { GroupJson, PanelJson, SeparatorJson } from "./types";

export function encode(element: ReactElement<GroupProps>) {
  return JSON.stringify(encodeGroup(element));
}

function encodeGroup(element: ReactElement<GroupProps>): GroupJson {
  const { children, onLayoutChange: _, ...props } = element.props;

  return {
    type: "Group",
    children: (Array.isArray(children) ? children : [children])
      .map((child) => {
        switch (child.type) {
          case Panel: {
            return encodePanel(child as ReactElement<PanelProps>);
          }
          case Separator: {
            return encodeSeparator(child as ReactElement<SeparatorProps>);
          }
        }
      })
      .filter((current) => current !== undefined),
    props
  };
}

function encodePanel(element: ReactElement<PanelProps>): PanelJson {
  const { children: _, onResize: __, ...props } = element.props;

  return {
    type: "Panel",
    props
  };
}

function encodeSeparator(element: ReactElement<SeparatorProps>): SeparatorJson {
  const { children: _, ...props } = element.props;

  return {
    type: "Separator",
    props
  };
}
