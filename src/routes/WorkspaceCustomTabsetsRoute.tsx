import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  DocumentTextIcon,
  PlusIcon,
  XMarkIcon
} from "@heroicons/react/16/solid";
import { Box, Callout, Code, Header, SectionHeader } from "react-lib-tools";
import {
  useParentTabset,
  useParentTabsetState,
  type WorkspaceModel
} from "react-resizable-panels";
import { html as ConfirmCloseHTML } from "../../public/generated/examples/WorkspaceCustomTabConfirmClose.json";
import { html as CustomTabsetHTML } from "../../public/generated/examples/WorkspaceCustomTabset.json";
import { html as HiddenTabsMenuHTML } from "../../public/generated/examples/WorkspaceHiddenTabsMenu.json";
import { html as OverflowToolbarHTML } from "../../public/generated/examples/WorkspaceOverflowToolbar.json";
import { html as RenamableTabHTML } from "../../public/generated/examples/WorkspaceRenamableTab.json";
import { Link } from "../components/Link";
import {
  DemoWorkspace,
  type DemoTab
} from "../components/workspace/WorkspaceDemo";
import { HiddenTabsMenu } from "./examples/WorkspaceHiddenTabsMenu";
import { OverflowToolbar } from "./examples/WorkspaceOverflowToolbar";

export default function WorkspaceCustomTabsetsRoute() {
  return (
    <Box direction="column" gap={4}>
      <Header section="Workspace" title="Custom tabsets" />
      <div>
        By default, each tabset shows a list of tabs (with close buttons) above
        its content. The <code>tabPlacement</code> prop moves the list to
        another <Link to="/examples/workspace/tab-placement">side</Link>, and
        these props customize what a tabset contains:
      </div>
      <ul className="list-disc pl-6">
        <li>
          <code>renderTab</code> renders each tab.
        </li>
        <li>
          <code>renderTabsetToolbar</code> renders content after the tabs (e.g.
          buttons to add a tab or maximize the tabset).
        </li>
        <li>
          <code>renderEmptyTabset</code> renders content in tabsets without
          tabs.
        </li>
      </ul>
      <Code html={CustomTabsetHTML} />
      <div>
        <code>renderTab</code> receives the props that make an element a tab
        (its role and ARIA attributes, keyboard and pointer handling, data
        attributes, and a <code>ref</code>); spread them onto the element it
        returns. The{" "}
        <Link to="/props/tab-close-button">
          <code>TabCloseButton</code>
        </Link>{" "}
        component closes the tab it's rendered within.
      </div>
      <Callout>
        Buttons, form controls (e.g. <code>input</code>), editable content, and
        elements with <code>role="button"</code> or a{" "}
        <code>data-tab-ignore</code> attribute within a tab don't select or drag
        it.
      </Callout>
      <div>
        Props can be overridden or wrapped. For example, to confirm before
        closing a tab with unsaved changes (whether by its close button or the
        Delete or Backspace key):
      </div>
      <Code html={ConfirmCloseHTML} />
      <SectionHeader>Renaming tabs</SectionHeader>
      <div>
        A tab can show an input in place of its title, e.g. after it's
        double-clicked, and save the new title with the <code>updateTab</code>{" "}
        method of the <Link to="/imperative-api/workspace">imperative API</Link>
        . Pressing Enter or moving focus away saves the title, and Escape
        cancels. Keys typed in the input don't move focus between tabs or close
        the tab.
      </div>
      <Code html={RenamableTabHTML} />
      <SectionHeader>Toolbars that run out of room</SectionHeader>
      <div>
        A tabset's tab list fills the space its tabs and toolbar don't use, so a
        toolbar can't tell how much room it has by measuring itself. The{" "}
        <Link to="/hooks/use-tab-list-free-space">
          <code>useTabListFreeSpace</code>
        </Link>{" "}
        hook returns the space in the tab list that its tabs don't use (negative
        once they overflow). A toolbar can use that space in addition to its
        own, e.g. to move items into a "…" menu once they no longer fit:
      </div>
      <Code html={OverflowToolbarHTML} />
      <Callout intent="warning">
        Place items only when the free space changes. Each value is measured
        with the toolbar as it's shown at the time, so it pairs with the
        toolbar's current size. Placing items again after the toolbar changes
        (but before the free space is measured again) counts the change twice,
        and the toolbar can keep switching between two layouts.
      </Callout>
      <div>
        Resize the tabsets below (or add tabs) to see their toolbars' items move
        into and out of their menus.
      </div>
      <DemoWorkspace
        className="h-60"
        defaultModel={overflowModel}
        renderTabsetToolbar={() => <DemoOverflowToolbar />}
        showResetButton
      />
      <Callout>
        The hook (like the <code>--tab-list-free-space</code> custom property on
        the tab list) is updated before the browser paints, so moved items are
        never shown in the wrong place. To read it outside of a tabset (e.g. a
        toolbar rendered elsewhere and portaled into the tabset), use the{" "}
        <code>getTabListFreeSpace</code> and{" "}
        <code>subscribeToTabListFreeSpace</code> methods of the{" "}
        <Link to="/imperative-api/workspace">imperative API</Link>; listeners
        are called synchronously, before the browser paints.
      </Callout>
      <SectionHeader>Tabs that don't fit</SectionHeader>
      <div>
        When a tabset has more tabs than fit, its tab list scrolls. The{" "}
        <Link to="/hooks/use-tab-list-overflow">
          <code>useTabListOverflow</code>
        </Link>{" "}
        hook returns which of its tabs are out of view (and which are only
        partly visible), e.g. for a menu that lists them:
      </div>
      <Code html={HiddenTabsMenuHTML} />
      <div>
        A selected tab is scrolled into view, however it's selected (e.g. from
        the menu, or with the <code>selectTab</code> method). In the workspace
        below, scroll the tab list (or make the tabset narrower) and select tabs
        from the menu.
      </div>
      <DemoWorkspace
        className="h-60"
        defaultModel={manyTabsModel}
        renderTabsetToolbar={(tabset) => <HiddenTabsMenu tabset={tabset} />}
        showResetButton
      />
      <Callout>
        To read which tabs are out of view outside of a tabset, use the{" "}
        <code>getTabListOverflow</code> and{" "}
        <code>subscribeToTabListOverflow</code> methods of the{" "}
        <Link to="/imperative-api/workspace">imperative API</Link>.
      </Callout>
      <div>
        Like the rest of the library, tabsets are unstyled; see{" "}
        <Link to="/examples/workspace/styling">styling</Link>.
      </div>
    </Box>
  );
}

