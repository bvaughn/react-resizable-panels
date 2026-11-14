import {
  ArrowDownTrayIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  ArrowTopRightOnSquareIcon,
  Bars3Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  MinusIcon,
  PlusIcon,
  XMarkIcon
} from "@heroicons/react/16/solid";
import { type PropsWithChildren, type RefObject, useState } from "react";
import { cn } from "react-lib-tools";
import {
  TabCloseButton,
  type TabNode,
  type TabRenderProps,
  TabsetCollapseButton,
  TabsetDragHandle,
  TabsetMaximizeButton,
  type TabsetNode,
  useParentTabset,
  useParentTabsetState,
  useParentWorkspace,
  useWorkspaceRef,
  Workspace,
  type WorkspaceImperativeHandle,
  type WorkspaceModel,
  type WorkspaceProps
} from "react-resizable-panels";
import { initialModel } from "../../routes/examples/WorkspaceModel";
import { DemoButton } from "../DemoButton";
import { Group } from "../styled-panels/Group";
import { Panel } from "../styled-panels/Panel";
import { Separator as StyledSeparator } from "../styled-panels/Separator";
import {
  CLASS_NAMES,
  CLASS_NAMES_DEFAULT_SEPARATORS,
  renderSeparator
} from "./workspaceDemoStyles";

export type DemoTab =
  | {
      kind:
        | "about"
        | "about-copies"
        | "about-popouts"
        | "counter"
        | "nested"
        | "notes"
        | "pinned";
    }
  // Content that keeps its state in the tab's data (rather than component state), so it survives being moved to another window
  | { count: number; kind: "saved-counter" }
  | { kind: "saved-notes"; text: string };

export type TabPlacement = "bottom" | "left" | "right" | "top";

function createId() {
  return Array.from(crypto.getRandomValues(new Uint8Array(8)), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

function loadModel(storageKey: string | undefined) {
  if (storageKey) {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored) as WorkspaceModel<DemoTab>;
      }
    } catch {
      // Fall back to the default layout
    }
  }
}

function saveModel(storageKey: string, model: WorkspaceModel<DemoTab>) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(model));
  } catch {
    // Saving is a convenience
  }
}

/**
 * The workspaces on the basics page; their layouts can be reset (but aren't saved).
 */
export function WorkspaceDemo({
  defaultSeparators = false
}: {
  defaultSeparators?: boolean;
}) {
  return (
    <DemoWorkspace
      defaultModel={initialModel}
      defaultSeparators={defaultSeparators}
      showResetButton
    />
  );
}

/**
 * Styled workspace shared by the docs pages.
 */
