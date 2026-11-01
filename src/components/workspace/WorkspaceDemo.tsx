import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
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
  type TabsetNode,
  useParentTabset,
  useParentTabsetState,
  Workspace,
  type WorkspaceClassNames,
  type WorkspaceImperativeHandle,
  type WorkspaceModel,
  type WorkspaceProps,
  useWorkspaceRef
} from "react-resizable-panels";
import { initialModel } from "../../routes/examples/WorkspaceModel";
import { DemoButton } from "../DemoButton";
import { Group } from "../styled-panels/Group";
import { Panel } from "../styled-panels/Panel";
import { Separator as StyledSeparator } from "../styled-panels/Separator";

export type DemoTab = {
  kind: "about" | "counter" | "nested" | "notes" | "pinned";
};

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
 * The workspace on the basics page; its layout can be reset (but isn't saved).
 */
export function WorkspaceDemo() {
  return <DemoWorkspace defaultModel={initialModel} showResetButton />;
}

/**
 * Styled workspace shared by the docs pages.
 */
export function DemoWorkspace({
  canAddTabs,
  canCloseTabset,
  className,
  defaultModel,
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
  | "onModelChanged"
  | "renderEmptyTabset"
> & {
  canAddTabs?: (tabset: TabsetNode<DemoTab>) => boolean;
  canCloseTabset?: (tabset: TabsetNode<DemoTab>) => boolean;
  defaultModel: WorkspaceModel<DemoTab>;
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
        classNames={CLASS_NAMES}
        defaultModel={savedModel ?? defaultModel}
        renderEmptyTabset={renderEmptyTabset}
        renderSeparator={renderSeparator}
        renderTab={renderTab}
        renderTabContent={renderTabContent}
        renderTabsetToolbar={(tabset) => (
          <>
            {/* Adding tabs isn't restricted by the workspace, so the demo hides the button itself */}
            {!rest.disabled && (canAddTabs?.(tabset) ?? true) && (
              <AddTabButton />
            )}
            <MaximizeButton />
            {canCloseTabset?.(tabset) && <CloseTabsetButton />}
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
    "border-ink/10 data-[tab-placement=top]:border-b data-[tab-placement=bottom]:border-t data-[tab-placement=left]:border-r data-[tab-placement=right]:border-l"
  ),
  // Spaced like the VS Code demo's panels
  split: "gap-2 sm:gap-1",
  tab: cn(
    "group/tab relative flex shrink-0 items-center justify-center cursor-pointer select-none whitespace-nowrap",
    "px-3 has-[button]:pr-1 py-1 tabs-vertical:px-1 tabs-vertical:py-3",
    "text-ink/60 hover:text-ink data-[tab-selected]:text-ink data-[tab-dragging]:opacity-50",
    // The selected tab is underlined along the edge facing its content, like the VS Code demo's tabs
    "data-[tab-selected]:shadow-[inset_0_-2px_0_var(--color-violet-400)]",
    "data-[tab-placement=bottom]:data-[tab-selected]:shadow-[inset_0_2px_0_var(--color-violet-400)]",
    "data-[tab-placement=left]:data-[tab-selected]:shadow-[inset_-2px_0_0_var(--color-violet-400)]",
    "data-[tab-placement=right]:data-[tab-selected]:shadow-[inset_2px_0_0_var(--color-violet-400)]",
    // "!" is needed to override the site's global "outline: none"
    "focus-visible:outline-2! focus-visible:-outline-offset-2! focus-visible:outline-sky-400!",
    // Lines showing where a dragged tab will be inserted
    "before:absolute before:hidden data-[drop-before]:before:block before:bg-violet-400 before:inset-y-0 before:left-0 before:w-0.5",
    "tabs-vertical:before:inset-x-0 tabs-vertical:before:bottom-auto tabs-vertical:before:w-auto tabs-vertical:before:h-0.5",
    "after:absolute after:hidden data-[drop-after]:after:block after:bg-violet-400 after:inset-y-0 after:right-0 after:w-0.5",
    "tabs-vertical:after:inset-x-0 tabs-vertical:after:top-auto tabs-vertical:after:w-auto tabs-vertical:after:h-0.5"
  ),
  tabContent: "h-full overflow-auto",
  tabList: cn(
    "flex flex-1 min-w-0 min-h-0 self-stretch overflow-auto tabs-vertical:flex-col",
    // Fade the edges that have more tabs beyond them
    "[--fade-direction:to_right] tabs-vertical:[--fade-direction:to_bottom] [--fade-start:0px] [--fade-end:0px] data-[overflow-start]:[--fade-start:24px] data-[overflow-end]:[--fade-end:24px]",
    "[mask-image:linear-gradient(var(--fade-direction),transparent,black_var(--fade-start),black_calc(100%_-_var(--fade-end)),transparent)]"
  ),
  tabPanels: "grow min-h-0 min-w-0",
  tabset:
    "flex flex-col tabs-vertical:flex-row h-full w-full bg-ink/8 rounded-md overflow-hidden",
  toolbar:
    "flex tabs-vertical:flex-col tabs-vertical:items-center tabs-vertical:py-1"
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
    case "counter":
      return <Counter />;
    case "nested":
      return (
        <Group className="h-full p-2">
          <Panel id="left" minSize={40}>
            left
          </Panel>
          <StyledSeparator />
          <Panel id="right" minSize={40}>
            right
          </Panel>
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
    case "pinned":
      return (
        <div className="p-3 text-sm">
          This tab can't be closed or dragged, but other tabs can be dropped
          around it.
        </div>
      );
  }
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
