import { TabsetMaximizeButton } from "react-resizable-panels";

// <begin>

const toolbar = (
  <TabsetMaximizeButton>
    {({ isMaximized }) => (isMaximized ? "Restore" : "Maximize")}
  </TabsetMaximizeButton>
);

// <end>

export { toolbar };
