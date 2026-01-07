import type { ReactElement } from "react";
import { Group, type GroupProps } from "react-resizable-panels";

declare const rest: GroupProps;
declare function render(element: ReactElement): void;

// <begin>

// an inline style will override the default
render(<Group style={{ height: 100 }} {...rest} />);

// an !important CSS rule will also override it
render(<Group className="h-100!" {...rest} />);

// a min-height CSS rule will accomplish the same result
render(<Group className="min-h-100" {...rest} />);