const overflowModel: WorkspaceModel<DemoTab> = {
  version: 1,
  root: {
    type: "split",
    id: "root",
    orientation: "horizontal",
    children: [
      {
        type: "tabset",
        id: "left",
        size: 50,
        tabs: [
          { id: "counter", title: "Counter", data: { kind: "counter" } },
          { id: "notes", title: "Notes", data: { kind: "notes" } }
        ]
      },
      {
        type: "tabset",
        id: "right",
        size: 50,
        tabs: [{ id: "about", title: "About", data: { kind: "about" } }]
      }
    ]
  }
};

// One tabset with more tabs than fit (in the demo's width)
const manyTabsModel: WorkspaceModel<DemoTab> = {
  version: 1,
  root: {
    type: "split",
    id: "root",
    orientation: "horizontal",
    children: [
      {
        type: "tabset",
        id: "tabs",
        size: 55,
        tabs: (
          [
            ["orders", "Orders", "notes"],
            ["trades", "Trades", "counter"],
            ["positions", "Positions", "notes"],
            ["risk", "Risk", "counter"],
            ["alerts", "Alerts", "notes"],
            ["log", "Log", "about"],
            ["settings", "Settings", "about"],
            ["watchlist", "Watchlist", "notes"],
            ["reports", "Reports", "counter"],
            ["history", "History", "notes"]
          ] as const
        ).map(([id, title, kind]) => ({ data: { kind }, id, title }))
      },
      {
        type: "tabset",
        id: "about",
        size: 45,
        tabs: [{ id: "about", title: "About", data: { kind: "about" } }]
      }
    ]
  }
};

function createId() {
  return crypto.randomUUID();
}

function DemoOverflowToolbar() {
  const tabset = useParentTabset<DemoTab>();
  const state = useParentTabsetState();

  return (
    <OverflowToolbar
      items={[
        {
          icon: <PlusIcon className="w-4 h-4" />,
          label: "Add counter",
          onClick: () =>
            tabset?.addTab({
              data: { kind: "counter" },
              id: createId(),
              title: "Counter"
            })
        },
        {
          icon: <DocumentTextIcon className="w-4 h-4" />,
          label: "Add notes",
          onClick: () =>
            tabset?.addTab({
              data: { kind: "notes" },
              id: createId(),
              title: "Notes"
            })
        },
        state?.isMaximized
          ? {
              icon: <ArrowsPointingInIcon className="w-4 h-4" />,
              label: "Restore tabset",
              onClick: () => tabset?.restore()
            }
          : {
              icon: <ArrowsPointingOutIcon className="w-4 h-4" />,
              label: "Maximize tabset",
              onClick: () => tabset?.maximize()
            },
        {
          icon: <XMarkIcon className="w-4 h-4" />,
          label: "Close tabset",
          onClick: () => tabset?.close()
        }
      ]}
    />
  );
}
