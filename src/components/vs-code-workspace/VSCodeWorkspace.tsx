import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  FolderOpenIcon,
  XMarkIcon
} from "@heroicons/react/16/solid";
import {
  FolderIcon,
  MagnifyingGlassIcon,
  PlayIcon
} from "@heroicons/react/20/solid";
import {
  createContext,
  type PropsWithChildren,
  type ReactNode,
  useContext,
  useMemo,
  useRef,
  useState
} from "react";
import { cn } from "react-lib-tools";
import {
  type SplitNode,
  TabCloseButton,
  type TabNode,
  type TabRenderProps,
  type TabsetNode,
  useParentTabset,
  useParentTabsetState,
  useParentTabState,
  useWorkspaceRef,
  Workspace,
  type WorkspaceModel
} from "react-resizable-panels";
import { html as appHTML } from "../../../public/generated/examples/VSCodeWorkspaceEditorFile.json";
import { VSCodeSidePanelContent } from "../vs-code/VSCodeSidePanelContent";
import { CLASS_NAMES_DEFAULT_SEPARATORS } from "../workspace/workspaceDemoStyles";

// Spike: a VS Code-like landing page demo built with the Workspace component
// - The sidebar is a collapsible tabset with its tabs on the left; its tab list doubles as the activity bar
// - Clicking the selected activity tab toggles the sidebar (like VS Code)
// - Files open (or are selected, if already open) in the most recently used editor tabset

type FileName = "App.tsx" | "model.ts" | "package.json" | "README.md";
type View = "debug" | "explorer" | "search";
type PanelView = "output" | "problems" | "terminal";

type TabData =
  | { kind: "file"; name: FileName }
  | { kind: "panel"; panel: PanelView }
  | { kind: "view"; view: View };

const EDITORS_ID = "editors";
const PANEL_ID = "panel";
const SIDEBAR_ID = "sidebar";

const VIEWS: { Icon: typeof FolderIcon; id: View; title: string }[] = [
  { Icon: FolderIcon, id: "explorer", title: "Explorer" },
  { Icon: MagnifyingGlassIcon, id: "search", title: "Search" },
  { Icon: PlayIcon, id: "debug", title: "Run and debug" }
];

function fileTab(name: FileName): TabNode<TabData> {
  return { data: { kind: "file", name }, id: `file:${name}`, title: name };
}

function panelTab(panel: PanelView, title: string): TabNode<TabData> {
  return {
    data: { kind: "panel", panel },
    disableClose: true,
    id: panel,
    title
  };
}

const defaultModel: WorkspaceModel<TabData> = {
  version: 1,
  root: {
    type: "split",
    id: "root",
    orientation: "horizontal",
    children: [
      {
        type: "tabset",
        id: SIDEBAR_ID,
        collapsible: true,
        disableDrag: true,
        maxWidth: "280px",
        minWidth: "140px",
        selectedId: "explorer",
        // A share of the workspace (within the min/max widths above), so narrow screens leave room for the editor
        size: 30,
        tabPlacement: "left",
        tabs: VIEWS.map(({ id, title }) => ({
          data: { kind: "view", view: id },
          disableClose: true,
          disableDrag: true,
          id,
          title
        }))
      },
      {
        type: "split",
        id: "main",
        orientation: "vertical",
        children: [
          {
            type: "tabset",
            id: EDITORS_ID,
            // Files can always be opened here, even after all of its tabs have been closed (or moved)
            keepWhenEmpty: true,
            selectedId: "file:App.tsx",
            size: 70,
            tabs: [fileTab("App.tsx"), fileTab("model.ts")]
          },
          {
            type: "tabset",
            id: PANEL_ID,
            collapsible: true,
            size: 30,
            tabs: [
              panelTab("terminal", "Terminal"),
              panelTab("problems", "Problems"),
              panelTab("output", "Output")
            ]
          }
        ]
      }
    ]
  }
};

function findTabset(
  node: SplitNode<TabData> | TabsetNode<TabData>,
  id: string | undefined
): TabsetNode<TabData> | undefined {
  if (node.type === "tabset") {
    return node.id === id ? node : undefined;
  }
  for (const child of node.children) {
    const match = findTabset(child, id);
    if (match) {
      return match;
    }
  }
}

