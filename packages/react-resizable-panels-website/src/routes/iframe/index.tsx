import { useState } from "react";
import styles from "./styles.module.css";

export default function Page() {
  const [url] = useState(() => {
    const url = new URL(
      typeof window !== undefined ? window.location.href : ""
    );

    return `${url.origin}/__e2e/?urlPanelGroup=${url.searchParams.get(
      "urlPanelGroup"
    )}`;
  });

  return (
    <div className={styles.Root}>
      <iframe
        className={styles.IFrame}
        sandbox="allow-scripts"
        src={url}
      ></iframe>
    </div>
  );
}
