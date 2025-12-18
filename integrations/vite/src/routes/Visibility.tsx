import { Activity as ReactActivity, useMemo, useState } from "react";
import type { Layout } from "react-resizable-panels";
import { useParams } from "react-router";
import { Box } from "../../../../src/components/Box";
import { decode } from "../../tests/utils/serializer/decode";
import { DebugData } from "../components/DebugData";

export function Visibility() {
  const { default: defaultValue, encoded, mode } = useParams();

  const [hidden, setHidden] = useState(defaultValue === "hidden");

  const [state, setState] = useState<{
    onLayoutCount: number;
    layout: Layout;
  }>({
    layout: {},
    onLayoutCount: 0
  });

  const children = useMemo(() => {
    if (!encoded) {
      return null;
    }

    const group = decode(encoded, {
      groupProps: {
        onLayoutChange: (layout) => {
          setState((prev) => ({
            onLayoutCount: prev.onLayoutCount + 1,
            layout
          }));
        }
      }
    });

    return group;
  }, [encoded]);

  return (
    <Box className="p-2" direction="column" gap={2}>
      <button
        onClick={() => {
          setHidden(!hidden);
        }}
      >
        toggle {mode} {hidden ? "hidden" : "visible"}
        {" → "}
        {hidden ? "visible" : "hidden"}
      </button>
      {mode === "activity" ? (
        <ReactActivity mode={hidden ? "hidden" : "visible"}>
          {children}
        </ReactActivity>
      ) : (
        <div className={hidden ? "hidden" : "block"}>{children}</div>
      )}
      <Box className={"p-2"} direction="row" gap={2} wrap>
        <DebugData
          data={{
            layout: state.layout,
            onLayoutCount: state.onLayoutCount
          }}
        />
      </Box>
    </Box>
  );
}
