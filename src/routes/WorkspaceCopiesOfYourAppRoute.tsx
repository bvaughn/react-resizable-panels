import { Box, Callout, Code, Header } from "react-lib-tools";
import { html as CopiesOfYourAppHTML } from "../../public/generated/examples/WorkspaceCopiesOfYourApp.json";
import { Link } from "../components/Link";
import { BrowserFrame } from "../components/workspace/BrowserFrame";

export default function WorkspaceCopiesOfYourAppRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Workspace" title="Copies of your app" />
      <div>
        Workspaces in other copies of your app from the same origin (e.g. your
        app loaded in another browser window or tab) are part of the same{" "}
        <Link to="/examples/workspace/multiple-windows">drag group</Link>. A tab
        dropped into another copy will be handed off using a structured clone
        algorithm (like <code>postMessage</code>). Each copy renders its
        Workspace with the same <code>dragGroup</code>:
      </div>
      <Code html={CopiesOfYourAppHTML} />
      <div>
        Each frame below loads its own copy of a small app with a workspace, so
        tabs dragged between them are sent between copies.
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <BrowserFrame src="/embed/app?copy=a" title="Copy A" />
        <BrowserFrame src="/embed/app?copy=b" title="Copy B" />
      </div>
      <Callout>
        Tab data must be cloneable (e.g. no functions); tabs whose data can't be
        cloned can only be dragged within their copy of your app.
      </Callout>
      <Callout intent="warning">
        Copies loaded at different times may be running different versions of
        your app, so the other copy may get tab data it doesn't recognize.
      </Callout>
      <div>
        Set the <code>disableDragBetweenApps</code> prop to keep a workspace's
        drags within its copy of your app. Workspaces in{" "}
        <Link to="/examples/workspace/multiple-windows/popout-windows">
          popout windows
        </Link>{" "}
        rendered by that copy are still part of the group.
      </div>
    </Box>
  );
}
