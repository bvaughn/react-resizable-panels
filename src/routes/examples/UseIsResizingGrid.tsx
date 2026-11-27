import { Cell } from "react-resizable-panels";

function Chart() {
  return null;
}

function ChartPlaceholder() {
  return null;
}

// <begin>

import { useIsResizing } from "react-resizable-panels";

function ChartCellContent() {
  const isResizing = useIsResizing();

  return isResizing ? <ChartPlaceholder /> : <Chart />;
}

/* prettier-ignore */
<Cell column={0} row={0}><ChartCellContent /></Cell>

// <end>

export { ChartCellContent };
