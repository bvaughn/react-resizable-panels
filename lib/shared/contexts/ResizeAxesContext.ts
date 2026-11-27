import { createContext } from "react";

// Ids of the resize axes of the nearest Group (one) or Grid (columns and rows), whichever is closer;
// used by useIsResizing (unlike ParentGroupContext and ParentGridContext, which don't reset each other)
export const ResizeAxesContext = createContext<readonly string[] | null>(null);
