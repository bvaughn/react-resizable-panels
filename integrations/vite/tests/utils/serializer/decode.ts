import { createElement } from "react";
import type { GroupJson, PanelJson, SeparatorJson } from "./types";
import { Panel } from "../../../src/components/Panel";
import { Separator } from "../../../src/components/Separator";
import { Group } from "../../../src/components/Group";

export function decode(encoded: string) {
  return decodeGroup(JSON.parse(encoded) as GroupJson);
}

function decodeGroup(json: GroupJson) {
  const { children, props } = json;
  return createElement(
    Group,
    props,
    ...children.map((child) => {
      switch (child.type) {
        case "Panel": {
          return decodePanel(child);
        }
        case "Separator": {
          return decodeSeparator(child);
        }
      }
    })
  );
}

function decodePanel(json: PanelJson) {
  return createElement(Panel, json.props);
}

function decodeSeparator(json: SeparatorJson) {
  return createElement(Separator, json.props);
}
