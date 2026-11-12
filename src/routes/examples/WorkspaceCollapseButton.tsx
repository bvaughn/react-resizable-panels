import { TabsetCollapseButton } from "react-resizable-panels";

// <begin>

const toolbar = (
  <TabsetCollapseButton
    title={({ isCollapsed }) => (isCollapsed ? "Expand" : "Collapse")}
  >
    {({ isCollapsed }) => (isCollapsed ? "▸" : "▾")}
  </TabsetCollapseButton>
);

// <end>

export { toolbar };
