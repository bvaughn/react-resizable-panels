import { Panel, PanelResizeHandle } from "react-resizable-panels";

import PanelGroup from "./AutoSizedPanelGroup";
import styles from "./styles.module.css";

export const GROUP_ID = "vertical";

export function VerticalGroup() {
  return (
    <PanelGroup autoSaveId={GROUP_ID} direction="vertical">
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
            It has a solid resize bar, similar to Chrome devtools or VS Code.
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
            It uses the <code>minSize</code> prop to prevent it from shrinking
            past 25% of the total height.
          </p>
        </div>
      </Panel>
    </PanelGroup>
  );
}
