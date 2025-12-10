import { createElement } from "react";
import type { GroupJson, PanelJson, SeparatorJson } from "./types";
import { Panel } from "../../../src/components/Panel";
import { Separator } from "../../../src/components/Separator";
import { Group } from "../../../src/components/Group";

export function decode(stringified: string) {
  const json = JSON.parse(stringified) as GroupJson;

  return convertGroup(json);
}

function convertGroup(json: GroupJson) {
  const { children, props } = json;
  return createElement(
    Group,
    props,
    ...children.map((child) => {
      switch (child.type) {
        case "Panel": {
          return convertPanel(child);
        }
        case "Separator": {
          return convertSeparator(child);
        }
      }
    })
  );
}

function convertPanel(json: PanelJson) {
  return createElement(Panel, json.props);
}

function convertSeparator(json: SeparatorJson) {
  return createElement(Separator, json.props);
}
