import { Box, Callout, Code, Header } from "react-lib-tools";
import { html as MaxSizeModelHTML } from "../../public/generated/examples/WorkspaceMaxSizeModel.json";
import { DemoWorkspace } from "../components/workspace/WorkspaceDemo";
import { maxSizeModel } from "./examples/WorkspaceMaxSizeModel";

export default function WorkspaceMinMaxSizesRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Workspace" title="Minimum and maximum sizes" />
      <div>
        The <code>tabsetMinWidth</code> and <code>tabsetMinHeight</code> props
        set a minimum size for the content of every tabset (not including its
        tabs), and a tabset can override them with the <code>minWidth</code> and{" "}
        <code>minHeight</code> fields of its model node. The{" "}
        <code>maxWidth</code> and <code>maxHeight</code> fields limit how large
        a tabset's content can be resized, e.g. a sidebar that can only grow so
        wide. All of them must use absolute units (e.g. <code>"300px"</code> or{" "}
        <code>"20rem"</code>):
      </div>
      <Code html={MaxSizeModelHTML} />
      <div>
        The sidebar below can be resized between 150 and 300 pixels wide, but
        its tab can't be dragged or closed.
      </div>
      <DemoWorkspace
        className="h-80"
        defaultModel={maxSizeModel}
        defaultSeparators
        showResetButton
      />
      <Callout>
        A split always fills its space, so a maximum only applies if something
        else can take up the rest of it, e.g. another tabset in the same split
        without a maximum. Maximums are ignored (with a warning in development)
        if every tabset in a split has one, or if the tabset fills the
        workspace.
      </Callout>
      <Callout>
        A tabset is shown within its minimum and maximum sizes even if its{" "}
        <code>size</code> is outside of them (e.g. a model saved in a wider
        window); its size isn't changed, so it's shown at its size again once
        that fits.
      </Callout>
    </Box>
  );
}
