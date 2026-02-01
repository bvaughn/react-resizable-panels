import type { RefObject } from "react";
import type { Point } from "../types";
import { assert } from "../utils/assert";
import type { GroupLayoutTransaction } from "./GroupLayoutTransaction";
import type { MutableGroup } from "./MutableGroup";

export const cursorFlags: RefObject<number> = { current: 0 };
export const groups: MutableGroup[] = [];
export const pendingTransactions: GroupLayoutTransaction[] = [];
export const pointerDownAtPoint: RefObject<Point | null> = { current: null };

export function registerGroup(group: MutableGroup) {
  const index = groups.indexOf(group);
  if (index < 0) {
    groups.push(group);
  }

  return function unregisterGroup() {
    const index = groups.indexOf(group);
    if (index >= 0) {
      groups.splice(index, 1);
    }
  };
}

export function registerPendingTransaction(
  transaction: GroupLayoutTransaction
) {
  assert(transaction.isPending, "Group transaction already ended");
  assert(groups.includes(transaction.group), "Unregistered group");

  const index = pendingTransactions.indexOf(transaction);
  if (index < 0) {
    pendingTransactions.push(transaction);
  }

  function unregisterPendingTransaction() {
    const index = pendingTransactions.indexOf(transaction);
    if (index >= 0) {
      pendingTransactions.splice(index, 1);
    }

    removeListener();
  }

  const removeListener = transaction.group.addListener(
    "transactionEnded",
    unregisterPendingTransaction
  );

  return unregisterPendingTransaction;
}

export function registerPointerDownAtPoint(point: Point | null) {
  pointerDownAtPoint.current = point;
}