export function DemoWorkspace({
  canAddTabs,
  canCloseTabset,
  className,
  defaultModel,
  defaultSeparators = false,
  onPopOut,
  showDragHandles = false,
  showFloatButtons = false,
  showMaximizeButtons = true,
  showResetButton = false,
  storageKey,
  tabPlacement = "top",
  workspaceRef: workspaceRefProp,
  ...rest
}: Pick<
  WorkspaceProps<DemoTab>,
  | "acceptExternalDrop"
  | "className"
  | "copyTab"
  | "copyTabset"
  | "disabled"
  | "disableDrop"
  | "dragGroup"
  | "onBeforeModelChange"
  | "onModelChanged"
  | "renderDragPreview"
  | "renderEmptyTabset"
  | "renderTabsetDragPreview"
  | "renderTabsetToolbar"
  | "tabRemovalSelectionBehavior"
> & {
  canAddTabs?: (tabset: TabsetNode<DemoTab>) => boolean;
  canCloseTabset?: (tabset: TabsetNode<DemoTab>) => boolean;
  defaultModel: WorkspaceModel<DemoTab>;
  // Use the Workspace's default (unstyled) separators, rather than the docs' styled ones
  defaultSeparators?: boolean;
  // Shows a button that moves the tabset to a new window
  onPopOut?: (tabset: TabsetNode<DemoTab>) => void;
  // Tabsets are dragged by a handle in their toolbars, rather than by the empty space in their headers
  showDragHandles?: boolean;
  // Shows a button that floats the tabset above the layout (or docks it, if it's floating)
  showFloatButtons?: boolean;
  // Hides the maximize buttons (e.g. in demos that don't need them, to keep the toolbars short)
  showMaximizeButtons?: boolean;
  showResetButton?: boolean;
  storageKey?: string;
  tabPlacement?: TabPlacement;
  workspaceRef?: RefObject<WorkspaceImperativeHandle<DemoTab> | null>;
}) {
  const [savedModel] = useState(() => loadModel(storageKey));
  const internalWorkspaceRef = useWorkspaceRef<DemoTab>();
  const workspaceRef = workspaceRefProp ?? internalWorkspaceRef;

  return (
    <div className="flex flex-col gap-2">
      <Workspace<DemoTab>
        className={cn(
          "h-120",
          // Tabsets are translucent, so the layout (which is inert while a tabset is maximized) is hidden behind the maximized tabset
          "[&>[data-workspace-layout][inert]]:invisible",
          className
        )}
        classNames={
          defaultSeparators ? CLASS_NAMES_DEFAULT_SEPARATORS : CLASS_NAMES
        }
        defaultModel={savedModel ?? defaultModel}
        renderEmptyTabset={renderEmptyTabset}
        renderSeparator={defaultSeparators ? undefined : renderSeparator}
        renderTab={renderTab}
        renderTabContent={renderTabContent}
        renderTabsetToolbar={(tabset) => (
          <>
            {showDragHandles && <DragHandle />}
            <ExpandedOnly>
              {/* Adding tabs isn't restricted by the workspace, so the demo hides the button itself */}
              {!rest.disabled && (canAddTabs?.(tabset) ?? true) && (
                <AddTabButton />
              )}
              {onPopOut && <PopOutButton onPopOut={onPopOut} tabset={tabset} />}
              {showFloatButtons && <FloatButton />}
            </ExpandedOnly>
            <CollapseButton />
            <ExpandedOnly>
              {showMaximizeButtons && <MaximizeButton />}
              {canCloseTabset?.(tabset) && <CloseTabsetButton />}
            </ExpandedOnly>
          </>
        )}
        tabPlacement={tabPlacement}
        tabsetMinHeight="60px"
        tabsetMinWidth="120px"
        workspaceRef={workspaceRef}
        {...rest}
        onModelChanged={(model, meta) => {
          if (storageKey) {
            saveModel(storageKey, model);
          }
          rest.onModelChanged?.(model, meta);
        }}
      />
      {showResetButton && (
        <div>
          <DemoButton
            onClick={() => workspaceRef.current?.setModel(defaultModel)}
          >
            Reset layout
          </DemoButton>
        </div>
      )}
    </div>
  );
}

function renderEmptyTabset() {
  return (
    <div className="absolute inset-0 flex items-center justify-center text-ink/60 text-sm">
      Add tabs here
    </div>
  );
}

function renderTab(tab: TabNode<DemoTab>, props: TabRenderProps) {
  return (
    <div {...props}>
      {/* Side tabs are rotated to read along the edge (bottom to top on the left) */}
      <span className="flex items-center gap-1 tabs-vertical:[writing-mode:vertical-rl] group-data-[tab-placement=left]/tab:rotate-180">
        {tab.title}
        <TabCloseButton className="p-0.5 rounded hover:bg-ink/10 cursor-pointer focus-visible:outline-2! focus-visible:outline-sky-400!">
          <XMarkIcon className="w-3 h-3" />
        </TabCloseButton>
      </span>
    </div>
  );
}

function AddTabButton() {
  const tabset = useParentTabset<DemoTab>();

  return (
    <TabsetButton
      onClick={() =>
        tabset?.addTab({
          data: { kind: "counter" },
          id: createId(),
          title: "Counter"
        })
      }
      title="Add tab"
    >
      <PlusIcon className="w-4 h-4" />
    </TabsetButton>
  );
}

