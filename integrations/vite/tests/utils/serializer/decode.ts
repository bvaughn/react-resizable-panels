import { createElement } from "react";
import type { GroupProps } from "react-resizable-panels";
import { Group } from "../../../src/components/Group";
import { Panel } from "../../../src/components/Panel";
import { Separator } from "../../../src/components/Separator";
import type { Config, GroupJson, PanelJson, SeparatorJson } from "./types";

export function decode(stringified: string, config: Config = {}) {
  const json = JSON.parse(stringified) as GroupJson;

  return convertGroup(json, config);
}

function convertGroup(json: GroupJson, config: Config) {
  const { children, props } = json;

  const className =
    config.groupProps?.className ?? (props as GroupProps).className ?? "";

  return createElement(
    Group,
    {
      ...props,
      ...config.groupProps,
      className
    },
    ...children.map((child) => {
      switch (child.type) {
        case "Panel": {
          return convertPanel(child, config);
        }
        case "Separator": {
          return convertSeparator(child);
        }
      }
    })
  );
}

function convertPanel(json: PanelJson, config: Config) {
  return createElement(Panel, {
    ...json.props,
    ...config.panelProps
  });
}

function convertSeparator(json: SeparatorJson) {
  return createElement(Separator, json.props);
}
