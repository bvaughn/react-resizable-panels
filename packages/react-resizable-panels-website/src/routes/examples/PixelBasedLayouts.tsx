import {
  Panel,
  PanelGroup,
  usePanelGroupLayoutValidator,
} from "react-resizable-panels";

import ResizeHandle from "../../components/ResizeHandle";

import { Link } from "react-router-dom";
import AutoSizer from "react-virtualized-auto-sizer";
import exampleStyles from "./Example.module.css";
import styles from "./PixelBasedLayouts.module.css";
import sharedStyles from "./shared.module.css";

import { PropsWithChildren } from "react";
import Code from "../../components/Code";
import { dir } from "console";

export default function PixelBasedLayouts() {
  const validateLayoutLeft = usePanelGroupLayoutValidator({
    maxPixels: 200,
    minPixels: 100,
    position: "left",
  });

  const validateLayoutRight = usePanelGroupLayoutValidator({
    collapseBelowPixels: 100,
    maxPixels: 300,
    minPixels: 200,
    position: "right",
  });

  const validateLayoutTop = usePanelGroupLayoutValidator({
    maxPixels: 125,
    minPixels: 75,
    position: "top",
  });

  return (
    <div className={exampleStyles.Route}>
      <h1 className={exampleStyles.Header}>
        <Link className={exampleStyles.HomeLink} to="/">
          Home
        </Link>
        →<span className={exampleStyles.Title}>Pixel based layouts</span>
      </h1>
      <p>
        Resizable panels typically use percentage-based layout constraints.
        <code>PanelGroup</code> also supports custom validation functions for
        pixel-base constraints.
      </p>
      <p>
        The easiest way to do this is with the{" "}
        <code>usePanelGroupLayoutValidator</code> hook, as shown in the example
        below.
      </p>
      <div className={exampleStyles.ExampleContainer}>
        <div className={sharedStyles.PanelGroupWrapper} data-short>
          <PanelGroup
            className={sharedStyles.PanelGroup}
            direction="horizontal"
            validateLayout={validateLayoutLeft}
          >
            <Panel className={sharedStyles.PanelRow}>
              <div className={styles.AutoSizerWrapper}>
                <Size direction="horizontal">
                  <p className={styles.Small}>100px - 200px</p>
                </Size>
              </div>
            </Panel>
            <ResizeHandle className={sharedStyles.ResizeHandle} />
            <Panel className={sharedStyles.PanelRow}>
              <div className={sharedStyles.Centered}>middle</div>
            </Panel>
            <ResizeHandle className={sharedStyles.ResizeHandle} />
            <Panel className={sharedStyles.PanelRow}>
              <div className={sharedStyles.Centered}>right</div>
            </Panel>
          </PanelGroup>
        </div>
      </div>
      <Code
        className={exampleStyles.Code}
        code={CODE_HOOK.trim()}
        language="jsx"
        showLineNumbers
      />
      <div className={exampleStyles.ExampleContainer}>
        <p>
          Panels with pixel constraints can also be configured to collapse as
          shown below
        </p>
      </div>
      <div className={exampleStyles.ExampleContainer}>
        <div className={sharedStyles.PanelGroupWrapper} data-short>
          <PanelGroup
            className={sharedStyles.PanelGroup}
            direction="horizontal"
            validateLayout={validateLayoutRight}
          >
            <Panel className={sharedStyles.PanelRow}>
              <div className={sharedStyles.Centered}>left</div>
            </Panel>
            <ResizeHandle className={sharedStyles.ResizeHandle} />
            <Panel className={sharedStyles.PanelRow}>
              <div className={sharedStyles.Centered}>middle</div>
            </Panel>
            <ResizeHandle className={sharedStyles.ResizeHandle} />
            <Panel className={sharedStyles.PanelRow}>
              <div className={styles.AutoSizerWrapper}>
                <Size direction="horizontal">
                  <p className={styles.Small}>200px - 300px</p>
                  <p className={styles.Small}>collapse below 100px</p>
                </Size>
              </div>
            </Panel>
          </PanelGroup>
        </div>
      </div>
      <Code
        className={exampleStyles.Code}
        code={CODE_HOOK_COLLAPSIBLE.trim()}
        language="jsx"
        showLineNumbers
      />
      <div className={exampleStyles.ExampleContainer}>
        <p>Vertical groups can also be managed with this hook.</p>
      </div>
      <div className={exampleStyles.ExampleContainer}>
        <div className={sharedStyles.PanelGroupWrapper}>
          <PanelGroup
            className={sharedStyles.PanelGroup}
            direction="vertical"
            validateLayout={validateLayoutTop}
          >
            <Panel className={sharedStyles.PanelColumn}>
              <div className={styles.AutoSizerWrapper}>
                <Size direction="vertical">
                  <p className={styles.Small}>75px - 125px</p>
                </Size>
              </div>
            </Panel>
            <ResizeHandle className={sharedStyles.ResizeHandle} />
            <Panel className={sharedStyles.PanelColumn}>
              <div className={sharedStyles.Centered}>middle</div>
            </Panel>
            <ResizeHandle className={sharedStyles.ResizeHandle} />
            <Panel className={sharedStyles.PanelColumn}>
              <div className={sharedStyles.Centered}>bottom</div>
            </Panel>
          </PanelGroup>
        </div>
      </div>
      <Code
        className={exampleStyles.Code}
        code={CODE_HOOK_VERTICAL.trim()}
        language="jsx"
        showLineNumbers
      />
      <div className={exampleStyles.ExampleContainer}>
        <p>
          The <code>validateLayout</code> prop can also be used directly to
          implement an entirely custom layout.
        </p>
      </div>
      <Code
        className={exampleStyles.Code}
        code={CODE_CUSTOM.trim()}
        language="tsx"
        showLineNumbers
      />
    </div>
  );
}

function Size({
  children,
  direction,
}: PropsWithChildren & {
  direction: "horizontal" | "vertical";
}) {
  return (
    <AutoSizer>
      {({ height, width }) => (
        <div
          className={styles.AutoSizerInner}
          style={{ height: `${height}px`, width: `${width}px` }}
        >
          <center>
            <p>{direction === "horizontal" ? width : height}px</p>
            {children}
          </center>
        </div>
      )}
    </AutoSizer>
  );
}

const CODE_HOOK = `
const validateLayout = usePanelGroupLayoutValidator({
  maxPixels: 200,
  minPixels: 100,
  position: "left",
});

<PanelGroup direction="horizontal" validateLayout={validateLayout}>
  {/* Panels ... */}
</PanelGroup>
`;

const CODE_HOOK_COLLAPSIBLE = `
const validateLayout = usePanelGroupLayoutValidator({
  collapseBelowPixels: 100,
  maxPixels: 300,
  minPixels: 200,
  position: "right",
});

<PanelGroup direction="horizontal" validateLayout={validateLayout}>
  {/* Panels ... */}
</PanelGroup>
`;

const CODE_HOOK_VERTICAL = `
const validateLayout = usePanelGroupLayoutValidator({
  maxPixels: 125,
  minPixels: 75,
  position: "top",
});

<PanelGroup direction="vertical" validateLayout={validateLayout}>
  {/* Panels ... */}
</PanelGroup>
`;

const CODE_CUSTOM = `
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
}): number[] {
  // Compute and return an array of sizes
  // Note the values in the sizes array should total 100
}
`;
