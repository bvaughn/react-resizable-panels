import { TabsetMaximizeButton } from "react-resizable-panels";

// <begin>

// Renders nothing for the only tabset in a workspace (and for floating tabsets)
const toolbar = (
  <TabsetMaximizeButton>
    {({ isMaximized }) => (isMaximized ? "Restore" : "Maximize")}
  </TabsetMaximizeButton>
);

// <end>

export { toolbar };
