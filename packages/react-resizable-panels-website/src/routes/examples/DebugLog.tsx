import { RefObject, useImperativeHandle, useRef } from "react";
import { LogEntry } from "./types";

export type ImperativeDebugLogHandle = {
  log: (logEntry: LogEntry) => void;
};

// Used for e2e testing only
export default function DebugLog({
  apiRef,
}: {
  apiRef: RefObject<ImperativeDebugLogHandle>;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useImperativeHandle(apiRef, () => ({
    log: (logEntry: LogEntry) => {
      const div = ref.current;
      if (div) {
        try {
          let objectsArray: LogEntry[] = [];

          const textContent = div.textContent!.trim();
          if (textContent !== "") {
            objectsArray = JSON.parse(textContent) as LogEntry[];
          }

          objectsArray.push(logEntry);

          div.textContent = JSON.stringify(objectsArray);
        } catch (error) {}
      }
    },
  }));

  return (
    <div id="debug" ref={ref} style={{ display: "none" }}>
      []
    </div>
  );
}
