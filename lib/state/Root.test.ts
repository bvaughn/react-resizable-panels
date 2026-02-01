import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { MutableGroup } from "./MutableGroup";
import {
  groups,
  pendingTransactions,
  registerGroup,
  registerPendingTransaction
} from "./Root";
import { MutableGroupForTest } from "./tests/MutableGroupForTest";

describe("Root", () => {
  describe("registerGroup", () => {
    test("should add and remove groups", () => {
      const group = new MutableGroupForTest();
      expect(groups).toHaveLength(0);

      const removeOne = registerGroup(group);
      expect(groups).toHaveLength(1);

      // No-op
      const removeTwo = registerGroup(group);
      expect(groups).toHaveLength(1);

      removeOne();
      expect(groups).toHaveLength(0);

      // No-op
      removeOne();
      removeTwo();
      expect(groups).toHaveLength(0);
    });
  });

  describe("registerPendingTransaction", () => {
    let group: MutableGroup;
    let remove: () => void;

    beforeEach(() => {
      group = new MutableGroupForTest();
      remove = registerGroup(group);
    });

    afterEach(() => {
      remove();
    });

    test("should register and unregister pending transactions", () => {
      expect(pendingTransactions).toHaveLength(0);

      const transaction = group.startLayoutTransaction();

      const removeOne = registerPendingTransaction(transaction);
      expect(pendingTransactions).toHaveLength(1);

      // No-op
      const removeTwo = registerPendingTransaction(transaction);
      expect(pendingTransactions).toHaveLength(1);

      removeOne();
      expect(pendingTransactions).toHaveLength(0);

      // No-op
      removeOne();
      removeTwo();
      expect(pendingTransactions).toHaveLength(0);

      transaction.endTransaction();
    });

    test("should auto-unregister pending transactions when they ends", () => {
      expect(pendingTransactions).toHaveLength(0);

      const transaction = group.startLayoutTransaction();

      const remove = registerPendingTransaction(transaction);
      expect(pendingTransactions).toHaveLength(1);

      transaction.endTransaction();
      expect(pendingTransactions).toHaveLength(0);

      // No-op
      remove();
      expect(pendingTransactions).toHaveLength(0);
    });

    test("should validate the transaction is pending", () => {
      const transaction = group.startLayoutTransaction();
      transaction.endTransaction();

      expect(() => {
        registerPendingTransaction(transaction);
      }).toThrow("Group transaction already ended");
    });

    test("should validate the group has been registered", () => {
      remove();

      const transaction = group.startLayoutTransaction();

      expect(() => {
        registerPendingTransaction(transaction);
      }).toThrow("Unregistered group");

      transaction.endTransaction();
    });
  });
});