function getSelectedFile(tabset: TabsetNode<TabData> | undefined) {
  const tab = tabset?.tabs.find(({ id }) => id === tabset.selectedId);
  return tab?.data.kind === "file" ? tab.data.name : undefined;
}

type ContextType = {
  activeFile: FileName | undefined;
  openFile: (name: FileName) => void;
};

const VSCodeWorkspaceContext = createContext<ContextType>({
  activeFile: undefined,
  openFile: () => {}
});

export function VSCodeWorkspace() {
  const workspaceRef = useWorkspaceRef<TabData>();

  // The editor tabset files are opened in: the one that most recently showed a file
  const editorTabsetIdRef = useRef(EDITORS_ID);

  const [activeFile, setActiveFile] = useState<FileName | undefined>("App.tsx");
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  const onModelChanged = (model: WorkspaceModel<TabData>) => {
    const activeTabset = findTabset(
      model.root,
      workspaceRef.current?.getActiveTabsetId()
    );
    if (getSelectedFile(activeTabset)) {
      editorTabsetIdRef.current = activeTabset!.id;
    }

    const editorTabset =
      findTabset(model.root, editorTabsetIdRef.current) ??
      findTabset(model.root, EDITORS_ID);

    setActiveFile(getSelectedFile(editorTabset));
    setIsPanelCollapsed(!!findTabset(model.root, PANEL_ID)?.collapsed);
  };

  const context = useMemo<ContextType>(
    () => ({
      activeFile,
      openFile: (name) => {
        const workspace = workspaceRef.current;
        if (!workspace) {
          return;
        }

        const model = workspace.getModel();
        const tabsetId = findTabset(model.root, editorTabsetIdRef.current)
          ? editorTabsetIdRef.current
          : EDITORS_ID;

        // Selects the file's tab instead, if it's already open (in any tabset)
        workspace.addTab(fileTab(name), { tabsetId });
      }
    }),
    [activeFile, workspaceRef]
  );

  return (
    <VSCodeWorkspaceContext value={context}>
      {/* The same space as between tabsets (a split gap on either side of each invisible separator) */}
      <div className="flex flex-col gap-2 sm:gap-1">
        <Workspace<TabData>
          className="h-80 [&>[data-workspace-layout][inert]]:invisible"
          // The Workspace's default separators are invisible; tabsets are resized by dragging the gaps between them
          classNames={CLASS_NAMES_DEFAULT_SEPARATORS}
          defaultModel={defaultModel}
          // Only the activity views belong in the sidebar (so nothing is dropped in it, or beside it at the left edge)
          disableDrop={({ target }) =>
            ("tabsetId" in target && target.tabsetId === SIDEBAR_ID) ||
            ("edge" in target && target.edge === "left")
          }
          onModelChanged={onModelChanged}
          renderEmptyTabset={renderEmptyTabset}
          renderTab={renderTab}
          renderTabContent={renderTabContent}
          renderTabsetToolbar={(tabset) =>
            tabset.id === SIDEBAR_ID ? null : (
              <ExpandedOnly>
                {tabset.id === PANEL_ID && <CollapseButton />}
                <MaximizeButton />
              </ExpandedOnly>
            )
          }
          tabsetMinHeight="60px"
          tabsetMinWidth="120px"
          workspaceRef={workspaceRef}
        />
        <div className="flex flex-row items-center gap-3 px-2 py-0.5 rounded-md bg-ink/8 text-xs text-ink/60">
          <span className="flex items-center gap-1">
            <CodeBracketIcon className="w-3 h-3" />
            main
          </span>
          <span className="grow truncate">{activeFile}</span>
          <button
            className="flex items-center gap-1 cursor-pointer hover:text-ink"
            onClick={() => {
              const workspace = workspaceRef.current;
              if (isPanelCollapsed) {
                workspace?.expandTabset(PANEL_ID);
              } else {
                workspace?.collapseTabset(PANEL_ID);
              }
            }}
          >
            {isPanelCollapsed ? (
              <ChevronUpIcon className="w-3 h-3" />
            ) : (
              <ChevronDownIcon className="w-3 h-3" />
            )}
            {isPanelCollapsed ? "Show panel" : "Hide panel"}
          </button>
        </div>
      </div>
    </VSCodeWorkspaceContext>
  );
}