// Hidden when the tabset (or any of its tabs) can't be dragged, since it couldn't be dragged to a popout window either
function PopOutButton({
  onPopOut,
  tabset
}: {
  onPopOut: (tabset: TabsetNode<DemoTab>) => void;
  tabset: TabsetNode<DemoTab>;
}) {
  if (
    tabset.tabs.length === 0 ||
    tabset.disableDrag ||
    tabset.tabs.some(({ disableDrag }) => disableDrag)
  ) {
    return null;
  }

  return (
    <TabsetButton onClick={() => onPopOut(tabset)} title="Open in new window">
      <ArrowTopRightOnSquareIcon className="w-4 h-4" />
    </TabsetButton>
  );
}

// The only tabset in a workspace fills it, so it can't float
function FloatButton() {
  const workspace = useParentWorkspace();
  const tabset = useParentTabset();
  const state = useParentTabsetState();

  if (!workspace || !tabset || !state || state.isRoot) {
    return null;
  }

  return state.isFloating ? (
    <TabsetButton
      // Moving a floating tabset beside the others docks it
      onClick={() => workspace.moveTabset(tabset.id, { edge: "right" })}
      title="Dock tabset"
    >
      <ArrowDownTrayIcon className="w-4 h-4" />
    </TabsetButton>
  ) : (
    <TabsetButton onClick={() => tabset.float()} title="Float tabset">
      <ArrowTopRightOnSquareIcon className="w-4 h-4" />
    </TabsetButton>
  );
}

// Hidden when the tabset can't be dragged (e.g. it's the only tabset in the workspace)
function DragHandle() {
  return (
    <TabsetDragHandle
      className="p-1 mx-0.5 rounded text-ink/60 hover:text-ink hover:bg-ink/10 cursor-grab data-[disabled]:hidden"
      title="Drag tabset"
    >
      <Bars3Icon className="w-4 h-4" />
    </TabsetDragHandle>
  );
}

// Collapsed tabsets only show their tabs (clicking one expands the tabset);
// a maximized tabset is shown expanded, even if it's collapsed
function ExpandedOnly({ children }: PropsWithChildren) {
  const state = useParentTabsetState();

  return state?.isCollapsed && !state.isMaximized ? null : children;
}

// TabsetCollapseButton renders nothing for tabsets that can't be collapsed;
// a collapsed tabset in the layout is a narrow strip (expanded by clicking one of its tabs), so the button is hidden for it,
// but a collapsed floating tabset's header runs across it, so it shows the button (to expand it) like a disclosure
function CollapseButton() {
  const state = useParentTabsetState();
  const isFloating = !!state?.isFloating;

  if (state?.isCollapsed && !isFloating && !state.isMaximized) {
    return null;
  }

  return (
    <TabsetCollapseButton
      className={TABSET_BUTTON_CLASS_NAME}
      title={({ isCollapsed }) =>
        isCollapsed ? "Expand tabset" : "Collapse tabset"
      }
    >
      {({ isCollapsed }) =>
        !isFloating ? (
          <MinusIcon className="w-4 h-4" />
        ) : isCollapsed ? (
          <ChevronRightIcon className="w-4 h-4" />
        ) : (
          <ChevronDownIcon className="w-4 h-4" />
        )
      }
    </TabsetCollapseButton>
  );
}

// Closing (or maximizing) the only tabset in a workspace isn't useful, so these buttons are hidden for it
function CloseTabsetButton() {
  const tabset = useParentTabset();
  const isRoot = !!useParentTabsetState()?.isRoot;

  if (isRoot) {
    return null;
  }

  return (
    <TabsetButton onClick={() => tabset?.close()} title="Close tabset">
      <XMarkIcon className="w-4 h-4" />
    </TabsetButton>
  );
}

// TabsetMaximizeButton renders nothing for the only tabset in a workspace (and for floating tabsets)
function MaximizeButton() {
  return (
    <TabsetMaximizeButton
      className={TABSET_BUTTON_CLASS_NAME}
      title={({ isMaximized }) =>
        isMaximized ? "Restore tabset" : "Maximize tabset"
      }
    >
      {({ isMaximized }) =>
        isMaximized ? (
          <ArrowsPointingInIcon className="w-4 h-4" />
        ) : (
          <ArrowsPointingOutIcon className="w-4 h-4" />
        )
      }
    </TabsetMaximizeButton>
  );
}

