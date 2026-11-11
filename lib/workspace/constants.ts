// Drag data type of drags between workspaces (see the dragGroup prop), which use the browser's drag and drop;
// some browsers (e.g. Firefox) only start a drag that has data, but the dragged tab itself is shared through a module (or with other pages, through a channel) rather than the drag's data (see NativeDrag)
export const WORKSPACE_DRAG_DATA_TYPE =
  "application/x-react-resizable-panels-workspace";
