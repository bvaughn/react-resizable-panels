import { cloneElement, useMemo, useState } from "react";
import { useParams } from "react-router";
import { Box } from "../../../../src/components/Box";
import { decode } from "../../tests/utils/serializer/decode";
import { cn } from "../utils/cn";

export function Decoder() {
  const { encoded } = useParams();

  const [state, setState] = useState({
    count: 0,
    layout: {}
  });

  const children = useMemo(() => {
    if (!encoded) {
      return null;
    }

    let group = decode(encoded);
    group = cloneElement(group, {
      ...group.props,
      onLayoutChange: (layout) => {
        setState((prev) => ({
          count: prev.count + 1,
          layout
        }));
      }
    });

    return group;
  }, [encoded]);

  console.group("Decoder");
  console.log(encoded);
  console.log(children);
  console.groupEnd();

  return (
    <Box className="p-2" direction="column" gap={2}>
      <div>{children}</div>
      <pre
        className={cn(
          "h-50 p-2 resize-none rounded-md font-mono text-xs",
          "border border-2 border-slate-800 focus:outline-none focus:border-sky-700"
        )}
      >
        <code className="text-xs">
          {JSON.stringify(
            {
              ...state,
              layout: Object.entries(state.layout).reduce(
                (map, [key, value]) => ({
                  ...map,
                  [key]: Math.round(value as number)
                }),
                {}
              )
            },
            null,
            2
          )}
        </code>
      </pre>
    </Box>
  );
}
