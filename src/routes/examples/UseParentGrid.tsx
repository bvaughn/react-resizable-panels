import { Cell } from "react-resizable-panels";

// <begin>

import { useParentGrid } from "react-resizable-panels";

function CellToolbar() {
  const grid = useParentGrid();

  return (
    <button onClick={() => grid?.getTrackByIndex("column", 0).resize("75%")}>
      widen first column
    </button>
  );
}

/* prettier-ignore */
<Cell column={0} row={0}><CellToolbar /></Cell>

// <end>

export { CellToolbar };
