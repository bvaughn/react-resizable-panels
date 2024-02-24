import { useReducer } from "react";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  assert,
} from "react-resizable-panels";
import {
  TUTORIAL_CODE_CSS,
  TUTORIAL_CODE_HTML,
  TUTORIAL_CODE_JAVASCRIPT,
  TUTORIAL_CODE_README,
} from "../../code";
import Code from "../../components/Code";
import Icon from "../../components/Icon";
import { Language } from "../../suspense/SyntaxParsingCache";
import styles from "./Collapsible.module.css";
import Example from "./Example";
import sharedStyles from "./shared.module.css";

export default function CollapsibleRoute() {
  return (
    <Example
      code={CODE}
      exampleNode={<Content />}
      headerNode={
        <>
          <p>
            The example below uses the <code>collapsedSize</code>,{" "}
            <code>collapsible</code>, and <code>onCollapse</code> props to mimic
            the UX of apps like VS Code by configuring a panel to be{" "}
            <em>collapsible</em>. Panels can be collapsed all the way (to size
            0) but in this example, the panel is configured to collapse to a
            size that allows the file icons to remain visible.
          </p>
          <p>
            Drag the bar between the file browser and the source viewer to
            resize.
          </p>
        </>
      }
      title="Collapsible panels"
    />
  );
}

function Content() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const { currentFileIndex, fileListCollapsed, openFiles } = state;

  const currentFile = openFiles[currentFileIndex] ?? null;

  const closeFile = (file: File) => {
    dispatch({ type: "close", file });
  };

  const openFile = (file: File) => {
    dispatch({ type: "open", file });
  };

  const onCollapse = () => {
    dispatch({ type: "toggleCollapsed", collapsed: false });
  };

  const onExpand = () => {
    dispatch({ type: "toggleCollapsed", collapsed: true });
  };

  return (
    <div className={sharedStyles.PanelGroupWrapper}>
      <PanelGroup className={styles.IDE} direction="horizontal">
        <div className={styles.Toolbar}>
          <Icon className={styles.ToolbarIconActive} type="files" />
          <Icon className={styles.ToolbarIcon} type="search" />
        </div>
        <Panel
          className={sharedStyles.PanelColumn}
          collapsedSize={5}
          collapsible={true}
          defaultSize={15}
          maxSize={20}
          minSize={15}
          onCollapse={onCollapse}
          onExpand={onExpand}
        >
          <div className={styles.FileList}>
            <div className={styles.DirectoryEntry}>
              <Icon className={styles.SourceIcon} type="chevron-down" />
              <div className={styles.DirectoryName}>source</div>
            </div>

            {FILES.map((file) => (
              <div
                className={styles.FileEntry}
                data-current={currentFile === file || undefined}
                key={file.fileName}
                onClick={(event) => openFile(file)}
                title={file.fileName}
              >
                <Icon className={styles.FileIcon} type={file.language as any} />
                <div className={styles.FileName}>{file.fileName}</div>
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
        <Panel className={sharedStyles.PanelColumn} minSize={50}>
          <div className={styles.SourceTabs}>
            {Array.from(openFiles).map((file) => (
              <div
                className={styles.SourceTab}
                data-current={currentFile === file || undefined}
                key={file.fileName}
                onClick={() => openFile(file)}
              >
                <Icon className={styles.FileIcon} type={file.language as any} />
                <span>{file.fileName}</span>
                <button
                  className={styles.CloseButton}
                  onClick={(event) => {
                    event.stopPropagation();
                    closeFile(file);
                  }}
                >
                  <Icon className={styles.CloseIcon} type="close" />
                </button>
              </div>
            ))}
          </div>
          {currentFile && (
            <Code
              className={sharedStyles.Overflow}
              code={currentFile.code.trim()}
              language={currentFile.language}
              showLineNumbers
            />
          )}
        </Panel>
      </PanelGroup>
    </div>
  );
}

type File = {
  code: string;
  language: Language;
  fileName: string;
  path: string[];
};

const FILE_PATHS: Array<[path: string, code: string]> = [
  ["source/index.html", TUTORIAL_CODE_HTML],
  ["source/README.md", TUTORIAL_CODE_README],
  ["source/styles.css", TUTORIAL_CODE_CSS],
  ["source/TicTacToe.ts", TUTORIAL_CODE_JAVASCRIPT],
];

const FILES: File[] = FILE_PATHS.map(([path, code]) => {
  const pathArray = path.split("/");
  const fileName = pathArray.pop()!;

  return {
    code,
    fileName,
    language: inferLanguageFromFileName(fileName),
    path: pathArray,
  };
});

const CODE = `
<PanelGroup direction="horizontal">
  <SideTabBar />
  <Panel collapsible={true} collapsedSize={35} minSize={10}>
    <SourceBrowser />
  </Panel>
  <PanelResizeHandle />
  <Panel>
    <SourceViewer />
  </Panel>
</PanelGroup>
`;

type CloseAction = { type: "close"; file: File };
type OpenAction = { type: "open"; file: File };
type ToggleCollapsedAction = { type: "toggleCollapsed"; collapsed: boolean };

export type FilesAction = CloseAction | OpenAction | ToggleCollapsedAction;

type FilesState = {
  currentFileIndex: number;
  fileListCollapsed: boolean;
  openFiles: File[];
};

const FIRST_FILE = FILES[0];
assert(FIRST_FILE, "No file found");

const initialState: FilesState = {
  currentFileIndex: 0,
  fileListCollapsed: false,
  openFiles: [FIRST_FILE],
};

function reducer(state: FilesState, action: FilesAction): FilesState {
  switch (action.type) {
    case "close": {
      const { file } = action;
      const { currentFileIndex, openFiles } = state;

      let fileIndex = openFiles.findIndex(
        ({ fileName }) => fileName === file.fileName
      );
      if (fileIndex === -1) {
        // File not open; this shouldn't happen.
        return state;
      }

      const newOpenFiles = openFiles.concat();
      newOpenFiles.splice(fileIndex, 1);

      let newCurrentFileIndex = currentFileIndex;
      if (newCurrentFileIndex >= newOpenFiles.length) {
        newCurrentFileIndex = newOpenFiles.length - 1;
      }

      return {
        ...state,
        currentFileIndex: newCurrentFileIndex,
        openFiles: newOpenFiles,
      };
    }
    case "open": {
      const { file } = action;
      const { openFiles } = state;
      const fileIndex = openFiles.findIndex(
        ({ fileName }) => fileName === file.fileName
      );
      if (fileIndex >= 0) {
        return {
          ...state,
          currentFileIndex: fileIndex,
        };
      } else {
        const newOpenFiles = [...openFiles, file];

        return {
          ...state,
          currentFileIndex: openFiles.length,
          openFiles: newOpenFiles,
        };
      }
    }
    case "toggleCollapsed": {
      return { ...state, fileListCollapsed: action.collapsed };
    }
    default: {
      throw `Unknown action type: ${(action as any).type}`;
    }
  }
}

function inferLanguageFromFileName(fileName: string): Language {
  const extension = fileName.split(".").pop();

  switch (extension) {
    case "css":
      return "css";
    case "htm":
    case "html":
      return "html";
    case "js":
      return "javascript";
    case "jsx":
      return "jsx";
    case "md":
      return "markdown";
    case "tsx":
      return "tsx";
    case "ts":
      return "typescript";
    default:
      throw Error(`Unsupported extension "${extension}"`);
  }
}
