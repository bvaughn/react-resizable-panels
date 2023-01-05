import {
  Children,
  createElement,
  CSSProperties,
  Fragment,
  ReactElement,
} from "react";
import {
  Panel,
  PanelGroup,
  PanelGroupProps,
  PanelProps,
  PanelResizeHandle,
  PanelResizeHandleProps,
} from "react-resizable-panels";

type UrlPanel = {
  children: Array<string | UrlPanelGroup>;
  collapsible?: boolean;
  defaultSize?: number;
  maxSize?: number;
  minSize?: number;
  order?: number;
  style?: CSSProperties;
  type: "UrlPanel";
};

type UrlPanelGroup = {
  autoSaveId?: string;
  children: Array<UrlPanel | UrlPanelResizeHandle>;
  direction: "horizontal" | "vertical";
  style?: CSSProperties;
  type: "UrlPanelGroup";
};

type UrlPanelResizeHandle = {
  disabled?: boolean;
  style?: CSSProperties;
  type: "UrlPanelResizeHandle";
};

function isPanelElement(value: any): value is ReactElement<PanelProps> {
  return value?.type?.displayName === "forwardRef(Panel)";
}

function isPanelGroupElement(
  value: any
): value is ReactElement<PanelGroupProps> {
  return value?.type?.displayName === "PanelGroup";
}

function isPanelResizeHandleElement(
  value: any
): value is ReactElement<PanelResizeHandleProps> {
  return value?.type?.displayName === "PanelResizeHandle";
}

function isUrlPanel(value: any): value is UrlPanel {
  return value.type === "UrlPanel";
}

function isUrlPanelGroup(value: any): value is UrlPanelGroup {
  return value.type === "UrlPanelGroup";
}

function isUrlPanelResizeHandle(value: any): value is UrlPanelResizeHandle {
  return value.type === "UrlPanelResizeHandle";
}

export function UrlPanelGroupToEncodedString(
  urlPanelGroup: ReactElement<PanelGroupProps>
): string {
  const data = UrlPanelGroupToData(urlPanelGroup);
  const serializedData = JSON.stringify(data);
  const encodedData = encodeURIComponent(serializedData);

  return encodedData;
}

function UrlPanelToData(urlPanel: ReactElement<PanelProps>): UrlPanel {
  return {
    children: Children.toArray(urlPanel.props.children).map((child: any) => {
      if (isPanelGroupElement(child)) {
        return UrlPanelGroupToData(child);
      } else {
        return child;
      }
    }),
    collapsible: urlPanel.props.collapsible,
    defaultSize: urlPanel.props.defaultSize,
    maxSize: urlPanel.props.maxSize,
    minSize: urlPanel.props.minSize,
    order: urlPanel.props.order,
    style: urlPanel.props.style,
    type: "UrlPanel",
  };
}

function UrlPanelGroupToData(
  urlPanelGroup: ReactElement<PanelGroupProps>
): UrlPanelGroup {
  return {
    autoSaveId: urlPanelGroup.props.autoSaveId,
    children: Children.toArray(urlPanelGroup.props.children).map((child) => {
      if (isPanelElement(child)) {
        return UrlPanelToData(child);
      } else if (isPanelResizeHandleElement(child)) {
        return UrlPanelResizeHandleToData(child);
      } else {
        throw Error("Invalid child");
      }
    }),
    direction: urlPanelGroup.props.direction,
    style: urlPanelGroup.props.style,
    type: "UrlPanelGroup",
  };
}

function UrlPanelResizeHandleToData(
  urlPanelResizeHandle: ReactElement<PanelResizeHandleProps>
): UrlPanelResizeHandle {
  return {
    disabled: urlPanelResizeHandle.props.disabled,
    style: urlPanelResizeHandle.props.style,
    type: "UrlPanelResizeHandle",
  };
}

function urlPanelToPanel(urlPanel: UrlPanel, key?: any): ReactElement {
  return createElement(
    Panel,
    {
      collapsible: urlPanel.collapsible,
      defaultSize: urlPanel.defaultSize,
      key: key,
      maxSize: urlPanel.maxSize,
      minSize: urlPanel.minSize,
      order: urlPanel.order,
      style: urlPanel.style,
    },
    urlPanel.children.map((child, index) => {
      if (isUrlPanelGroup(child)) {
        return urlPanelGroupToPanelGroup(child, index);
      } else {
        return createElement(Fragment, { key: index }, child);
      }
    })
  );
}

export function urlPanelGroupToPanelGroup(
  urlPanelGroup: UrlPanelGroup,
  key?: any
): ReactElement {
  return createElement(
    PanelGroup,
    {
      autoSaveId: urlPanelGroup.autoSaveId,
      direction: urlPanelGroup.direction,
      key: key,
      style: urlPanelGroup.style,
    },
    urlPanelGroup.children.map((child, index) => {
      if (isUrlPanel(child)) {
        return urlPanelToPanel(child, index);
      } else if (isUrlPanelResizeHandle(child)) {
        return urlPanelResizeHandleToPanelResizeHandle(child, index);
      } else {
        throw Error("Invalid child");
      }
    })
  );
}

function urlPanelResizeHandleToPanelResizeHandle(
  urlPanelResizeHandle: UrlPanelResizeHandle,
  key?: any
): ReactElement {
  return createElement(PanelResizeHandle, {
    disabled: urlPanelResizeHandle.disabled,
    key,
    style: urlPanelResizeHandle.style,
  });
}

export function urlToUrlData(url: URL): UrlPanelGroup | null {
  const rawData = url.searchParams.get("urlPanelGroup");
  if (rawData) {
    try {
      const decodedData = decodeURIComponent(rawData);
      const parsedData = JSON.parse(decodedData);
      if (isUrlPanelGroup(parsedData)) {
        return parsedData;
      }
    } catch (error) {}
  }

  return null;
}
