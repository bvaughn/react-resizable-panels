import { useCallback, useState } from "react";
import { loadGroupLayout } from "./auto-save/loadGroupLayout";
import { saveGroupLayout } from "./auto-save/saveGroupLayout";
import type { Layout, OnGroupLayoutChange } from "./types";

export function useDefaultLayout({
  groupId,
  storage = localStorage
}: {
  groupId: string;
  storage?: Pick<Storage, "getItem" | "setItem">;
}) {
  const [defaultLayout] = useState<Layout | undefined>(() =>
    loadGroupLayout({
      id: groupId,
      storage
    })
  );

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
    defaultLayout,
    onLayoutChange
  };
}
