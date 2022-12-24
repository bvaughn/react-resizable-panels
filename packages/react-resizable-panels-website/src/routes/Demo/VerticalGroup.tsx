import { Panel, PanelResizeHandle } from "react-resizable-panels";
import { useState } from "react";

import PanelGroup from "../../components/AutoSizedPanelGroup";
import styles from "./styles.module.css";

export const GROUP_ID = "vertical";

export function VerticalGroup() {
  const [showTopPanel, setShowTopPanel] = useState(true);
  const [showBottomPanel, setShowBottomPanel] = useState(true);

  return (
    <div
      className={styles.VerticalFiller}
      style={{ backgroundColor: "var(--color-vertical)" }}
    >
      <PanelGroup autoSaveId={GROUP_ID} direction="vertical">
        {showTopPanel && (
          <Panel
            className={styles.PanelColumn}
            defaultSize={0.35}
            id="top"
            minSize={0.2}
            order={1}
          >
            <div className={styles.VerticalFiller}>
              <p className={styles.ParagraphOfText}>
                This is a "<em>vertical</em>" <code>PanelGroup</code>.
              </p>
              <p className={styles.ParagraphOfText}>
                <button
                  className={styles.Button}
                  onClick={() => setShowTopPanel(false)}
                >
                  Hide panel
                </button>
              </p>
            </div>
            <PanelResizeHandle>
              <div className={styles.VerticalResizeBar} />
            </PanelResizeHandle>
          </Panel>
        )}
        <Panel
          className={styles.PanelColumn}
          defaultSize={0.35}
          id="middle"
          minSize={0.35}
          order={2}
        >
          <div className={styles.VerticalFiller}>
            <p className={styles.ParagraphOfText}>
              This panel uses the <code>minSize</code> prop to prevent it from
              shrinking to less than 35% of the total height.
            </p>

            {!showTopPanel && (
              <button
                className={styles.ButtonTop}
                onClick={() => setShowTopPanel(true)}
              >
                Show top panel
              </button>
            )}

            {!showBottomPanel && (
              <button
                className={styles.ButtonBottom}
                onClick={() => setShowBottomPanel(true)}
              >
                Show bottom panel
              </button>
            )}
          </div>
        </Panel>
        {showBottomPanel && (
          <Panel
            className={styles.PanelColumn}
            defaultSize={0.65}
            id="bottom"
            minSize={0.2}
            order={3}
          >
            <PanelResizeHandle>
              <div className={styles.VerticalResizeBar} />
            </PanelResizeHandle>
            <div className={styles.VerticalFiller}>
              <p className={styles.ParagraphOfText}>
                This group uses a solid resize bar, similar to Chrome devtools
                or VS Code.
              </p>
              <p className={styles.ParagraphOfText}>
                <button
                  className={styles.Button}
                  onClick={() => setShowBottomPanel(false)}
                >
                  Hide panel
                </button>
              </p>
            </div>
          </Panel>
        )}
      </PanelGroup>
    </div>
  );
}
