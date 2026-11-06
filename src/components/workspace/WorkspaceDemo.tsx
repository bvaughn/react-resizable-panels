import {
  ArrowTopRightOnSquareIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  Bars3Icon,
  MinusIcon,
  PlusIcon,
  XMarkIcon
} from "@heroicons/react/16/solid";
import { type PropsWithChildren, type RefObject, useState } from "react";
import { cn } from "react-lib-tools";
import {
  type Orientation,
  TabCloseButton,
  type TabNode,
  type TabRenderProps,
  TabsetDragHandle,
  type TabsetNode,
  useParentTabset,
  useParentTabsetState,
  useParentWorkspace,
  useWorkspaceRef,
  Workspace,
  type WorkspaceClassNames,
  type WorkspaceImperativeHandle,
  type WorkspaceModel,
  type WorkspaceProps
} from "react-resizable-panels";
import { initialModel } from "../../routes/examples/WorkspaceModel";
import { DemoButton } from "../DemoButton";
import { Group } from "../styled-panels/Group";
import { Panel } from "../styled-panels/Panel";
import { Separator as StyledSeparator } from "../styled-panels/Separator";

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
  showResetButton = false,
  storageKey,
  tabPlacement = "top",
  workspaceRef: workspaceRefProp,
  ...rest
}: Pick<
  WorkspaceProps<DemoTab>,
  | "className"
  | "disabled"
  | "disableDrop"
  | "dragGroup"
  | "onModelChanged"
  | "onTearOff"
  | "renderDragPreview"
  | "renderEmptyTabset"
  | "renderTabsetToolbar"
  | "tabRemovalSelectionBehavior"
