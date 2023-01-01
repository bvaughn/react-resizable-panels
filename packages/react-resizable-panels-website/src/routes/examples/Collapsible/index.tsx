import { useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import Code from "../../../components/Code";
import Icon from "../../../components/Icon";

import Example from "../Example";
import sharedStyles from "../shared.module.css";

import styles from "./styles.module.css";

export default function CollapsibleRoute() {
  return (
    <Example
      code={CODE}
      exampleNode={<Content />}
      headerNode={
        <>
          <p>
            The example below uses the <code>collapsible</code> and{" "}
            <code>onCollapse</code> props to mimic the UX of apps like VS Code
            by configuring a panel to be <em>collapsible</em>.
          </p>
          <p>
            Drag the bar between the file browser and the source viewer to
            resize.
          </p>
        </>
      }
    />
  );
}

function Content() {
  const [fileListCollapsed, setFileListCollapsed] = useState(false);

  return (
    <div className={sharedStyles.PanelGroupWrapper}>
      <PanelGroup className={styles.IDE} direction="horizontal">
        <div className={styles.Toolbar}>
          <Icon className={styles.ToolbarIcon} type="files" />
          <Icon className={styles.ToolbarIcon} type="search" />
        </div>
        <Panel
          className={sharedStyles.PanelColumn}
          collapsible={true}
          defaultSize={20}
          onCollapse={setFileListCollapsed}
        >
          <div className={styles.FileList}>
            <div className={styles.DirectoryEntry}>src</div>
            <div className={styles.FileEntry} data-current>
              <div className={styles.FileIcon}>TS</div> Demo.tsx
            </div>
            <div className={styles.FileEntry}>
              <div className={styles.FileIcon}>#</div> Demo.module.css
            </div>
            <div className={styles.FileEntry}>
              <div className={styles.FileIcon}>{"<>"}</div> index.html
            </div>
          </div>
        </Panel>
        <PanelResizeHandle
          className={
            fileListCollapsed
              ? styles.ResizeHandleCollapsed
              : styles.ResizeHandle
          }
        />
        <Panel className={sharedStyles.PanelRow}>
          <Code
            className={sharedStyles.Overflow}
            code={TUTORIAL_CODE.trim()}
            language="jsx"
            showLineNumbers
          />
        </Panel>
      </PanelGroup>
    </div>
  );
}

const CODE = `
<PanelGroup direction="horizontal">
  <SideTabBar />
  <Panel collapsible={true}>
    <SourceBrowser />
  </Panel>
  <ResizeHandle />
  <Panel>
    <SourceViewer />
  </Panel>
</PanelGroup>
`;

const TUTORIAL_CODE = `
// https://reactjs.org/tutorial/tutorial.html#completing-the-game
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
`;
