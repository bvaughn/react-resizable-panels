import { Panel } from "react-resizable-panels";

// <begin>

import { useParentGroup } from "react-resizable-panels";

function ResetButton() {
  const group = useParentGroup();

  return (
    <button onClick={() => group?.setLayout({ left: 50, right: 50 })}>
      reset layout
    </button>
  );
}

/* prettier-ignore */
<Panel id="left"><ResetButton /></Panel>

// <end>

export { ResetButton };
