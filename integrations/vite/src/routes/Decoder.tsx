import { useMemo, useState } from "react";
import { assert, Box } from "react-lib-tools";
import type { Layout, PanelSize } from "react-resizable-panels";
import { useParams } from "react-router";
import { decode } from "../../tests/utils/serializer/decode";
import { DebugData } from "../components/DebugData";

export function Decoder() {
  const { encoded } = useParams();

  const [state, setState] = useState<{
    onLayoutCount: number;
    layout: Layout;
    panels: {
      [id: number | string]: {
        onResizeCount: number;
        panelSize: PanelSize;
      };
    };
  }>({
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
        onLayoutChange: (layout) => {
          setState((prev) => ({
            ...prev,
            onLayoutCount: prev.onLayoutCount + 1,
            layout
          }));
        }
      },
      panelProps: {
        onResize: (panelSize, id) => {
          assert(id, "Panel id required");

          setState((prev) => ({
            ...prev,
            panels: {
              ...prev.panels,
              [id]: {
                onResizeCount: prev.panels[id]?.onResizeCount ?? 1,
                panelSize
              }
            }
          }));
        }
      }
    });

    return group;
  }, [encoded]);

  // Debugging
  // console.group("Decoder");
  // console.log(encoded);
  // console.log(children);
  // console.groupEnd();

  return (
    <Box direction="column" gap={2}>
      <div>{children}</div>
      <Box className="p-2 overflow-auto" direction="row" gap={2} wrap>
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
