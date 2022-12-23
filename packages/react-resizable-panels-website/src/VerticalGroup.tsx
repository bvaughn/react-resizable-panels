import { Panel, PanelResizeHandle } from "react-resizable-panels";
import { useState } from "react";

import PanelGroup from "./AutoSizedPanelGroup";
import styles from "./styles.module.css";

export const GROUP_ID = "vertical";

export function VerticalGroup() {
  const [isPanelHidden, setIsPanelHidden] = useState(false);

  const hidePanel = () => setIsPanelHidden(true);
  const showPanel = () => setIsPanelHidden(false);

  return (
    <PanelGroup autoSaveId={GROUP_ID} direction="vertical">
      <Panel
        className={styles.PanelRow}
        defaultSize={0.35}
        id="top"
        minSize={0.25}
      >
        <div
          className={styles.VerticalFillerTop}
          style={{ backgroundColor: "var(--color-vertical)" }}
        >
          <p className={styles.ParagraphOfText}>
            This is a "<em>vertical</em>" <code>PanelGroup</code>.
          </p>
          <p className={styles.ParagraphOfText}>
            It has a solid resize bar, similar to Chrome devtools or VS Code.
          </p>
          <p className={styles.ParagraphOfText}>
            It uses the <code>minSize</code> prop to prevent it from shrinking
            to less than 35% of the total height.
          </p>
          {isPanelHidden && (
            <p className={styles.ParagraphOfText}>
              <button className={styles.Button} onClick={showPanel}>
                Show the bottom panel
              </button>
            </p>
          )}
        </div>
      </Panel>
      {isPanelHidden || (
        <Panel
          className={styles.PanelColumn}
          defaultSize={0.65}
          id="bottom"
          minSize={0.35}
        >
          <PanelResizeHandle panelBefore="top" panelAfter="bottom">
            <div className={styles.VerticalResizeBar} />
          </PanelResizeHandle>
          <div
            className={styles.VerticalFillerBottom}
            style={{ backgroundColor: "var(--color-vertical)" }}
          >
            <p className={styles.ParagraphOfText}>
              This panel's visibility can be toggled on or off.
            </p>
            <p className={styles.ParagraphOfText}>
              <button className={styles.Button} onClick={hidePanel}>
                Hide this panel
              </button>
            </p>
          </div>
        </Panel>
      )}
    </PanelGroup>
  );
}
