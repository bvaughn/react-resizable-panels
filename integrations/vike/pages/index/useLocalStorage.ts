import { useMemo } from "react";
import type { LayoutStorage } from "react-resizable-panels";

export function useLocalStorage(): LayoutStorage {
  return useMemo(
    () => ({
      getItem: (key: string) => {
        if (typeof window !== "undefined") {
          return localStorage.getItem(key);
        }
        return null;
      },
      setItem: (key: string, value: string) => {
        if (typeof window !== "undefined") {
          localStorage.setItem(key, value);
        }
      }
    }),
    []
  );
}
