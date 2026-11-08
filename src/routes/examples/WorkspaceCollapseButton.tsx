import { TabsetCollapseButton } from "react-resizable-panels";

// <begin>

// Renders nothing for tabsets that can't be collapsed;
// its props can be functions of the tabset's state
const toolbar = (
  <TabsetCollapseButton
    title={({ isCollapsed }) => (isCollapsed ? "Expand" : "Collapse")}
  >
    {({ isCollapsed }) => (isCollapsed ? "▸" : "▾")}
  </TabsetCollapseButton>
);

// <end>

export { toolbar };
