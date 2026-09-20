import { useRef, useState } from "react";
import { getRegisteredGroup } from "../../global/mutable-state/groups";
import {
  getInteractionState,
  subscribeToInteractionState
} from "../../global/mutable-state/interactions";
import type {
  InteractionState,
  ResizePreview as ResizePreviewState
} from "../../global/mutable-state/types";
import { layoutNumbersEqual } from "../../global/utils/layoutNumbersEqual";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";
import type { ResizePreviewMode } from "./types";

export function useResizePreviews({
  groupId,
  resizePreviewMode
}: {
  groupId: string;
  resizePreviewMode: ResizePreviewMode;
}) {
  const [previews, setPreviews] = useState<ResizePreviewState[]>([]);

  const previewsRef = useRef(previews);

  useIsomorphicLayoutEffect(() => {
    const updatePreviews = (interaction: InteractionState) => {
      const group = getRegisteredGroup(groupId);
      const nextPreviews =
        resizePreviewMode === "separator" && interaction.state === "active"
          ? interaction.previews.filter(
              (preview) =>
                preview.group === group &&
                (preview.active || !layoutNumbersEqual(preview.offset, 0))
            )
          : [];
      const previousPreviews = previewsRef.current;
      if (
        previousPreviews.length === nextPreviews.length &&
        nextPreviews.every(
          (preview, index) => preview === previousPreviews[index]
        )
      ) {
        return;
      }

      previewsRef.current = nextPreviews;
      setPreviews(nextPreviews);
    };

    if (resizePreviewMode !== "separator") {
      updatePreviews(getInteractionState());
      return;
    }

    const unsubscribe = subscribeToInteractionState(({ next }) =>
      updatePreviews(next)
    );

    updatePreviews(getInteractionState());

    return unsubscribe;
  }, [groupId, resizePreviewMode]);

  return previews;
}
