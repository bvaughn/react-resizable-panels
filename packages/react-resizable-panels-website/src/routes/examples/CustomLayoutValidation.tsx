import {
  Panel,
  PanelGroup,
  usePanelGroupLayoutValidator,
} from "react-resizable-panels";

import ResizeHandle from "../../components/ResizeHandle";

import AutoSizer from "react-virtualized-auto-sizer";
import styles from "./CustomLayoutValidation.module.css";
import Example from "./Example";
import sharedStyles from "./shared.module.css";

export default function CustomLayoutValidation() {
  return (
    <Example
      code={CODE}
      exampleNode={<Content />}
      headerNode={
        <>
          <p>
            Resizable panels typically use percentage-based layout constraints.
            <code>PanelGroup</code> also supports custom validation functions
            for pixel-base constraints.
          </p>
          <p>
            The examples below use the <code>usePanelGroupLayoutValidator</code>{" "}
            hook to set pixel constraints on certain panels.
          </p>
        </>
      }
      title="Custom layout validation"
    />
  );
}

function Content() {
  const validateLayoutLeft = usePanelGroupLayoutValidator({
    maxPixels: 200,
    minPixels: 100,
    position: "left",
  });
  const validateLayoutRight = usePanelGroupLayoutValidator({
    maxPixels: 200,
    minPixels: 100,
    position: "right",
  });

  return (
    <>
      <div className={sharedStyles.PanelGroupWrapper} data-short>
        <PanelGroup
          className={sharedStyles.PanelGroup}
          direction="horizontal"
          validateLayout={validateLayoutLeft}
        >
          <Panel className={sharedStyles.PanelRow}>
            <Size label="100px - 200px" />
          </Panel>
          <ResizeHandle className={sharedStyles.ResizeHandle} />
          <Panel className={sharedStyles.PanelRow}>
            <div className={sharedStyles.Centered}>
              <Labeled primary="middle" secondary="(normal)" />
            </div>
          </Panel>
          <ResizeHandle className={sharedStyles.ResizeHandle} />
          <Panel className={sharedStyles.PanelRow}>
            <div className={sharedStyles.Centered}>
              <Labeled primary="right" secondary="(normal)" />
            </div>
          </Panel>
        </PanelGroup>
      </div>
      <br />
      <div className={sharedStyles.PanelGroupWrapper} data-short>
        <PanelGroup
          className={sharedStyles.PanelGroup}
          direction="horizontal"
          validateLayout={validateLayoutRight}
        >
          <Panel className={sharedStyles.PanelRow}>
            <div className={sharedStyles.Centered}>
              <Labeled primary="left" secondary="(normal)" />
            </div>
          </Panel>
          <ResizeHandle className={sharedStyles.ResizeHandle} />
          <Panel className={sharedStyles.PanelRow}>
            <div className={sharedStyles.Centered}>
              <Labeled primary="middle" secondary="(normal)" />
            </div>
          </Panel>
          <ResizeHandle className={sharedStyles.ResizeHandle} />
          <Panel className={sharedStyles.PanelRow}>
            <Size label="100px - 200px" />
          </Panel>
        </PanelGroup>
      </div>
    </>
  );
}

function Size({ label }: { label: string }) {
  return (
    <AutoSizer disableHeight>
      {({ width }) => (
        <div
          className={sharedStyles.Centered}
          style={{ height: "100%", width: `${width}px` }}
        >
          <Labeled primary={`${width}px`} secondary={label} />
        </div>
      )}
    </AutoSizer>
  );
}

function Labeled({
  primary,
  secondary,
}: {
  primary: string;
  secondary: string;
}) {
  return (
    <center>
      <p className={styles.PrimaryLabel}>{primary}</p>
      <p className={styles.SecondaryLabel}>{secondary}</p>
    </center>
  );
}

const CODE = `
function validateLayout({
  availableHeight,
  availableWidth,
  nextSizes,
  prevSizes,
}: {
  availableHeight: number;
  availableWidth: number;
  nextSizes: number[];
  prevSizes: number[];
}) {
  // Compute and return an array of sizes (totalling 100)
}
`;
