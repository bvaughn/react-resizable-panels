import { useLayoutEffect, useState } from "react";
import { Group } from "react-resizable-panels";
import { Panel } from "../components/Panel";
import { Separator } from "../components/Separator";

export function ConditionallyRenderedPanels() {
  const [count, setCount] = useState(0);

  useLayoutEffect(() => {
    if (count === 0) {
      setCount(1);
    }
  }, [count]);

  return (
    <Group className="h-10 w-200 m-2 flex gap-2">
      {count === 9 ? (
        <>
          <Panel id="c" />
          <Separator id="b" />
          <Panel id="d" />
        </>
      ) : (
        <>
          <Panel id="a" />
          <Separator id="a" />
          <Panel id="b" />
          <Panel id="c" />
          <Separator id="b" />
          <Panel id="d" />
        </>
      )}
    </Group>
  );
}