const TABSET_BUTTON_CLASS_NAME =
  "p-1 mx-0.5 rounded text-ink/60 hover:text-ink hover:bg-ink/10 cursor-pointer focus-visible:outline-2! focus-visible:outline-sky-400!";

function TabsetButton({
  children,
  onClick,
  title
}: PropsWithChildren<{ onClick: () => void; title: string }>) {
  return (
    <button
      aria-label={title}
      className={TABSET_BUTTON_CLASS_NAME}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
}

function renderTabContent(tab: TabNode<DemoTab>) {
  switch (tab.data.kind) {
    case "about":
      return (
        <div className="p-3 text-sm flex flex-col gap-2">
          <p>Drag a tab onto another tab list to move it there.</p>
          <p>
            Drag a tab onto the edge of a tabset to split it, or onto its center
            to add the tab to it.
          </p>
          <p>
            Use the arrow keys to move between tabs, Enter to select one, and
            Delete to close one.
          </p>
        </div>
      );
    case "about-copies":
      return (
        <div className="p-3 text-sm flex flex-col gap-2">
          <p>
            This frame loads its own copy of the app. Drag a tab into the other
            frame to move it there, or open both copies in their own windows.
          </p>
          <p>
            The counter and scratchpad keep their values in their tabs' data,
            which is sent along with a tab to the other copy.
          </p>
        </div>
      );
    case "about-popouts":
      return (
        <div className="p-3 text-sm flex flex-col gap-2">
          <p>
            Use the "Open in new window" button in a tabset's toolbar to move
            the tabset to a popup window. Tabs can be dragged between this
            window and the popups.
          </p>
          <p>
            Closing a popup moves its tabs back here. The counter and scratchpad
            keep their values in their tabs' data, so they survive being moved
            to another window.
          </p>
        </div>
      );
    case "counter":
      return <Counter />;
    case "nested":
      return (
        <Group className="h-full p-2">
          <Panel minSize={40}>left</Panel>
          <StyledSeparator />
          <Panel minSize={40}>right</Panel>
        </Group>
      );
    case "notes":
      return (
        <textarea
          aria-label={tab.title}
          className="w-full h-full p-3 text-sm bg-transparent resize-none outline-none"
          placeholder="Type something, then drag this tab somewhere else…"
        />
      );
    case "saved-counter":
      return <SavedCounter count={tab.data.count} tabId={tab.id} />;
    case "saved-notes":
      return (
        <SavedNotes text={tab.data.text} tabId={tab.id} title={tab.title} />
      );
    case "pinned":
      return (
        <div className="p-3 text-sm">
          This tab can't be closed or dragged, but other tabs can be dropped
          around it.
        </div>
      );
  }
}

// Kept in the tab's data, which moves with the tab (unlike component state, which is lost when another workspace mounts the tab's content)
function SavedCounter({ count, tabId }: { count: number; tabId: string }) {
  const workspace = useParentWorkspace<DemoTab>();

  return (
    <div className="h-full flex flex-col items-center justify-center gap-2 text-sm">
      <div>Clicked {count} times</div>
      <DemoButton
        onClick={() =>
          workspace?.updateTab(tabId, {
            data: { count: count + 1, kind: "saved-counter" }
          })
        }
      >
        Increment
      </DemoButton>
    </div>
  );
}

function SavedNotes({
  tabId,
  text,
  title
}: {
  tabId: string;
  text: string;
  title: string | undefined;
}) {
  const workspace = useParentWorkspace<DemoTab>();

  return (
    <textarea
      aria-label={title}
      className="w-full h-full p-3 text-sm bg-transparent resize-none outline-none"
      onChange={(event) =>
        workspace?.updateTab(tabId, {
          data: { kind: "saved-notes", text: event.target.value }
        })
      }
      placeholder="Type something, then drag this tab to another window…"
      value={text}
    />
  );
}

// Local state survives moving the tab, since tab content is never remounted
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="h-full flex flex-col items-center justify-center gap-2 text-sm">
      <div>Clicked {count} times</div>
      <DemoButton onClick={() => setCount(count + 1)}>Increment</DemoButton>
    </div>
  );
}