> & {
  canAddTabs?: (tabset: TabsetNode<DemoTab>) => boolean;
  canCloseTabset?: (tabset: TabsetNode<DemoTab>) => boolean;
  defaultModel: WorkspaceModel<DemoTab>;
  // Use the Workspace's default (unstyled) separators, rather than the docs' styled ones
  defaultSeparators?: boolean;
  // Shows a button that opens the tabset's selected tab in a new window
  onPopOut?: (tabset: TabsetNode<DemoTab>, tab: TabNode<DemoTab>) => void;
  // Tabsets are dragged by a handle in their toolbars, rather than by the empty space in their headers
  showDragHandles?: boolean;
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
              <CollapseButton />
              <MaximizeButton />
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

function renderSeparator(orientation: Orientation) {
  return (
    <StyledSeparator
      // The icon is vertical, so it's rotated for separators between tabsets stacked vertically
      className={orientation === "vertical" ? "[&>svg]:rotate-90" : undefined}
      orientation={orientation}
      // Like the tabs, only shown for keyboard focus (and not after a separator is dragged)
      useFocusPseudoClasses
    />
  );
}

const CLASS_NAMES: WorkspaceClassNames = {
  dragPreview:
    "-translate-x-1/2 -translate-y-[calc(100%+4px)] px-2 py-1 rounded bg-violet-700 text-white text-sm whitespace-nowrap shadow-lg",
  // "!" is needed to override the site's global "transition: none"
  dropIndicator:
    "bg-violet-400/25 border-2 border-violet-400 rounded-sm transition-[inset]! duration-250! motion-reduce:transition-none!",
  // At least as tall (or wide, for tabs on the left or right) as a tab, so an empty tabset's header is the same size
  header: cn(
    "flex shrink-0 items-center min-h-7 tabs-vertical:min-h-0 tabs-vertical:min-w-7 tabs-vertical:flex-col tabs-vertical:items-stretch text-sm",
    // Separated from the tab panels by a line, like the VS Code demo's tabs
    // (logical properties, since tabs placed on the "left" are at the start of the tabset: on the right, in a right-to-left layout)
    "border-ink/10 data-[tab-placement=top]:border-b data-[tab-placement=bottom]:border-t data-[tab-placement=left]:border-e data-[tab-placement=right]:border-s"
  ),
  // Spaced like the VS Code demo's panels
  split: "gap-2 sm:gap-1",
  tab: cn(
    "group/tab relative flex shrink-0 items-center justify-center cursor-pointer select-none whitespace-nowrap",
    "px-3 has-[button]:pe-1 py-1 tabs-vertical:px-1 tabs-vertical:py-3",
    "text-ink/60 hover:text-ink data-[tab-selected]:text-ink data-[tab-dragging]:opacity-50",
    // The selected tab is underlined along the edge facing its content, like the VS Code demo's tabs
    "data-[tab-selected]:shadow-[inset_0_-2px_0_var(--color-violet-400)]",
    "data-[tab-placement=bottom]:data-[tab-selected]:shadow-[inset_0_2px_0_var(--color-violet-400)]",
    // (box shadows don't have logical offsets, so they're flipped by --inline-sign; see tabset)
    "data-[tab-placement=left]:data-[tab-selected]:shadow-[inset_calc(-2px*var(--inline-sign))_0_0_var(--color-violet-400)]",
    "data-[tab-placement=right]:data-[tab-selected]:shadow-[inset_calc(2px*var(--inline-sign))_0_0_var(--color-violet-400)]",
    // "!" is needed to override the site's global "outline: none"
    "focus-visible:outline-2! focus-visible:-outline-offset-2! focus-visible:outline-sky-400!",
    // Lines showing where a dragged tab will be inserted
    "before:absolute before:hidden data-[drop-before]:before:block before:bg-violet-400 before:inset-y-0 before:start-0 before:w-0.5",
    "tabs-vertical:before:inset-x-0 tabs-vertical:before:bottom-auto tabs-vertical:before:w-auto tabs-vertical:before:h-0.5",
    "after:absolute after:hidden data-[drop-after]:after:block after:bg-violet-400 after:inset-y-0 after:end-0 after:w-0.5",
    "tabs-vertical:after:inset-x-0 tabs-vertical:after:top-auto tabs-vertical:after:w-auto tabs-vertical:after:h-0.5"
  ),
  tabContent: "h-full overflow-auto",
  tabList: cn(
    "flex flex-1 min-w-0 min-h-0 self-stretch overflow-auto tabs-vertical:flex-col",
    // Fade the edges that have more tabs beyond them (gradients don't have logical directions, so the angle is flipped by --inline-sign; see tabset)
    "[--fade-direction:calc(90deg*var(--inline-sign))] tabs-vertical:[--fade-direction:to_bottom] [--fade-start:0px] [--fade-end:0px] data-[overflow-start]:[--fade-start:24px] data-[overflow-end]:[--fade-end:24px]",
    "[mask-image:linear-gradient(var(--fade-direction),transparent,black_var(--fade-start),black_calc(100%_-_var(--fade-end)),transparent)]"
  ),
  tabPanels: "grow min-h-0 min-w-0",
  tabset: cn(
    "flex flex-col tabs-vertical:flex-row h-full w-full bg-ink/8 rounded-md overflow-hidden data-[tabset-dragging]:opacity-50",
    // 1 in left-to-right layouts and -1 in right-to-left ones, for styles that don't have logical equivalents (see tab and tabList)
    "[--inline-sign:1] rtl:[--inline-sign:-1]"
  ),
  toolbar:
    "flex tabs-vertical:flex-col tabs-vertical:items-center tabs-vertical:py-1"
};

// The default separators take up no space, so a gap on either side of one would look like two gaps;
// half as much gap leaves the same space between tabsets as there is on either side of a visible separator
const CLASS_NAMES_DEFAULT_SEPARATORS: WorkspaceClassNames = {
  ...CLASS_NAMES,
  split: "gap-1 sm:gap-0.5"
};

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

// Hidden when the selected tab can't be dragged (so it couldn't be torn off either)
function PopOutButton({
  onPopOut,
  tabset
}: {
  onPopOut: (tabset: TabsetNode<DemoTab>, tab: TabNode<DemoTab>) => void;
  tabset: TabsetNode<DemoTab>;
}) {
  const tab = tabset.tabs.find(({ id }) => id === tabset.selectedId);
  if (!tab || tab.disableDrag) {
    return null;
  }

  return (
    <TabsetButton
      onClick={() => onPopOut(tabset, tab)}
      title="Open in new window"
    >
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

// Only shown for tabsets that can be collapsed
function CollapseButton() {
  const tabset = useParentTabset();
  const state = useParentTabsetState();

  if (!state?.isCollapsible || state.isMaximized) {
    return null;
  }

  return (
    <TabsetButton onClick={() => tabset?.collapse()} title="Collapse tabset">
      <MinusIcon className="w-4 h-4" />
    </TabsetButton>
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

function MaximizeButton() {
  const tabset = useParentTabset();
  const state = useParentTabsetState();
  const isMaximized = !!state?.isMaximized;

  if (state?.isRoot) {
    return null;
  }

  return (
    <TabsetButton
      onClick={() => (isMaximized ? tabset?.restore() : tabset?.maximize())}
      title={isMaximized ? "Restore tabset" : "Maximize tabset"}
    >
      {isMaximized ? (
        <ArrowsPointingInIcon className="w-4 h-4" />
      ) : (
        <ArrowsPointingOutIcon className="w-4 h-4" />
      )}
    </TabsetButton>
  );
}

function TabsetButton({
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
            Drag a tab (or a tabset) out of the window to open it in a popup
            window, or use the "Open in new window" button in a tabset's
            toolbar. Tabs can be dragged between this window and the popups.
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
