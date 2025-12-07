import { useCallback, useRef } from "react";
import { loadGroupLayout } from "./auto-save/loadGroupLayout";
import { saveGroupLayout } from "./auto-save/saveGroupLayout";
import type { Layout, OnGroupLayoutChange } from "./types";

export function useDefaultLayout({
  groupId,
  storage
}: {
  groupId: string;
  storage: Pick<Storage, "getItem" | "setItem">;
}) {
  const defaultLayoutRef = useRef<Layout | undefined | null>(null);
  if (defaultLayoutRef.current === null) {
    defaultLayoutRef.current = loadGroupLayout({
      id: groupId,
      storage
    });
  }

  const onLayoutChange = useCallback<NonNullable<OnGroupLayoutChange>>(
    (layout) =>
      saveGroupLayout({
        id: groupId,
        layout,
        storage
      }),
    [groupId, storage]
  );

  return {
    defaultLayout: defaultLayoutRef.current,
    onLayoutChange
  };
}
