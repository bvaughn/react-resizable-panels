import { type CSSProperties } from "react";
import {
  Workspace,
  type ParentTabState,
  type TabNode,
  type TabsetNode,
  type WorkspaceModel
} from "react-resizable-panels";

type TabData = { isDirty: boolean; path: string };
type TabsetData = { accent?: string; compact?: boolean };

declare function Editor(props: { path: string }): null;
declare const initialModel: WorkspaceModel<TabData, TabsetData>;

// <begin>

const getHeaderClassName = (tabset: TabsetNode<TabData, TabsetData>) =>
  tabset.data?.compact ? "compact-header" : undefined;

const getTabClassName = (
  tab: TabNode<TabData>,
  { isSelected }: ParentTabState
) => (tab.data.isDirty && !isSelected ? "dirty-tab" : undefined);

const getTabsetStyle = (tabset: TabsetNode<TabData, TabsetData>) =>
  ({ "--accent": tabset.data?.accent }) as CSSProperties;

/* prettier-ignore */
<Workspace
  classNames={{
    header: getHeaderClassName,
    tab: getTabClassName
  }}
  defaultModel={initialModel}
  renderTabContent={(tab) => <Editor path={tab.data.path} />}
  styles={{ tabset: getTabsetStyle }}
/>;

// <end>
