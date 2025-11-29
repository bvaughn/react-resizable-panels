import { getStorageKey } from "./auto-save/getStorageKey";
import injectedScript from "../../compiled/restoreSavedLayout?raw";
import type { StorageType } from "./types";

export function RestoreSavedLayout({
  autoSaveId,
  storageType
}: {
  autoSaveId: string;
  storageType: StorageType;
}) {
  const key = getStorageKey(autoSaveId);

  return (
    <script type="text/javascript">
      {`{
        ${injectedScript}

        restoreSavedLayout("${storageType}", "${autoSaveId}", "${key}");
      }`}
    </script>
  );
}
