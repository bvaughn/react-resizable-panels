import type { WorkspaceChangeReason, WorkspaceModel } from "../types";

type LayoutUpdate = (prev: WorkspaceModel) => WorkspaceModel;

export type LayoutUpdateQueue = {
  queue: (
    splitId: string,
    reason: WorkspaceChangeReason,
    update: LayoutUpdate
  ) => void;
};

/**
 * Queues layouts the Workspace's Groups change themselves (see SplitView), to be written back to the model together,
 * in a microtask (before the browser paints), so that a change that affects several splits is reported once.
 *
 * ℹ️ Only each split's latest layout is kept, since a split can be measured more than once in a task (e.g. after its constraints change).
 *
 * ℹ️ Layouts measured for a split that has since changed aren't applied (see setMeasuredSplitLayout), so they don't count toward the reason;
 * the change is reported like a resize that collapses or expands tabsets (see getResizeReason), and isn't reported if no layout applies.
 *
 * ℹ️ Layouts aren't reported while the queue is inactive (e.g. the Workspace was unmounted before they were reported);
 * they're not discarded when it becomes inactive, since StrictMode unmounts and remounts the Workspace (without queuing them again) before they're reported.
 */
export function createLayoutUpdateQueue({
  apply,
  getModel,
  isActive
}: {
  apply: (reason: WorkspaceChangeReason, update: LayoutUpdate) => void;
  getModel: () => WorkspaceModel;
  isActive: () => boolean;
}): LayoutUpdateQueue {
  const pending = new Map<
    string,
    { reason: WorkspaceChangeReason; update: LayoutUpdate }
  >();

  const flush = () => {
    const updates = Array.from(pending.values());
    pending.clear();

    if (!isActive()) {
      return;
    }

    const model = getModel();
    const reasons = updates
      .filter(({ update }) => update(model) !== model)
      .map(({ reason }) => reason);
    if (reasons.length === 0) {
      return;
    }

    apply(
      reasons.includes("expand")
        ? "expand"
        : reasons.includes("collapse")
          ? "collapse"
          : "resize",
      (prev) => updates.reduce((next, { update }) => update(next), prev)
    );
  };

  return {
    queue: (splitId, reason, update) => {
      const isScheduled = pending.size > 0;
      pending.set(splitId, { reason, update });
      if (!isScheduled) {
        queueMicrotask(flush);
      }
    }
  };
}
