import { Panel } from "react-resizable-panels";

// <begin>

import { useParentPanel } from "react-resizable-panels";

function CollapseButton() {
  const panel = useParentPanel();

  return <button onClick={() => panel?.collapse()}>collapse</button>;
}

/* prettier-ignore */
<Panel collapsible><CollapseButton /></Panel>

// <end>

export { CollapseButton };
