import { Wakeable } from "./types";

let CIRCULAR_THENABLE_CHECK_MAX_COUNT = 1_000;

// A "thennable" is a subset of the Promise API.
// We could use a Promise as thennable, but Promises have a downside: they use the microtask queue.
// An advantage to creating a custom thennable is synchronous resolution (or rejection).
//
// A "wakeable" is a "thennable" that has convenience resolve/reject methods.
export default function createWakeable<T>(debugLabel: string): Wakeable<T> {
  const resolveCallbacks: Set<(value: T) => void> = new Set();
  const rejectCallbacks: Set<(error: Error) => void> = new Set();

  let status: "unresolved" | "resolved" | "rejected" = "unresolved";
  let data: T | Error | null = null;

  let callbacksRegisteredAfterResolutionCount = 0;

  // Guard against a case where promise resolution results in a new wakeable listener being added.
  // That cause would result in an infinite loop.
  // Note that our guard counter should be somewhat high to avoid false positives.
  // It is a legitimate use-case to register handlers after a wakeable has been resolved or rejected.
  const checkCircularThenableChain = () => {
    if (
      ++callbacksRegisteredAfterResolutionCount >
      CIRCULAR_THENABLE_CHECK_MAX_COUNT
    ) {
      throw Error(
        `Circular thenable chain detected (infinite loop) for resource:\n${debugLabel}`
      );
    }
  };

  const wakeable: Wakeable<T> = {
    then(
      resolveCallback: (value: T) => void,
      rejectCallback: (error: Error) => void
    ) {
      switch (status) {
        case "unresolved":
          resolveCallbacks.add(resolveCallback);
          rejectCallbacks.add(rejectCallback);
          break;
        case "rejected":
          checkCircularThenableChain();
          rejectCallback(data as Error);
          break;
        case "resolved":
          checkCircularThenableChain();
          resolveCallback(data as T);
          break;
      }
    },
    reject(error: Error) {
      if (status !== "unresolved") {
        throw Error(`Wakeable has already been ${status}`);
      }

      status = "rejected";
      data = error;

      rejectCallbacks.forEach((rejectCallback) => {
        let thrownValue = null;

        try {
          rejectCallback(error);
        } catch (error) {
          thrownValue = error;
        }

        if (thrownValue !== null) {
          throw thrownValue;
        }
      });

      rejectCallbacks.clear();
      resolveCallbacks.clear();
    },
    resolve(value: T) {
      if (status !== "unresolved") {
        throw Error(`Wakeable has already been ${status}`);
      }

      status = "resolved";
      data = value;

      resolveCallbacks.forEach((resolveCallback) => {
        let thrownValue = null;

        try {
          resolveCallback(value);
        } catch (error) {
          thrownValue = error;
        }

        if (thrownValue !== null) {
          throw thrownValue;
        }
      });

      rejectCallbacks.clear();
      resolveCallbacks.clear();
    },
  };

  return wakeable;
}
