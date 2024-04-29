import { isBrowser } from "#is-browser";
import { isDevelopment } from "#is-development";
import { PanelGroupContext } from "./PanelGroupContext";
import useIsomorphicLayoutEffect from "./hooks/useIsomorphicEffect";
import useUniqueId from "./hooks/useUniqueId";
import {
  ForwardedRef,
  HTMLAttributes,
  PropsWithChildren,
  ReactElement,
  createElement,
  forwardRef,
  useContext,
  useImperativeHandle,
  useRef,
} from "./vendor/react";

export type PanelOnCollapse = () => void;
export type PanelOnExpand = () => void;
export type PanelOnResize = (
  size: number,
  prevSize: number | undefined
) => void;

export type PanelCallbacks = {
  onCollapse?: PanelOnCollapse;
  onExpand?: PanelOnExpand;
  onResize?: PanelOnResize;
};

export type PanelConstraints = {
  collapsedSize?: number | undefined;
  collapsible?: boolean | undefined;
  defaultSize?: number | undefined;
  maxSize?: number | undefined;
  minSize?: number | undefined;
};

export type PanelData = {
  callbacks: PanelCallbacks;
  constraints: PanelConstraints;
  id: string;
  idIsFromProps: boolean;
  order: number | undefined;
};

export type ImperativePanelHandle = {
  collapse: () => void;
  expand: (minSize?: number) => void;
  getId(): string;
  getSize(): number;
  isCollapsed: () => boolean;
  isExpanded: () => boolean;
  resize: (size: number) => void;
};

export type PanelProps = Omit<
  HTMLAttributes<keyof HTMLElementTagNameMap>,
  "id" | "onResize"
> &
  PropsWithChildren<{
    className?: string;
    collapsedSize?: number | undefined;
    collapsible?: boolean | undefined;
    defaultSize?: number | undefined;
    id?: string;
    maxSize?: number | undefined;
    minSize?: number | undefined;
    onCollapse?: PanelOnCollapse;
    onExpand?: PanelOnExpand;
    onResize?: PanelOnResize;
    order?: number;
    style?: object;
    tagName?: keyof HTMLElementTagNameMap;
  }>;

export function PanelWithForwardedRef({
  children,
  className: classNameFromProps = "",
  collapsedSize,
  collapsible,
  defaultSize,
  forwardedRef,
  id: idFromProps,
  maxSize,
  minSize,
  onCollapse,
  onExpand,
  onResize,
  order,
  style: styleFromProps,
  tagName: Type = "div",
  ...rest
}: PanelProps & {
  forwardedRef: ForwardedRef<ImperativePanelHandle>;
}): ReactElement {
  const context = useContext(PanelGroupContext);
  if (context === null) {
    throw Error(
      `Panel components must be rendered within a PanelGroup container`
    );
  }

  const {
    collapsePanel,
    expandPanel,
    getPanelSize,
    getPanelStyle,
    groupId,
    isPanelCollapsed,
    reevaluatePanelConstraints,
    registerPanel,
    resizePanel,
    unregisterPanel,
  } = context;

  const panelId = useUniqueId(idFromProps);

  const panelDataRef = useRef<PanelData>({
    callbacks: {
      onCollapse,
      onExpand,
      onResize,
    },
    constraints: {
      collapsedSize,
      collapsible,
      defaultSize,
      maxSize,
      minSize,
    },
    id: panelId,
    idIsFromProps: idFromProps !== undefined,
    order,
  });

  const devWarningsRef = useRef<{
    didLogMissingDefaultSizeWarning: boolean;
  }>({
    didLogMissingDefaultSizeWarning: false,
  });

  // Normally we wouldn't log a warning during render,
  // but effects don't run on the server, so we can't do it there
  if (isDevelopment) {
    if (!devWarningsRef.current.didLogMissingDefaultSizeWarning) {
      if (!isBrowser && defaultSize == null) {
        devWarningsRef.current.didLogMissingDefaultSizeWarning = true;
        console.warn(
          `WARNING: Panel defaultSize prop recommended to avoid layout shift after server rendering`
        );
      }
    }
  }

  useIsomorphicLayoutEffect(() => {
    const { callbacks, constraints } = panelDataRef.current;

    const prevConstraints = { ...constraints };

    panelDataRef.current.id = panelId;
    panelDataRef.current.idIsFromProps = idFromProps !== undefined;
    panelDataRef.current.order = order;

    callbacks.onCollapse = onCollapse;
    callbacks.onExpand = onExpand;
    callbacks.onResize = onResize;

    constraints.collapsedSize = collapsedSize;
    constraints.collapsible = collapsible;
    constraints.defaultSize = defaultSize;
    constraints.maxSize = maxSize;
    constraints.minSize = minSize;

    // If constraints have changed, we should revisit panel sizes.
    // This is uncommon but may happen if people are trying to implement pixel based constraints.
    if (
      prevConstraints.collapsedSize !== constraints.collapsedSize ||
      prevConstraints.collapsible !== constraints.collapsible ||
      prevConstraints.maxSize !== constraints.maxSize ||
      prevConstraints.minSize !== constraints.minSize
    ) {
      reevaluatePanelConstraints(panelDataRef.current, prevConstraints);
    }
  });

  useIsomorphicLayoutEffect(() => {
    const panelData = panelDataRef.current;

    registerPanel(panelData);

    return () => {
      unregisterPanel(panelData);
    };
  }, [order, panelId, registerPanel, unregisterPanel]);

  useImperativeHandle(
    forwardedRef,
    () => ({
      collapse: () => {
        collapsePanel(panelDataRef.current);
      },
      expand: (minSize?: number) => {
        expandPanel(panelDataRef.current, minSize);
      },
      getId() {
        return panelId;
      },
      getSize() {
        return getPanelSize(panelDataRef.current);
      },
      isCollapsed() {
        return isPanelCollapsed(panelDataRef.current);
      },
      isExpanded() {
        return !isPanelCollapsed(panelDataRef.current);
      },
      resize: (size: number) => {
        resizePanel(panelDataRef.current, size);
      },
    }),
    [
      collapsePanel,
      expandPanel,
      getPanelSize,
      isPanelCollapsed,
      panelId,
      resizePanel,
    ]
  );

  const style = getPanelStyle(panelDataRef.current, defaultSize);

  return createElement(Type, {
    ...rest,

    children,
    className: classNameFromProps,
    id: idFromProps,
    style: {
      ...style,
      ...styleFromProps,
    },

    // CSS selectors
    "data-panel": "",
    "data-panel-collapsible": collapsible || undefined,
    "data-panel-group-id": groupId,
    "data-panel-id": panelId,
    "data-panel-size": parseFloat("" + style.flexGrow).toFixed(1),
  });
}

export const Panel = forwardRef<ImperativePanelHandle, PanelProps>(
  (props: PanelProps, ref: ForwardedRef<ImperativePanelHandle>) =>
    createElement(PanelWithForwardedRef, { ...props, forwardedRef: ref })
);

PanelWithForwardedRef.displayName = "Panel";
Panel.displayName = "forwardRef(Panel)";
