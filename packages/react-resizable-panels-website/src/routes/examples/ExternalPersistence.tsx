import { useMemo } from "react";
import { Panel, PanelGroup, PanelGroupStorage } from "react-resizable-panels";
import { useNavigate } from "react-router-dom";

import { ResizeHandle } from "../../components/ResizeHandle";

import Example from "./Example";
import styles from "./shared.module.css";
import Icon from "../../components/Icon";

export default function ExternalPersistence() {
  return (
    <Example
      code={CODE}
      exampleNode={<Content />}
      headerNode={
        <>
          <p>
            By default, a <code>PanelGroup</code> with an{" "}
            <code>autoSaveId</code> will store layout information in{" "}
            <code>localStorage</code>. This example shows how the how to use the{" "}
            <code>storage</code> prop to override that behavior. For this demo,
            layout is saved as part of the URL hash.
          </p>
          <p className={styles.WarningBlock}>
            <Icon className={styles.WarningIcon} type="warning" />
            Note the <code>storage</code> API is <em>synchronous</em>. If an
            async source is used (e.g. a database) then values should be
            pre-fetched during the initial render (e.g. using Suspense).
          </p>
          <p className={styles.WarningBlock}>
            <Icon className={styles.WarningIcon} type="warning" />
            Note calls to <code>storage.setItem</code> are debounced by{" "}
            <strong>100ms</strong>. Depending on your implementation, you may
            wish to use a larger interval than that.
          </p>
        </>
      }
      title="External persistence"
    />
  );
}

function Content() {
  const navigate = useNavigate();

  const urlStorage = useMemo<PanelGroupStorage>(
    () => ({
      getItem(name: string) {
        try {
          const raw = decodeURI(window.location.hash.substring(1));
          if (raw) {
            const parsed = JSON.parse(raw);
            return parsed[name] || "";
          }
        } catch (error) {
          console.error(error);

          return "";
        }
      },
      setItem(name: string, value: string) {
        const encoded = encodeURI(
          JSON.stringify({
            [name]: value,
          })
        );

        // Update the hash without interfering with the browser's Back button.
        navigate("#" + encoded, { replace: true });
      },
    }),
    [navigate]
  );

  return (
    <div className={styles.PanelGroupWrapper}>
      <PanelGroup
        autoSaveId="example"
        className={styles.PanelGroup}
        direction="horizontal"
        storage={urlStorage}
      >
        <Panel className={styles.PanelRow} collapsible={true} minSize={10}>
          <div className={styles.Centered}>left</div>
        </Panel>
        <ResizeHandle className={styles.ResizeHandle} />
        <Panel className={styles.PanelRow} minSize={10}>
          <div className={styles.Centered}>middle</div>
        </Panel>
        <ResizeHandle className={styles.ResizeHandle} />
        <Panel className={styles.PanelRow} collapsible={true} minSize={10}>
          <div className={styles.Centered}>right</div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

const CODE = `
const navigate = useNavigate();

const urlStorage = useMemo(() => ({
  getItem(name) {
    try {
      const parsed = JSON.parse(decodeURI(window.location.hash.substring(1)));
      return parsed[name] || "";
    } catch (error) {
      console.error(error);
      return "";
    }
  },
  setItem(name, value) {
    const encoded = encodeURI(JSON.stringify({
      [name]: value
    }));

    // Update the hash without interfering with the browser's Back button.
    navigate('#' + encoded, { replace: true });
  }
}), [navigate]);

<PanelGroup autoSaveId="example" direction="horizontal" storage={urlStorage}>
  <Panel>left</Panel>
  <PanelResizeHandle />
  <Panel>middle</Panel>
  <PanelResizeHandle />
  <Panel>right</Panel>
</PanelGroup>
`;