function renderEmptyTabset() {
  return (
    <div className="absolute inset-0 flex items-center justify-center text-ink/40 text-sm">
      Open a file from the explorer
    </div>
  );
}

function renderTab(tab: TabNode<TabData>, props: TabRenderProps) {
  if (tab.data.kind === "view") {
    return <ActivityTab props={props} tab={tab} view={tab.data.view} />;
  }

  return (
    <div {...props}>
      <span className="flex items-center gap-1">
        {tab.data.kind === "file" && (
          <DocumentTextIcon className="w-4 h-4 shrink-0 text-ink/60" />
        )}
        {tab.title}
        <TabCloseButton className="p-0.5 rounded hover:bg-ink/10 cursor-pointer focus-visible:outline-2! focus-visible:outline-sky-400!">
          <XMarkIcon className="w-3 h-3" />
        </TabCloseButton>
      </span>
    </div>
  );
}

// Clicking the selected view's icon toggles the sidebar, like VS Code's activity bar;
// clicking another icon selects it (and expands the sidebar if it's collapsed, which the Workspace does by default)
function ActivityTab({
  props,
  tab,
  view
}: {
  props: TabRenderProps;
  tab: TabNode<TabData>;
  view: View;
}) {
  const tabset = useParentTabset();
  const tabsetState = useParentTabsetState();
  const tabState = useParentTabState();

  const { Icon } = VIEWS.find(({ id }) => id === view)!;

  return (
    <div
      {...props}
      aria-label={tab.title}
      className={cn(props.className, "px-1.5!")}
      onClick={(event) => {
        if (tabState?.isSelected && !tabsetState?.isCollapsed) {
          tabset?.collapse();
        } else {
          props.onClick?.(event);
        }
      }}
      title={tab.title}
    >
      <Icon className="w-5 h-5" />
    </div>
  );
}

function renderTabContent(tab: TabNode<TabData>): ReactNode {
  switch (tab.data.kind) {
    case "file":
      return <FileContent name={tab.data.name} />;
    case "panel":
      return <PanelContent panel={tab.data.panel} />;
    case "view":
      return (
        <div className="flex flex-col gap-2 p-2">
          <div className="text-xs uppercase tracking-wide text-ink/60 truncate">
            {tab.title}
          </div>
          {tab.data.view === "explorer" ? (
            <Explorer />
          ) : (
            <VSCodeSidePanelContent tab={tab.data.view} />
          )}
        </div>
      );
  }
}

function Explorer() {
  return (
    <div className="flex flex-col">
      <TreeRow depth={0} icon={<FolderOpenIcon className="w-4 h-4" />}>
        src
      </TreeRow>
      <FileRow depth={1} name="App.tsx" />
      <FileRow depth={1} name="model.ts" />
      <FileRow depth={0} name="package.json" />
      <FileRow depth={0} name="README.md" />
    </div>
  );
}

function FileRow({ depth, name }: { depth: number; name: FileName }) {
  const { activeFile, openFile } = useContext(VSCodeWorkspaceContext);

  return (
    <TreeRow
      depth={depth}
      icon={<DocumentTextIcon className="w-4 h-4" />}
      isActive={activeFile === name}
      onClick={() => openFile(name)}
    >
      {name}
    </TreeRow>
  );
}

function TreeRow({
  children,
  depth,
  icon,
  isActive = false,
  onClick
}: PropsWithChildren<{
  depth: number;
  icon: ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}>) {
  const className = cn(
    "flex flex-row items-center gap-1 py-0.5 text-sm rounded text-start",
    isActive ? "bg-ink/10" : "text-ink/80",
    onClick && "cursor-pointer hover:bg-ink/5"
  );
  const style = { paddingLeft: `${depth * 0.75 + 0.25}rem` };
  const content = (
    <>
      <span className="shrink-0 text-ink/60">{icon}</span>
      <span className="truncate">{children}</span>
    </>
  );

  return onClick ? (
    <button className={className} onClick={onClick} style={style}>
      {content}
    </button>
  ) : (
    <div className={className} style={style}>
      {content}
    </div>
  );
}

