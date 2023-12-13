import {
  Children,
  createElement,
  CSSProperties,
  Fragment,
  ReactElement,
  RefObject,
} from "react";
import {
  ImperativePanelGroupHandle,
  ImperativePanelHandle,
  Panel,
  PanelGroup,
  PanelGroupOnLayout,
  PanelGroupProps,
  PanelOnCollapse,
  PanelOnExpand,
  PanelOnResize,
  PanelProps,
  PanelResizeHandle,
  PanelResizeHandleOnDragging,
  PanelResizeHandleProps,
} from "react-resizable-panels";
import { ImperativeDebugLogHandle } from "../routes/examples/DebugLog";

type UrlPanel = {
  children: Array<string | UrlPanelGroup>;
  collapsedSize?: number;
  collapsible?: boolean;
  defaultSize?: number | null;
  id?: string | null;
  maxSize?: number | null;
  minSize?: number;
  order?: number | null;
  style?: CSSProperties;
  type: "UrlPanel";
};

type UrlPanelGroup = {
  autoSaveId?: string;
  children: Array<UrlPanel | UrlPanelResizeHandle>;
  direction: "horizontal" | "vertical";
  id?: string | null;
  keyboardResizeBy?: number | null;
  style?: CSSProperties;
  type: "UrlPanelGroup";
};

type UrlPanelResizeHandle = {
  disabled?: boolean;
  id?: string | null;
  style?: CSSProperties;
  type: "UrlPanelResizeHandle";
};

function isPanelElement(value: any): value is ReactElement<PanelProps> {
  return value?.type?.displayName === "forwardRef(Panel)";
}

function isPanelGroupElement(
  value: any
): value is ReactElement<PanelGroupProps> {
  return (
    value?.type?.displayName === "PanelGroup" ||
    value?.type?.displayName === "forwardRef(PanelGroup)"
  );
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
    collapsedSize: urlPanel.props.collapsedSize,
    collapsible: urlPanel.props.collapsible,
    defaultSize: urlPanel.props.defaultSize,
    id: urlPanel.props.id,
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
    autoSaveId: urlPanelGroup.props.autoSaveId ?? undefined,
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
    id: urlPanelGroup.props.id,
    keyboardResizeBy: urlPanelGroup.props.keyboardResizeBy,
    style: urlPanelGroup.props.style,
    type: "UrlPanelGroup",
  };
}

function UrlPanelResizeHandleToData(
  urlPanelResizeHandle: ReactElement<PanelResizeHandleProps>
): UrlPanelResizeHandle {
  return {
    disabled: urlPanelResizeHandle.props.disabled,
    id: urlPanelResizeHandle.props.id,
    style: urlPanelResizeHandle.props.style,
    type: "UrlPanelResizeHandle",
  };
}

function urlPanelToPanel(
  urlPanel: UrlPanel,
  debugLogRef: RefObject<ImperativeDebugLogHandle>,
  idToRefMapRef: RefObject<
    Map<string, ImperativePanelHandle | ImperativePanelGroupHandle>
  >,
  key?: any
): ReactElement {
  let onCollapse: PanelOnCollapse | undefined = undefined;
  let onExpand: PanelOnExpand | undefined = undefined;
  let onResize: PanelOnResize | undefined = undefined;

  const panelId = urlPanel.id;
  if (panelId) {
    onCollapse = () => {
      const debugLog = debugLogRef.current;
      if (debugLog) {
        debugLog.log({
          panelId,
          type: "onCollapse",
        });
      }
    };

    onExpand = () => {
      const debugLog = debugLogRef.current;
      if (debugLog) {
        debugLog.log({
          panelId,
          type: "onExpand",
        });
      }
    };

    onResize = (size: number) => {
      const debugLog = debugLogRef.current;
      if (debugLog) {
        debugLog.log({
          panelId,
          size,
          type: "onResize",
        });
      }
    };
  }

  const refSetter = (panel: ImperativePanelHandle | null) => {
    if (panel) {
      const id = panel.getId();
      const idToRefMap = idToRefMapRef.current!;
      idToRefMap.set(id, panel);
    }
  };

  return createElement(
    Panel,
    {
      className: "Panel",
      collapsedSize: urlPanel.collapsedSize,
      collapsible: urlPanel.collapsible,
      defaultSize: urlPanel.defaultSize ?? undefined,
      id: urlPanel.id ?? undefined,
      key,
      maxSize: urlPanel.maxSize ?? undefined,
      minSize: urlPanel.minSize,
      onCollapse,
      onExpand,
      onResize,
      order: urlPanel.order ?? undefined,
      ref: refSetter,
      style: urlPanel.style,
    },
    urlPanel.children.map((child, index) => {
      if (isUrlPanelGroup(child)) {
        return urlPanelGroupToPanelGroup(
          child,
          debugLogRef,
          idToRefMapRef,
          index
        );
      } else {
        return createElement(Fragment, { key: index }, child);
      }
    })
  );
}

export function urlPanelGroupToPanelGroup(
  urlPanelGroup: UrlPanelGroup,
  debugLogRef: RefObject<ImperativeDebugLogHandle>,
  idToRefMapRef: RefObject<
    Map<string, ImperativePanelHandle | ImperativePanelGroupHandle>
  >,
  key?: any
): ReactElement {
  let onLayout: PanelGroupOnLayout | undefined = undefined;

  const groupId = urlPanelGroup.id;
  if (groupId) {
    onLayout = (layout: number[]) => {
      const debugLog = debugLogRef.current;
      if (debugLog) {
        debugLog.log({ groupId, type: "onLayout", layout });
      }
    };
  }

  const refSetter = (panelGroup: ImperativePanelGroupHandle | null) => {
    if (panelGroup) {
      const id = panelGroup.getId();
      const idToRefMap = idToRefMapRef.current!;
      idToRefMap.set(id, panelGroup);
    }
  };

  return createElement(
    PanelGroup,
    {
      autoSaveId: urlPanelGroup.autoSaveId,
      className: "PanelGroup",
      direction: urlPanelGroup.direction,
      id: urlPanelGroup.id,
      key: key,
      keyboardResizeBy: urlPanelGroup.keyboardResizeBy,
      onLayout,
      ref: refSetter,
      style: urlPanelGroup.style,
    },
    urlPanelGroup.children.map((child, index) => {
      if (isUrlPanel(child)) {
        return urlPanelToPanel(child, debugLogRef, idToRefMapRef, index);
      } else if (isUrlPanelResizeHandle(child)) {
        return urlPanelResizeHandleToPanelResizeHandle(
          child,
          debugLogRef,
          index
        );
      } else {
        throw Error("Invalid child");
      }
    })
  );
}

function urlPanelResizeHandleToPanelResizeHandle(
  urlPanelResizeHandle: UrlPanelResizeHandle,
  debugLogRef: RefObject<ImperativeDebugLogHandle>,
  key?: any
): ReactElement {
  let onDragging: PanelResizeHandleOnDragging | undefined = undefined;
  const resizeHandleId = urlPanelResizeHandle.id;
  if (resizeHandleId) {
    onDragging = (isDragging: boolean) => {
      const debugLog = debugLogRef.current;
      if (debugLog) {
        debugLog.log({
          isDragging,
          resizeHandleId,
          type: "onDragging",
        });
      }
    };
  }

  return createElement(PanelResizeHandle, {
    className: "PanelResizeHandle",
    disabled: urlPanelResizeHandle.disabled,
    id: urlPanelResizeHandle.id,
    key,
    onDragging,
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
