import { Panel } from "react-resizable-panels";

function Chart() {
  return null;
}

function ChartPlaceholder() {
  return null;
}

// <begin>

import { useIsResizing } from "react-resizable-panels";

function ChartPanelContent() {
  const isResizing = useIsResizing();

  return isResizing ? <ChartPlaceholder /> : <Chart />;
}

/* prettier-ignore */
<Panel><ChartPanelContent /></Panel>

// <end>

export { ChartPanelContent };
