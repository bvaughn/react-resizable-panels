import { useCallback, useState } from "react";

import HorizontalGroup from "./HorizontalGroup";
import styles from "./styles.module.css";

export default function DemoApp() {
  const [key, setKey] = useState(0);

  const clearSavedSizes = useCallback((...groupIds: string[]) => {
    groupIds.forEach((groupId) => {
      localStorage.removeItem(`PanelGroup:sizes:${groupId}`);
    });

    setKey((prevKey) => prevKey + 1);
  }, []);

  return (
    <div className={styles.FullHeightAndWidth}>
      <HorizontalGroup clearSavedSizes={clearSavedSizes} key={key} />
    </div>
  );
}
