import { Panel } from "react-resizable-panels";

import PanelGroup from "../../components/AutoSizedPanelGroup";
import ResizeHandle from "../../components/ResizeHandle";
import styles from "./styles.module.css";
import { GROUP_ID as GROUP_ID_VERTICAL, VerticalGroup } from "./VerticalGroup";

export const GROUP_ID = "horizontal";

export default function HorizontalGroup({
  clearSavedSizes,
}: {
  clearSavedSizes: (...groupId: string[]) => void;
}) {
  return (
    <PanelGroup autoSaveId={GROUP_ID} direction="horizontal">
      <Panel className={styles.PanelRow} defaultSize={0.2} id="left">
        <div
          className={styles.HorizontalFiller}
          style={{ backgroundColor: "var(--color-horizontal)" }}
        >
          <p className={styles.ParagraphOfText}>
            This is a "<em>horizontal</em>" <code>PanelGroup</code>
          </p>
          <p className={styles.ParagraphOfText}>
            It has an empty/implied resize bar, like{" "}
            <a
              href="https://replay.io"
              target="_blank"
              rel="noreferrer noopener"
            >
              Replay.io
            </a>
            .
          </p>
          <p className={styles.ParagraphOfText}>
            It uses the <code>PanelContext</code> to show a highlight when
            dragging.
          </p>
        </div>
      </Panel>
      <Panel
        className={styles.PanelRow}
        defaultSize={0.4}
        id="middle"
        minSize={0.25}
      >
        <ResizeHandle id="left-handle" />
        <div
          className={styles.HorizontalFiller}
          style={{ backgroundColor: "var(--color-horizontal)" }}
        >
          <h2>Auto Save</h2>
          <p className={styles.ParagraphOfText}>
            This demo uses the <code>autoSaveId</code> prop to remember sizes.
          </p>
          <p className={styles.ParagraphOfText}>
            Reset saved sizes by clicking the buttons below.
          </p>
          <p className={styles.ParagraphOfText}>
            <button
              className={styles.Button}
              onClick={() => clearSavedSizes(GROUP_ID)}
            >
              reset horizontal sizes
              <div className={styles.HorizontalDot} />
            </button>
            <br />
            <button
              className={styles.Button}
              onClick={() => clearSavedSizes(GROUP_ID_VERTICAL)}
            >
              reset vertical sizes
              <div className={styles.VerticalDot} />
            </button>
            <span className={styles.HorizontalDivider} />
            <button
              className={styles.Button}
              onClick={() => clearSavedSizes(GROUP_ID, GROUP_ID_VERTICAL)}
            >
              reset both
              <div className={styles.HorizontalDot} />
              <div className={styles.VerticalDot} />
            </button>
          </p>
          <p className={styles.ParagraphOfText}>
            It won't shrink beyond 25% of the total width.
          </p>
        </div>
        <ResizeHandle id="middle-handle" />
      </Panel>
      <Panel className={styles.PanelRow} defaultSize={0.3} id="stacked">
        <div className={styles.Grower}>
          <VerticalGroup />
        </div>
      </Panel>
      <Panel className={styles.PanelRow} defaultSize={0.2} id="right">
        <ResizeHandle id="right-handle" />
        <div
          className={styles.HorizontalFiller}
          style={{ backgroundColor: "var(--color-horizontal)" }}
        >
          <p className={styles.ParagraphOfText}>
            Read more on{" "}
            <a
              href="https://github.com/bvaughn/react-resizable-panels"
              target="_blank"
              rel="noreferrer noopener"
            >
              GitHub
            </a>
            .
          </p>
        </div>
      </Panel>
    </PanelGroup>
  );
}
