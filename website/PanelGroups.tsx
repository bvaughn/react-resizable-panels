import {
  Panel,
  PanelGroup as PanelGroupWithSizes,
  PanelResizeHandle,
} from "../src";

import styles from "./styles.module.css";
import withAutoSizer from "./withAutoSizer";

const PanelGroup = withAutoSizer(PanelGroupWithSizes);

const GROUP_ID_HORIZONTAL = "horizontal";
const GROUP_ID_VERTICAL = "vertical";

export default function PanelGroups({
  clearSavedSizes,
}: {
  clearSavedSizes: (...groupId: string[]) => void;
}) {
  return (
    <div className={styles.FullHeightAndWidth}>
      <PanelGroup autoSaveId={GROUP_ID_HORIZONTAL} direction="horizontal">
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
          </div>
        </Panel>
        <Panel
          className={styles.PanelRow}
          defaultSize={0.4}
          id="middle"
          minSize={0.25}
        >
          <PanelResizeHandle
            className={styles.HorizontalResizeHandle}
            panelBefore="left"
            panelAfter="middle"
          />
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
                className={styles.ResetButton}
                onClick={() => clearSavedSizes(GROUP_ID_HORIZONTAL)}
              >
                reset horizontal sizes
                <div className={styles.HorizontalDot} />
              </button>
              <br />
              <button
                className={styles.ResetButton}
                onClick={() => clearSavedSizes(GROUP_ID_VERTICAL)}
              >
                reset vertical sizes
                <div className={styles.VerticalDot} />
              </button>
              <hr />
              <button
                className={styles.ResetButton}
                onClick={() =>
                  clearSavedSizes(GROUP_ID_HORIZONTAL, GROUP_ID_VERTICAL)
                }
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
          <PanelResizeHandle
            className={styles.HorizontalResizeHandle}
            panelBefore="middle"
            panelAfter="stacked"
          />
        </Panel>
        <Panel className={styles.PanelRow} defaultSize={0.3} id="stacked">
          <div className={styles.Grower}>
            <PanelGroup autoSaveId={GROUP_ID_VERTICAL} direction="vertical">
              <Panel
                className={styles.PanelRow}
                defaultSize={0.65}
                id="top"
                minSize={0.35}
              >
                <div
                  className={styles.VerticalFillerTop}
                  style={{ backgroundColor: "var(--color-vertical)" }}
                >
                  <p className={styles.ParagraphOfText}>
                    This is a "<em>vertical</em>" <code>PanelGroup</code>.
                  </p>
                  <p className={styles.ParagraphOfText}>
                    It has a solid resize bar, similar to Chrome devtools or
                    Code.
                  </p>
                  <p className={styles.ParagraphOfText}>
                    It won't shrink beyond 35% of the total height.
                  </p>
                </div>
              </Panel>
              <Panel
                className={styles.PanelColumn}
                defaultSize={0.35}
                id="bottom"
                minSize={0.25}
              >
                <PanelResizeHandle panelBefore="top" panelAfter="bottom">
                  <div className={styles.VerticalResizeBar} />
                </PanelResizeHandle>
                <div
                  className={styles.VerticalFillerBottom}
                  style={{ backgroundColor: "var(--color-vertical)" }}
                >
                  <p className={styles.ParagraphOfText}>
                    It uses the <code>minSize</code> prop to prevent it from
                    shrinking past 25% of the total height.
                  </p>
                </div>
              </Panel>
            </PanelGroup>
          </div>
        </Panel>
        <Panel className={styles.PanelRow} defaultSize={0.2} id="right">
          <PanelResizeHandle
            className={styles.HorizontalResizeHandle}
            panelBefore="stacked"
            panelAfter="right"
          />
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
    </div>
  );
}
