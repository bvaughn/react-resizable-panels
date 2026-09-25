import { createElement, type ReactElement } from "react";
import type {
  CellProps,
  GridProps,
  GridlineProps,
  GroupProps,
  PanelProps,
  SeparatorProps
} from "react-resizable-panels";
import { Cell } from "../../components/Cell";
import { Grid } from "../../components/Grid";
import { Gridline } from "../../components/Gridline";
import { Clickable } from "../../../src/components/Clickable";
import { Container } from "../../../src/components/Container";
import { Dialog } from "../../components/Dialog";
import { DisplayModeToggle } from "../../../src/components/DisplayModeToggle";
import { Group } from "../../../src/components/Group";
import { Panel } from "../../../src/components/Panel";
import { PopupWindow } from "../../../src/components/PopupWindow";
import { Separator } from "../../../src/components/Separator";
import type {
  EncodedCellElement,
  EncodedClickableElement,
  EncodedContainerElement,
  EncodedDialogElement,
  EncodedDisplayModeToggleElement,
  EncodedElement,
  EncodedGridElement,
  EncodedGridlineElement,
  EncodedGroupElement,
  EncodedIFrameElement,
  EncodedPanelElement,
  EncodedPopupWindowElement,
  EncodedSeparatorElement,
  EncodedTextElement,
  TextProps
} from "./types";
import { IFrame } from "../../components/IFrame";

type Config = {
  gridProps?: Partial<GridProps>;
  groupProps?: Partial<GroupProps>;
  panelProps?: Partial<PanelProps>;
};

let key = 0;

export function decode(stringified: string, config: Config = {}) {
  const json = JSON.parse(stringified) as EncodedElement[];

  return decodeChildren(json, config);
}

function decodeChildren(
  children: EncodedElement[],
  config: Config
): ReactElement<unknown>[] {
  const elements: ReactElement<unknown>[] = [];

  children.forEach((current) => {
    if (!current) {
      return;
    }

    switch (current.type) {
      case "Cell": {
        elements.push(decodeCell(current, config));
        break;
      }
      case "Gridline": {
        elements.push(decodeGridline(current));
        break;
      }
      case "Grid": {
        elements.push(decodeGrid(current, config));
        break;
      }
      case "Clickable": {
        elements.push(decodeClickable(current));
        break;
      }
      case "Container": {
        elements.push(decodeContainer(current, config));
        break;
      }
      case "Dialog": {
        elements.push(decodeDialog(current, config));
        break;
      }
      case "DisplayModeToggle": {
        elements.push(decodeDisplayModeToggle(current, config));
        break;
      }
      case "Group": {
        elements.push(decodeGroup(current, config));
        break;
      }
      case "IFrame": {
        elements.push(decodeIFrame(current));
        break;
      }
      case "Panel": {
        elements.push(decodePanel(current, config));
        break;
      }
      case "PopupWindow": {
        elements.push(decodePopupWindow(current, config));
        break;
      }
      case "Separator": {
        elements.push(decodeSeparator(current));
        break;
      }
      case "Text": {
        elements.push(decodeText(current));
        break;
      }
      default: {
        console.warn("Could not decode type:", current);
      }
    }
  });

  return elements;
}

function decodeCell(
  json: EncodedCellElement,
  config: Config
): ReactElement<CellProps> {
  const { children, ...props } = json.props;

  return createElement(Cell, {
    key: ++key,
    ...props,
    children: children ? decodeChildren(children, config) : undefined
  });
}

function decodeGridline(
  json: EncodedGridlineElement
): ReactElement<GridlineProps> {
  return createElement(Gridline, {
    ...(json.props as GridlineProps),
    key: ++key
  });
}

function decodeGrid(
  json: EncodedGridElement,
  config: Config
): ReactElement<GridProps> {
  const { children, ...props } = json.props;

  return createElement(Grid, {
    key: ++key,
    ...props,
    ...config.gridProps,
    children: children ? decodeChildren(children, config) : undefined
  });
}

function decodeClickable(json: EncodedClickableElement): ReactElement<unknown> {
  return createElement(Clickable, {
    key: ++key,
    ...json.props
  });
}

function decodeContainer(
  json: EncodedContainerElement,
  config: Config
): ReactElement<unknown> {
  const { children, ...props } = json.props;

  return createElement(Container, {
    key: ++key,
    ...props,
    children: children ? decodeChildren(children, config) : undefined
  });
}

function decodeDialog(
  json: EncodedDialogElement,
  config: Config
): ReactElement<unknown> {
  const { children, ...props } = json.props;

  return createElement(Dialog, {
    key: ++key,
    ...props,
    children: children ? decodeChildren(children, config) : undefined
  });
}

function decodeDisplayModeToggle(
  json: EncodedDisplayModeToggleElement,
  config: Config
): ReactElement<unknown> {
  const { children, ...props } = json.props;

  return createElement(DisplayModeToggle, {
    key: ++key,
    ...props,
    children: children ? decodeChildren(children, config) : undefined
  });
}

function decodeGroup(
  json: EncodedGroupElement,
  config: Config
): ReactElement<PanelProps> {
  const { children, ...props } = json.props;

  return createElement(Group, {
    key: ++key,
    ...props,
    ...config.groupProps,
    children: children ? decodeChildren(children, config) : undefined
  });
}

function decodeIFrame(json: EncodedIFrameElement): ReactElement<PanelProps> {
  return createElement(IFrame, {
    key: ++key,
    ...json.props
  });
}

function decodePanel(
  json: EncodedPanelElement,
  config: Config
): ReactElement<PanelProps> {
  const { children, ...props } = json.props;

  return createElement(Panel, {
    key: ++key,
    ...props,
    ...config.panelProps,
    children: children ? decodeChildren(children, config) : undefined
  });
}

function decodePopupWindow(
  json: EncodedPopupWindowElement,
  config: Config
): ReactElement<unknown> {
  const { children, ...props } = json.props;

  return createElement(PopupWindow, {
    key: ++key,
    ...props,
    children: children ? decodeChildren(children, config) : undefined
  });
}

function decodeSeparator(
  json: EncodedSeparatorElement
): ReactElement<SeparatorProps> {
  return createElement(Separator, {
    key: ++key,
    ...json.props
  });
}

function decodeText(json: EncodedTextElement): ReactElement<TextProps> {
  return createElement("div", {
    key: ++key,
    ...json.props
  });
}
