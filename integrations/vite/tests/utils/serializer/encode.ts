import { type ReactElement } from "react";
import {
  Panel,
  Separator,
  type GroupProps,
  type PanelProps,
  type SeparatorProps
} from "react-resizable-panels";
import type { GroupJson, PanelJson, SeparatorJson, TextJson } from "./types";

export function encode(element: ReactElement<GroupProps>) {
  const json = convertGroup(element);
  const stringified = JSON.stringify(json);

  return encodeURIComponent(stringified);
}

function convertGroup(element: ReactElement<GroupProps>): GroupJson {
  const { children, onLayoutChange: _, ...props } = element.props;

  return {
    type: "Group",
    children: (Array.isArray(children) ? children : [children])
      .map((child) => {
        switch (child.type) {
          case Panel: {
            return convertPanel(child as ReactElement<PanelProps>);
          }
          case Separator: {
            return convertSeparator(child as ReactElement<SeparatorProps>);
          }
          default: {
            if (typeof child.props.children === "string") {
              return convertTextChild({
                children: child.props.children,
                className: child.props.className
              });
            }
          }
        }
      })
      .filter((current) => current !== undefined),
    props
  };
}

function convertPanel(element: ReactElement<PanelProps>): PanelJson {
  const { children, onResize: __, ...props } = element.props;

  let group: GroupJson | undefined = undefined;
  if (children) {
    group = convertGroup(children as ReactElement<GroupProps>);
  }

  return {
    type: "Panel",
    props,
    children: group
  };
}

function convertSeparator(
  element: ReactElement<SeparatorProps>
): SeparatorJson {
  const { children: _, ...props } = element.props;

  return {
    type: "Separator",
    props
  };
}

function convertTextChild(props: {
  children: string;
  className?: string;
}): TextJson {
  return {
    type: "Text",
    props
  };
}
