import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject
} from "react";
import { createPortal } from "react-dom";
import { useIsomorphicLayoutEffect } from "../../shared/hooks/useIsomorphicLayoutEffect";
import { warnOnce } from "../../shared/utils/warnOnce";
import { getModelTabsets } from "../models/getModelTabsets";
import { normalizeWorkspaceModel } from "../models/normalizeWorkspaceModel";
import type {
  PopoutWindow,
  PopoutWindowRect,
  PopoutWindows,
  PopoutWorkspaceProps,
  UsePopoutWindowsOptions,
  WorkspaceImperativeHandle,
  WorkspaceModel,
  WorkspaceModelInput
} from "../types";
import { copyStyleSheets } from "../utils/copyStyleSheets";

type Entry<TabData, TabsetData> = {
  dispose: () => void;
  isClosed: boolean;
  // The popout's latest model, until its Workspace mounts (or after it unmounts)
  model: WorkspaceModel<TabData, TabsetData>;
  popout: PopoutWindow;
  props: PopoutWorkspaceProps<TabData, TabsetData>;
};

type CloseReason = "app" | "empty" | "user";

let nextPopoutId = 0;

/**
 * Opens tabs (and tabsets) in popout windows: when they're dropped outside of the window (see the Workspace's `onTearOff` prop),
 * or with the returned `open` function (e.g. from a button).
 * Each popout window shows its own Workspace, rendered by the returned `render` function.
 *
 * - The page's stylesheets are copied into each popout window (see `copyStyles`)
 * - When the user closes a popout window, its tabs are moved back to the main workspace (see `onClose`)
 * - A popout window is closed once its last tab is moved out of it (e.g. dragged back to the main window; see the Workspace's `dragGroup` prop)
 * - Popout windows are closed when the page that opened them is closed, or the component that uses this hook unmounts (since it renders their content); see `onCloseAll`
 */
export function usePopoutWindows<TabData = unknown, TabsetData = unknown>(
  options: UsePopoutWindowsOptions<TabData, TabsetData>
): PopoutWindows<TabData, TabsetData> {
  const optionsRef = useRef(options);
  useIsomorphicLayoutEffect(() => {
    optionsRef.current = options;
  });

  const [entries, setEntries] = useState<Entry<TabData, TabsetData>[]>([]);
  const entriesRef = useRef(new Map<string, Entry<TabData, TabsetData>>());

  const close = useCallback(
    (entry: Entry<TabData, TabsetData>, reason: CloseReason) => {
      if (entry.isClosed) {
        return;
      }
      entry.isClosed = true;
      entry.dispose();

      entriesRef.current.delete(entry.popout.id);
      setEntries((prev) => prev.filter((current) => current !== entry));

      if (reason === "user") {
        const { onClose = "dock", workspaceRef } = optionsRef.current;
        const model =
          entry.props.workspaceRef.current?.getModel() ?? entry.model;
        if (typeof onClose === "function") {
          onClose(model);
        } else if (onClose === "dock") {
          const main = workspaceRef.current;
          const mainModel = main?.getModel();
          const tabsets = getModelTabsets(model);
          const selectedId = tabsets.find(
            ({ selectedId }) => selectedId !== undefined
          )?.selectedId;
          for (const tabset of tabsets) {
            for (const tab of tabset.tabs) {
              if (!main) {
                if (process.env.NODE_ENV !== "production") {
                  warnOnce(
                    "usePopoutWindows: the workspaceRef is not set, so the tabs of a closed popout window can't be docked"
                  );
                }
              } else if (
                getModelTabsets(mainModel!).some(({ tabs }) =>
                  tabs.some(({ id }) => id === tab.id)
                ) ||
                !main.addTab(tab, { select: tab.id === selectedId })
              ) {
                if (process.env.NODE_ENV !== "production") {
                  warnOnce(
                    `usePopoutWindows: a popout window's tab "${tab.id}" wasn't docked because the main workspace could not add it (e.g. a tab with the same id already exists)`
                  );
                }
              }
            }
          }
        }
      }

      if (!entry.popout.window.closed) {
        entry.popout.window.close();
      }
    },
    []
  );

  const closeAll = useCallback(() => {
    for (const entry of Array.from(entriesRef.current.values())) {
      close(entry, "app");
    }
  }, [close]);

  const getState = useCallback(
    () =>
      Array.from(entriesRef.current.values(), (entry) => ({
        model: entry.props.workspaceRef.current?.getModel() ?? entry.model,
        rect: {
          height: entry.popout.window.innerHeight,
          screenX: entry.popout.window.screenX,
          screenY: entry.popout.window.screenY,
          width: entry.popout.window.innerWidth
        }
      })),
    []
  );

  // Popout windows' content is rendered by this component, so they're closed along with it (or the page that opened them)
  useEffect(() => {
    const reportAndCloseAll = () => {
      try {
        if (entriesRef.current.size > 0) {
          optionsRef.current.onCloseAll?.(getState());
        }
      } finally {
        closeAll();
      }
    };

    window.addEventListener("pagehide", reportAndCloseAll);
    return () => {
      window.removeEventListener("pagehide", reportAndCloseAll);
      reportAndCloseAll();
    };
  }, [closeAll, getState]);

  const open = useCallback(
    (
      model: WorkspaceModelInput<TabData, TabsetData>,
      rect: PopoutWindowRect
    ) => {
      const normalizedModel = normalizeWorkspaceModel<TabData, TabsetData>(
        model
      );
      if (
        !normalizedModel ||
        getModelTabsets(normalizedModel).every(({ tabs }) => !tabs.length)
      ) {
        return false;
      }

      const popup = window.open(
        "",
        "",
        [
          `left=${Math.round(rect.screenX)}`,
          `top=${Math.round(rect.screenY)}`,
          `width=${Math.round(rect.width)}`,
          `height=${Math.round(rect.height)}`
        ].join(",")
      );
      if (!popup) {
        return false;
      }

      const { copyStyles = true, onOpen } = optionsRef.current;
      const stopCopyingStyles = copyStyles
        ? copyStyleSheets(document, popup.document)
        : () => {};

      const container = popup.document.createElement("div");
      popup.document.body.append(container);

      const entry: Entry<TabData, TabsetData> = {
        dispose: () => {
          stopCopyingStyles();
          popup.removeEventListener("pagehide", onPageHide);
        },
        isClosed: false,
        model: normalizedModel,
        popout: { container, id: `popout-${nextPopoutId++}`, window: popup },
        props: {
          defaultModel: normalizedModel,
          onModelChanged: (nextModel) => {
            entry.model = nextModel;
            if (getModelTabsets(nextModel).every(({ tabs }) => !tabs.length)) {
              close(entry, "empty");
            }
          },
          workspaceRef: {
            current: null
          } as RefObject<WorkspaceImperativeHandle<TabData, TabsetData> | null>
        }
      };

      const onPageHide = () => close(entry, "user");
      popup.addEventListener("pagehide", onPageHide);

      entriesRef.current.set(entry.popout.id, entry);
      setEntries((prev) => [...prev, entry]);

      try {
        onOpen?.(entry.popout);
      } catch (error) {
        close(entry, "app");
        throw error;
      }

      return true;
    },
    [close]
  );

  return useMemo(
    () => ({
      closeAll,
      getState,
      onTearOff: ({ model, ...rect }) => open(model, rect),
      open,
      popouts: entries.map(({ popout }) => popout),
      render: (renderWorkspace) =>
        entries.map(({ popout, props }) =>
          createPortal(
            renderWorkspace(props, popout),
            popout.container,
            popout.id
          )
        )
    }),
    [closeAll, entries, getState, open]
  );
}
