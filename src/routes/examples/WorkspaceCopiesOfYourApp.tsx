import type { ReactNode } from "react";
import { type WorkspaceProps } from "react-resizable-panels";

declare function Workspace(_: Pick<WorkspaceProps, "dragGroup">): ReactNode;

const rest = {};

// <begin>

<Workspace dragGroup="editor" {...rest} />;

// <end>
