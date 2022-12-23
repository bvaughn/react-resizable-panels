import { useCallback, useState } from "react";

import PanelGroups from "./PanelGroups";

export default function DemoApp() {
  const [key, setKey] = useState(0);

  const clearSavedSizes = useCallback((...groupIds: string[]) => {
    groupIds.forEach((groupId) => {
      localStorage.removeItem(`PanelGroup:sizes:${groupId}`);
    });

    setKey((prevKey) => prevKey + 1);
  }, []);

  return <PanelGroups clearSavedSizes={clearSavedSizes} key={key} />;
}
