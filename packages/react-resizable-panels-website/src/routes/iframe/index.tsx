import { useMemo, useSyncExternalStore } from "react";
import styles from "./styles.module.css";

export default function Page() {
  const urlString = useSyncExternalStore(
    function subscribe(onChange) {
      window.addEventListener("navigate", onChange);
      return function unsubscribe() {
        window.removeEventListener("navigate", onChange);
      };
    },
    function read() {
      return window.location.href;
    }
  );

  const url = useMemo(() => new URL(urlString), [urlString]);

  return (
    <div className={styles.Root}>
      <iframe
        className={styles.IFrame}
        id="frame"
        sandbox={
          url.searchParams.has("sameOrigin") ? undefined : "allow-scripts"
        }
        src={`${url.origin}/__e2e/?urlPanelGroup=${url.searchParams.get(
          "urlPanelGroup"
        )}`}
      ></iframe>
    </div>
  );
}
