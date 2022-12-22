import AutoSizer from "react-virtualized-auto-sizer";

import { Panel, PanelGroup, PanelResizeHandle } from "../src";

import styles from "./styles.module.css";

function clearSavedSizes() {
  localStorage.removeItem("PanelGroup:sizes:inner-horizontal");
  localStorage.removeItem("PanelGroup:sizes:outer-horizontal");
  localStorage.removeItem("PanelGroup:sizes:vertical");

  window.location.reload();
}

export default function App() {
  return (
    <div className={styles.FullHeightAndWidth}>
      <AutoSizer>
        {({ height, width }) => (
          <PanelGroup
            height={height}
            width={width}
            autoSaveId="outer-horizontal"
            direction="horizontal"
          >
            <Panel className={styles.PanelRow} defaultSize={0.2} id="left">
              <div className={styles.HorizontalFiller}>
                left [1]
                <br />
                <br />
                <button
                  className={styles.ResetButton}
                  onClick={clearSavedSizes}
                >
                  reset sizes
                </button>
              </div>
            </Panel>
            <Panel className={styles.PanelRow} defaultSize={0.4} id="middle">
              <PanelResizeHandle
                className={styles.HorizontalResizeHandle}
                panelBefore="left"
                panelAfter="middle"
              />
              <div className={styles.HorizontalFiller}>middle [3]</div>
              <PanelResizeHandle
                className={styles.HorizontalResizeHandle}
                panelBefore="middle"
                panelAfter="stacked"
              />
            </Panel>
            <Panel className={styles.PanelRow} defaultSize={0.3} id="stacked">
              <div className={styles.Grower}>
                <AutoSizer>
                  {({ height, width }) => (
                    <PanelGroup
                      height={height}
                      width={width}
                      autoSaveId="vertical"
                      direction="vertical"
                    >
                      <Panel
                        className={styles.PanelRow}
                        defaultSize={0.4}
                        id="top"
                      >
                        <div className={styles.VerticalFillerTop}>
                          top [2, 1]
                        </div>
                      </Panel>
                      <Panel
                        className={styles.PanelColumn}
                        defaultSize={0.6}
                        id="bottom"
                      >
                        <PanelResizeHandle
                          panelBefore="top"
                          panelAfter="bottom"
                        >
                          <div className={styles.VerticalResizeBar} />
                        </PanelResizeHandle>
                        <div className={styles.VerticalFillerBottom}>
                          <AutoSizer>
                            {({ height, width }) => (
                              <PanelGroup
                                height={height}
                                width={width}
                                autoSaveId="inner-horizontal"
                                direction="horizontal"
                              >
                                <Panel
                                  className={styles.PanelRow}
                                  defaultSize={0.5}
                                  id="bottom-left"
                                >
                                  <div className={styles.HorizontalFillerLeft}>
                                    bottom-left [2, 2, 1]
                                  </div>
                                </Panel>
                                <Panel
                                  className={styles.PanelRow}
                                  defaultSize={0.5}
                                  id="bottom-right"
                                >
                                  <PanelResizeHandle
                                    panelBefore="bottom-left"
                                    panelAfter="bottom-right"
                                  >
                                    <div
                                      className={styles.HorizontalResizeBar}
                                    />
                                  </PanelResizeHandle>
                                  <div className={styles.HorizontalFillerRight}>
                                    bottom-right [2, 2, 1]
                                  </div>
                                </Panel>
                              </PanelGroup>
                            )}
                          </AutoSizer>
                        </div>
                      </Panel>
                    </PanelGroup>
                  )}
                </AutoSizer>
              </div>
            </Panel>
            <Panel className={styles.PanelRow} defaultSize={0.2} id="right">
              <PanelResizeHandle
                className={styles.HorizontalResizeHandle}
                panelBefore="stacked"
                panelAfter="right"
              />
              <div className={styles.HorizontalFiller}>right [1]</div>
            </Panel>
          </PanelGroup>
        )}
      </AutoSizer>
    </div>
  );
}
