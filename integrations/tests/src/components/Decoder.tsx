"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { assert, Box } from "react-lib-tools";
import {
  useGroupCallbackRef,
  useGroupRef,
  usePanelCallbackRef,
  usePanelRef,
  type Layout,
  type PanelSize
} from "react-resizable-panels";
import { DebugData } from "../components/DebugData";
import { decode } from "../utils/serializer/decode";

export function Decoder({
  encoded,
  searchParams
}: {
  encoded: string;
  searchParams: URLSearchParams;
}) {
  const [group, setGroup] = useGroupCallbackRef();
  const groupRef = useGroupRef();
  const groupRefProp = searchParams.has("useGroupCallbackRef")
    ? setGroup
    : searchParams.has("useGroupRef")
      ? groupRef
      : undefined;

  const [panel, setPanel] = usePanelCallbackRef();
  const panelRef = usePanelRef();
  const panelRefProp = searchParams.has("usePanelCallbackRef")
    ? setPanel
    : searchParams.has("usePanelRef")
      ? panelRef
      : undefined;

  const stableCallbacksRef = useRef<{
    readGroupLayout: () => void;
    readPanelSize: () => void;
  }>({
    readGroupLayout: () => {},
    readPanelSize: () => {}
  });
  useLayoutEffect(() => {
    stableCallbacksRef.current.readGroupLayout = () => {
      const imperativeGroupApiLayout =
        group?.getLayout() ?? groupRef.current?.getLayout();
      if (imperativeGroupApiLayout) {
        setState((prevState) => ({ ...prevState, imperativeGroupApiLayout }));
      }
    };
    stableCallbacksRef.current.readPanelSize = () => {
      const imperativePanelApiSize =
        panel?.getSize() ?? panelRef.current?.getSize();
      if (imperativePanelApiSize) {
        setState((prevState) => ({ ...prevState, imperativePanelApiSize }));
      }
    };
  });

  const [state, setState] = useState<{
    imperativeGroupApiLayout: Layout | undefined;
    imperativePanelApiSize: PanelSize | undefined;
    layout: Layout;
    onLayoutCount: number;
    panels: {
      [id: number | string]: {
        onResizeCount: number;
        panelSize: PanelSize;
      };
    };
  }>({
    imperativeGroupApiLayout: undefined,
    imperativePanelApiSize: undefined,
    layout: {},
    onLayoutCount: 0,
    panels: {}
  });

  const children = useMemo(() => {
    if (!encoded) {
      return null;
    }

    const group = decode(encoded, {
      groupProps: {
        groupRef: groupRefProp,
        onLayoutChange: (layout) => {
          setTimeout(() => {
            stableCallbacksRef.current.readGroupLayout();
          }, 0);

          setState((prev) => ({
            ...prev,
            onLayoutCount: prev.onLayoutCount + 1,
            layout
          }));
        }
      },
      panelProps: {
        panelRef: panelRefProp,
        onResize: (panelSize, id, prevPanelSize) => {
          assert(id, "Panel id required");

          setTimeout(() => {
            stableCallbacksRef.current.readPanelSize();
          }, 0);

          setState((prev) => ({
            ...prev,
            panels: {
              ...prev.panels,
              [id]: {
                onResizeCount: (prev.panels[id]?.onResizeCount ?? 0) + 1,
                panelSize,
                prevPanelSize
              }
            }
          }));
        }
      }
    });

    return group;
  }, [encoded, groupRefProp, panelRefProp]);

  // Debugging
  // console.group("Decoder");
  // console.log(encoded);
  // console.log(children);
  // console.groupEnd();

  return (
    <Box direction="column" gap={2}>
      <div>{children}</div>
      <Box className="p-2 overflow-auto" direction="row" gap={2} wrap>
        {groupRefProp && (
          <DebugData
            data={{
              imperativeGroupApiLayout: state.imperativeGroupApiLayout
            }}
          />
        )}{" "}
        {panelRefProp && (
          <DebugData
            data={{
              imperativePanelApiSize: state.imperativePanelApiSize
            }}
          />
        )}
        <DebugData
          data={{
            layout: state.layout,
            onLayoutCount: state.onLayoutCount
          }}
        />
        {Array.from(Object.keys(state.panels)).map((panelId) => (
          <DebugData
            data={{
              panelId,
              ...state.panels[panelId]
            }}
            key={panelId}
          />
        ))}
      </Box>
    </Box>
  );
}