const MODEL_TS = `import type { WorkspaceModel } from "react-resizable-panels";

export const model: WorkspaceModel<TabData> = {
  version: 1,
  root: {
    type: "split",
    id: "root",
    orientation: "horizontal",
    children: [
      { type: "tabset", id: "sidebar", collapsible: true, tabs: [] },
      { type: "tabset", id: "editors", tabs: [] }
    ]
  }
};`;

const PACKAGE_JSON = `{
  "name": "my-app",
  "private": true,
  "dependencies": {
    "react": "^19.2.0",
    "react-resizable-panels": "^4.19.0"
  }
}`;

const README_MD = `# My app

Drag tabs between tabsets, or onto the edge of a tabset to split it.
Click the selected icon in the activity bar to toggle the sidebar.`;

function escapeHTML(text: string) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

const FILE_LINES: Record<FileName, string[]> = {
  "App.tsx": appHTML.split("\n"),
  "model.ts": escapeHTML(MODEL_TS).split("\n"),
  "package.json": escapeHTML(PACKAGE_JSON).split("\n"),
  "README.md": escapeHTML(README_MD).split("\n")
};

function FileContent({ name }: { name: FileName }) {
  return (
    <div className="py-2 font-mono text-xs leading-5">
      {FILE_LINES[name].map((line, index) => (
        <div className="flex flex-row whitespace-pre" key={index}>
          <span className="w-8 shrink-0 pr-3 text-right text-ink/40 select-none">
            {index + 1}
          </span>
          <div dangerouslySetInnerHTML={{ __html: line }} />
        </div>
      ))}
    </div>
  );
}

function PanelContent({ panel }: { panel: PanelView }) {
  switch (panel) {
    case "output":
      return (
        <div className="p-2 font-mono text-xs text-ink/60">
          [info] Compiled successfully in 412ms
        </div>
      );
    case "problems":
      return (
        <div className="p-2 text-xs text-ink/60">
          No problems have been detected in the workspace.
        </div>
      );
    case "terminal":
      return (
        <div className="p-2 font-mono text-xs leading-5">
          <div>
            <span className="text-violet-400">~/my-app</span> $ pnpm dev
          </div>
          <div className="text-ink/60">
            VITE ready in 312 ms ➜ Local: http://localhost:5173/
          </div>
        </div>
      );
  }
}

// Collapsed tabsets only show their tabs (clicking one expands the tabset)
function ExpandedOnly({ children }: PropsWithChildren) {
  const state = useParentTabsetState();

  return state?.isCollapsed && !state.isMaximized ? null : children;
}

function CollapseButton() {
  const tabset = useParentTabset();
  const state = useParentTabsetState();

  if (!state?.isCollapsible || state.isMaximized) {
    return null;
  }

  return (
    <ToolbarButton onClick={() => tabset?.collapse()} title="Hide panel">
      <ChevronDownIcon className="w-4 h-4" />
    </ToolbarButton>
  );
}

function MaximizeButton() {
  const tabset = useParentTabset();
  const state = useParentTabsetState();
  const isMaximized = !!state?.isMaximized;

  if (state?.isRoot) {
    return null;
  }

  return (
    <ToolbarButton
      onClick={() => (isMaximized ? tabset?.restore() : tabset?.maximize())}
      title={isMaximized ? "Restore" : "Maximize"}
    >
      {isMaximized ? (
        <ArrowsPointingInIcon className="w-4 h-4" />
      ) : (
        <ArrowsPointingOutIcon className="w-4 h-4" />
      )}
    </ToolbarButton>
  );
}

function ToolbarButton({
  children,
  onClick,
  title
}: PropsWithChildren<{ onClick: () => void; title: string }>) {
  return (
    <button
      aria-label={title}
      className="p-1 mx-0.5 rounded text-ink/60 hover:text-ink hover:bg-ink/10 cursor-pointer focus-visible:outline-2! focus-visible:outline-sky-400!"
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
}
