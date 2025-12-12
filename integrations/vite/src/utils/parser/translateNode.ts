import type { JSXElementConstructor, ReactElement } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { attributesToProps } from "./attributesToProps";

export function translateNode(node: Node | null) {
  if (!node) {
    return undefined;
  } else if (node instanceof Text) {
    return node.textContent?.trim() ?? "";
  } else if (node instanceof HTMLElement) {
    const children = Array.from(node.childNodes)
      .map(translateNode)
      .filter(Boolean);

    const tagName = node.nodeName;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let type: JSXElementConstructor<any> | null = null;
    switch (tagName) {
      case "GROUP": {
        type = Group;
        break;
      }
      case "PANEL": {
        type = Panel;
        break;
      }
      case "SEPARATOR": {
        type = Separator;
        break;
      }
      default: {
        throw Error(`Unrecognized tagName "${tagName}"`);
      }
    }

    const { key, ...rest } = attributesToProps(node.attributes);

    const element: ReactElement = {
      type,
      key: (key ?? null) as ReactElement["key"],
      props: {
        children,
        ...rest
      }
    };

    return element;
  } else {
    throw Error("Unexpected node type");
  }
}
