import { Box } from "react-lib-tools";
import { useSearchParams } from "react-router";
import { Group } from "../components/Group";
import { Panel } from "../components/Panel";
import { Separator } from "../components/Separator";

export function Edges() {
  const [params] = useSearchParams();

  if (params.has("iframe")) {
    return (
      <Group className="h-full bg-slate-900" id="group">
        <Panel id="left" />
        <Separator />
        <Panel id="right" />
      </Group>
    );
  }

  return (
    <Box className="h-full" direction="row">
      <div className="w-[50%]">Left</div>
      <iframe
        className="w-[50%]"
        sandbox="allow-scripts"
        src="http://localhost:3012/e2e/edges?iframe"
      />
    </Box>
  );
}
