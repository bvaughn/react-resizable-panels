import { isBrowser } from "#is-browser";
import { isDevelopment } from "#is-development";
import useIsomorphicLayoutEffect from "../hooks/useIsomorphicEffect";
import useUniqueId from "../hooks/useUniqueId";
import {
  ElementType,
  ForwardedRef,
  PropsWithChildren,
  createElement,
  forwardRef,
  useContext,
  useImperativeHandle,
  useRef,
} from "../vendor/react";
import { PanelGroupContext } from "./PanelGroupContext";
import { MixedSizes } from "./types";
import { calculateAvailablePanelSizeInPixels } from "./utils/dom/calculateAvailablePanelSizeInPixels";
import { getPercentageSizeFromMixedSizes } from "./utils/getPercentageSizeFromMixedSizes";

export type OnCollapse = () => void;
export type OnExpand = () => void;
export type OnResize = (
  mixedSizes: MixedSizes,
  prevMixedSizes: MixedSizes
) => void;

export type PanelCallbacks = {
  onCollapse?: OnCollapse;
  onExpand?: OnExpand;
  onResize?: OnResize;
};

export type PanelConstraints = {
  collapsedSizePercentage?: number | undefined;
  collapsedSizePixels?: number | undefined;
  collapsible?: boolean | undefined;
  defaultSizePercentage?: number | undefined;
  defaultSizePixels?: number | undefined;
  maxSizePercentage?: number | undefined;
  maxSizePixels?: number | undefined;
  minSizePercentage?: number | undefined;
  minSizePixels?: number | undefined;
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
  expand: () => void;
  getId(): string;
  getSize(): MixedSizes;
  resize: (size: Partial<MixedSizes>) => void;
};

export type PanelProps = PropsWithChildren<{
  className?: string;
  collapsedSizePercentage?: number | undefined;
  collapsedSizePixels?: number | undefined;
  collapsible?: boolean | undefined;
  defaultSizePercentage?: number | undefined;
  defaultSizePixels?: number | undefined;
  id?: string;
  maxSizePercentage?: number | undefined;
  maxSizePixels?: number | undefined;
  minSizePercentage?: number | undefined;
  minSizePixels?: number | undefined;
  onCollapse?: OnCollapse;
  onExpand?: OnExpand;
  onResize?: OnResize;
  order?: number;
  style?: object;
  tagName?: ElementType;
}>;

export function PanelWithForwardedRef({
  children,
  className: classNameFromProps = "",
  collapsedSizePercentage,
  collapsedSizePixels,
  collapsible,
  defaultSizePercentage,
  defaultSizePixels,
  forwardedRef,
  id: idFromProps,
  maxSizePercentage,
  maxSizePixels,
  minSizePercentage,
  minSizePixels,
  onCollapse,
  onExpand,
  onResize,
  order,
  style: styleFromProps,
  tagName: Type = "div",
}: PanelProps & {
  forwardedRef: ForwardedRef<ImperativePanelHandle>;
}) {
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
    isPanelCollapsed,
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
      collapsedSizePercentage,
      collapsedSizePixels,
      collapsible,
      defaultSizePercentage,
      defaultSizePixels,
      maxSizePercentage,
      maxSizePixels,
      minSizePercentage,
      minSizePixels,
    },
    id: panelId,
    idIsFromProps: idFromProps !== undefined,
    order,
  });

  const devWarningsRef = useRef<{
    didLogDefaultSizeWarning: boolean;
  }>({
    didLogDefaultSizeWarning: false,
  });

  // Normally we wouldn't log a warning during render,
  // but effects don't run on the server, so we can't do it there
  if (isDevelopment) {
    if (!devWarningsRef.current.didLogDefaultSizeWarning) {
      if (
        !isBrowser &&
        defaultSizePercentage == null &&
        defaultSizePixels == null
      ) {
        devWarningsRef.current.didLogDefaultSizeWarning = true;
        console.warn(
          `WARNING: Panel defaultSizePercentage or defaultSizePixels prop recommended to avoid layout shift after server rendering`
        );
      }
    }
  }

  useIsomorphicLayoutEffect(() => {
    const { callbacks, constraints } = panelDataRef.current;

    panelDataRef.current.id = panelId;
    panelDataRef.current.idIsFromProps = idFromProps !== undefined;
    panelDataRef.current.order = order;

    callbacks.onCollapse = onCollapse;
    callbacks.onExpand = onExpand;
    callbacks.onResize = onResize;

    constraints.collapsedSizePercentage = collapsedSizePercentage;
    constraints.collapsedSizePixels = collapsedSizePixels;
    constraints.collapsible = collapsible;
    constraints.defaultSizePercentage = defaultSizePercentage;
    constraints.defaultSizePixels = defaultSizePixels;
    constraints.maxSizePercentage = maxSizePercentage;
    constraints.maxSizePixels = maxSizePixels;
    constraints.minSizePercentage = minSizePercentage;
    constraints.minSizePixels = minSizePixels;
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
      expand: () => {
        expandPanel(panelDataRef.current);
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
      resize: (mixedSizes: Partial<MixedSizes>) => {
        resizePanel(panelDataRef.current, mixedSizes);
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

  const style = getPanelStyle(panelDataRef.current);

  return createElement(Type, {
    children,
    className: classNameFromProps,
    style: {
      ...style,
      ...styleFromProps,
    },

    // CSS selectors
    "data-panel": "",

    // e2e test attributes
    "data-panel-collapsible": isDevelopment
      ? collapsible || undefined
      : undefined,
    "data-panel-id": isDevelopment ? panelId : undefined,
    "data-panel-size": isDevelopment
      ? parseFloat("" + style.flexGrow).toFixed(1)
      : undefined,
  });
}

export const Panel = forwardRef<ImperativePanelHandle, PanelProps>(
  (props: PanelProps, ref: ForwardedRef<ImperativePanelHandle>) =>
    createElement(PanelWithForwardedRef, { ...props, forwardedRef: ref })
);

PanelWithForwardedRef.displayName = "Panel";
Panel.displayName = "forwardRef(Panel)";
