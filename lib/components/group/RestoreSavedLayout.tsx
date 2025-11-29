import { getStorageKey } from "./auto-save/getStorageKey";
import injectedScript from "../../compiled/restoreSavedLayout?raw";

// TODO How should this support storage:Storage?

export function RestoreSavedLayout({ autoSaveId }: { autoSaveId: string }) {
  const key = getStorageKey(autoSaveId);

  return (
    <script type="text/javascript">
      {`{
        ${injectedScript}

        restoreSavedLayout("${autoSaveId}", "${key}");
      }`}
    </script>
  );
}
