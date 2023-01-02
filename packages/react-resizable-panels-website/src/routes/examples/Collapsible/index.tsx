import { useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import Code from "../../../components/Code";
import Icon, { IconType } from "../../../components/Icon";
import {
  TUTORIAL_CODE_CSS,
  TUTORIAL_CODE_HTML,
  TUTORIAL_CODE_JAVASCRIPT,
  TUTORIAL_CODE_README,
} from "../../../code";

import Example from "../Example";
import sharedStyles from "../shared.module.css";

import styles from "./styles.module.css";
import { Language } from "../../../suspense/SyntaxParsingCache";

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
  const [openFiles, setOpenFiles] = useState(new Set([DEFAULT_FILE]));
  const [currentFile, setCurrentFile] = useState(DEFAULT_FILE);
  const [fileListCollapsed, setFileListCollapsed] = useState(false);

  return (
    <div className={sharedStyles.PanelGroupWrapper}>
      <PanelGroup className={styles.IDE} direction="horizontal">
        <div className={styles.Toolbar}>
          <Icon className={styles.ToolbarIconActive} type="files" />
          <Icon className={styles.ToolbarIcon} type="search" />
        </div>
        <Panel
          className={sharedStyles.PanelColumn}
          collapsible={true}
          defaultSize={20}
          maxSize={25}
          onCollapse={setFileListCollapsed}
        >
          <div className={styles.FileList}>
            <div className={styles.DirectoryEntry}>
              <Icon className={styles.SourceIcon} type="chevron-down" />
              source
            </div>

            {FILES.map((file) => (
              <div
                className={styles.FileEntry}
                data-current={currentFile === file || undefined}
                key={file.fileName}
                onClick={() => {
                  setOpenFiles(() => {
                    const newOpenFiles = new Set(openFiles);
                    newOpenFiles.add(file);
                    return newOpenFiles;
                  });

                  setCurrentFile(file);
                }}
              >
                <Icon className={styles.FileIcon} type={file.type} />
                {file.fileName}
              </div>
            ))}
          </div>
        </Panel>
        <PanelResizeHandle
          className={
            fileListCollapsed
              ? styles.ResizeHandleCollapsed
              : styles.ResizeHandle
          }
        />
        <Panel className={sharedStyles.PanelColumn}>
          <div className={styles.SourceTabs}>
            {Array.from(openFiles).map((file) => (
              <div
                className={styles.SourceTab}
                data-current={currentFile === file || undefined}
                key={file.fileName}
                onClick={() => setCurrentFile(file)}
              >
                <Icon className={styles.FileIcon} type={file.type} />
                <span>{file.fileName}</span>
              </div>
            ))}
          </div>
          <Code
            className={sharedStyles.Overflow}
            code={currentFile.code.trim()}
            language={currentFile.language}
            showLineNumbers
          />
        </Panel>
      </PanelGroup>
    </div>
  );
}

const FILES: Array<{
  language: Language;
  type: IconType;
  fileName: string;
  code: string;
}> = [
  {
    language: "html",
    type: "html",
    fileName: "index.html",
    code: TUTORIAL_CODE_HTML,
  },
  {
    language: "markdown",
    type: "markdown",
    fileName: "README.md",
    code: TUTORIAL_CODE_README,
  },
  {
    language: "css",
    type: "css",
    fileName: "styles.css",
    code: TUTORIAL_CODE_CSS,
  },
  {
    language: "tsx",
    type: "typescript",
    fileName: "TicTacToe.ts",
    code: TUTORIAL_CODE_JAVASCRIPT,
  },
];

const DEFAULT_FILE = FILES[0];

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
