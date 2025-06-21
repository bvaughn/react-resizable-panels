import { Panel, PanelGroup } from "react-resizable-panels";

import { ResizeHandle } from "../../components/ResizeHandle";

import Example from "./Example";
import sharedStyles from "./shared.module.css";
import styles from "./CustomStep.module.css";

import { ChangeEvent, useState } from "react";

export default function CustomStepRoute() {
  return (
    <Example
      code={CODE}
      exampleNode={<Content />}
      headerNode={
        <>
          <p>
            This example is a 3-column horizontal <code>PanelGroup</code> with
            custom step size. You can change a step size by number input
          </p>
          <p>
            These panels use the <code>step</code> property to change the
            resizing behavior.
          </p>
        </>
      }
      title="Horizontal layouts with custom step size"
    />
  );
}

function Content() {
  const [step, setStep] = useState<number>(10);

  const onStepInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    console.log("size-input-left", value);
    setStep(parseFloat(value));
  };

  return (
    <>
      <div className={styles.ChangeStepRow}>
        <div className={styles.ChangeStepForm}>
          Custom Step
          <input
            className={styles.StepInput}
            id="stepInput"
            onChange={onStepInputChange}
            placeholder="Step (1 to 100)"
            type="text"
            value={step}
          />
        </div>
      </div>
      <div className={sharedStyles.PanelGroupWrapper}>
        <PanelGroup
          className={sharedStyles.PanelGroup}
          direction="horizontal"
          step={step}
        >
          <Panel
            className={sharedStyles.PanelRow}
            defaultSize={30}
            minSize={10}
          >
            <div className={sharedStyles.Centered}>left</div>
          </Panel>
          <ResizeHandle className={sharedStyles.ResizeHandle} />
          <Panel className={sharedStyles.PanelRow} defaultSize={10} minSize={5}>
            <div className={sharedStyles.Centered}>right</div>
          </Panel>
        </PanelGroup>
      </div>
    </>
  );
}

const CODE = `
  <PanelGroup direction="horizontal" step={step}>
    <Panel defaultSize={30} minSize={10}>
      <div>left</div>
    </Panel>
    <ResizeHandle />
    <Panel defaultSize={10} minSize={5}>
      <div >right</div>
    </Panel>
  </PanelGroup>
`;
