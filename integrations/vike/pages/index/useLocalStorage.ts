import { useEffect, useMemo, useState } from "react";
import type { LayoutStorage } from "react-resizable-panels";

export function useLocalStorage(): LayoutStorage {
  const [didMount, setDidMount] = useState(false);

  useEffect(() => {
    setDidMount(true);
  }, []);

  return useMemo(
    () => ({
      getItem: (key: string) => {
        if (didMount && typeof window !== "undefined") {
          return localStorage.getItem(key);
        }
        return null;
      },
      setItem: (key: string, value: string) => {
        if (didMount && typeof window !== "undefined") {
          localStorage.setItem(key, value);
        }
      }
    }),
    [didMount]
  );
}
