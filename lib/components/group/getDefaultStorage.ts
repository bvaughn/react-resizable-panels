import { NOOP_FUNCTION } from "../../constants";

let defaultStorage: Storage | undefined = undefined;

// PanelGroup might be rendering in a server-side environment where localStorage is not available
// or on a browser with cookies/storage disabled.
// In either case, this function avoids accessing localStorage until needed,
// and avoids throwing user-visible errors.
export function getDefaultStorage() {
  try {
    if (typeof localStorage !== "undefined") {
      defaultStorage = localStorage;
    } else {
      throw new Error("localStorage not supported in this environment");
    }
  } catch (error) {
    console.error(error);

    defaultStorage = {
      clear: NOOP_FUNCTION,
      getItem: () => null,
      key: () => null,
      length: 0,
      removeItem: NOOP_FUNCTION,
      setItem: NOOP_FUNCTION
    };
  }

  return defaultStorage;
}
